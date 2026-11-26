import hashlib
import json
import os
import time
from pathlib import Path

import frontmatter
from fastapi import FastAPI, HTTPException
from ollama import ResponseError
from pydantic import BaseModel, Field
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_ollama import ChatOllama, OllamaEmbeddings
from langchain_text_splitters import MarkdownHeaderTextSplitter

# --- Settings: environment variables, with defaults that work on your PC ---
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
KB_DIR = Path(os.getenv("KB_DIR", Path(__file__).resolve().parents[2] / "knowledge-base"))
CACHE_DIR = Path(os.getenv("CACHE_DIR", Path(__file__).resolve().parents[1] / ".cache"))
MIN_SCORE = float(os.getenv("MIN_SCORE", "0.3"))
BATCH_SIZE = 8

QUERY_PREFIX = ("Instruct: Given a question about the LetMeLens website, "
                "retrieve passages that answer it\nQuery: ")
FALLBACK_MESSAGE = ("Sorry, I don't have information about that yet. "
                    "I can answer questions about LetMeLens features and its creator.")
SYSTEM_PROMPT = """You are the LetMeLens assistant. LetMeLens is a photography portfolio website.
Answer the visitor's question using ONLY the information below.
If that information does not contain the answer, say you don't know. Never guess.
When explaining how to do something, use the page and button names exactly as written.
Keep answers short: 2-4 sentences, or a short list of steps.
Never mention "the context" or "the documents"; just answer naturally."""

# --- The two models ---
embeddings = OllamaEmbeddings(model="qwen3-embedding:0.6b", base_url=OLLAMA_URL,
                              client_kwargs={"timeout": 120})
llm = ChatOllama(model="qwen3.5:2b-q4_K_M", base_url=OLLAMA_URL, reasoning=False,
                 temperature=0.2, num_ctx=4096, num_predict=300)


# --- Ingestion: docs -> chunks ---
def load_chunks():
    splitter = MarkdownHeaderTextSplitter([("#", "title"), ("##", "section")], strip_headers=False)
    chunks = []
    for path in KB_DIR.rglob("*.md"):
        if any(part.startswith("_") for part in path.relative_to(KB_DIR).parts):
            continue  # skip _guide/ and _eval/
        post = frontmatter.load(path)
        if post.get("status") != "published":
            continue
        for chunk in splitter.split_text(post.content):
            chunk.page_content = f"{post.get('title', path.stem)}\n{chunk.page_content}"
            chunk.metadata |= {"source": path.name, "route": post.get("route")}
            chunks.append(chunk)
    return chunks


# --- Vector store: embed once, then reuse the cached file ---
def build_store() -> InMemoryVectorStore:
    chunks = load_chunks()
    # The file name changes whenever a doc or the model changes, so the cache is never outdated.
    fingerprint = json.dumps([embeddings.model, [[c.page_content, c.metadata] for c in chunks]],
                             sort_keys=True)
    cache_file = CACHE_DIR / f"vectors-{hashlib.sha256(fingerprint.encode()).hexdigest()[:12]}.json"
    if cache_file.exists():
        print(f"Loaded {len(chunks)} chunks from {cache_file.name}", flush=True)
        return InMemoryVectorStore.load(str(cache_file), embeddings)

    store = InMemoryVectorStore(embeddings)
    start = time.perf_counter()
    for i in range(0, len(chunks), BATCH_SIZE):
        store.add_documents(chunks[i:i + BATCH_SIZE])
        done = min(i + BATCH_SIZE, len(chunks))
        print(f"Embedded {done}/{len(chunks)} chunks ({time.perf_counter() - start:.0f} s)", flush=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    store.dump(str(cache_file))
    return store


store = build_store()

# --- The API ---
app = FastAPI(title="LetMeLens assistant")


class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=500)


@app.get("/health")
def health():
    return {"status": "ok", "chunks": len(store.store)}


@app.post("/api/chat")
def chat(req: ChatRequest):
    try:
        results = store.similarity_search_with_score(QUERY_PREFIX + req.question, k=4)
        hits = [(doc, score) for doc, score in results if score >= MIN_SCORE]
        if not hits:
            return {"answer": FALLBACK_MESSAGE, "sources": [],
                    "scores": [round(s, 3) for _, s in results]}
        context = "\n\n".join(doc.page_content for doc, _ in hits)
        reply = llm.invoke([
            ("system", SYSTEM_PROMPT),
            ("human", f"Context:\n{context}\n\nQuestion: {req.question}"),
        ])
    except (ConnectionError, ResponseError) as exc:
        # Ollama unreachable or the model crashed: log one line, answer cleanly.
        print(f"Ollama error: {exc}", flush=True)
        raise HTTPException(status_code=503,
                            detail="The assistant is temporarily unavailable. Please try again in a moment.")
    return {
        "answer": reply.content,
        "sources": sorted({doc.metadata["source"] for doc, _ in hits}),
        "scores": [round(s, 3) for _, s in hits],  # temporary, for tuning MIN_SCORE
    }
