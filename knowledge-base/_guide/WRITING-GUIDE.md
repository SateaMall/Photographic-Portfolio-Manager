# Knowledge base writing guide

This folder feeds the Let Me Lens chatbot through retrieval (RAG). Every rule below exists because the
chatbot only sees **one section at a time**, and because **visitors name things by what they see and
click, never by how the code calls them**.

Files and folders starting with `_` (this guide, `_eval/`) are **not ingested**.

## 1. The golden rule: use the words on the screen

- Name every screen, button, menu and field **exactly as it is written on the website**, in bold:
  click **Profile**, then **My Studio**. Copy the capitalisation and the spelling, even when the UI
  has a typo (the menu link really says **Exemple**).
- Never use code names: no component names, no route names, no internal enums.
  - Write **Collections**, not "albums module". (The UI says "collection" almost everywhere, but a few
    buttons say **Create album** and **Delete album**: document both.)
  - Write **Carousel / Slides**, not "hero photos".
  - Write **Homepage photo order**, not "grid feature".
- When one thing has several names on the site, list all of them. Example: the owner area is reached
  through **My Studio** (desktop menu) or **Configuration** (mobile menu), and its pages say **Manage**.
- Put the words users are likely to type in `keywords` and in the "Questions this answers" list
  (dashboard, settings, admin, account, upload, pictures…).
- A URL is a secondary hint ("the address bar shows `letmelens.com/your-link/manage/photos`"), never the
  main instruction. Users click; they rarely type addresses.

## 2. One file = one topic, one `##` section = one answer

- A file covers one task or one screen. If you need "and" twice to describe it, split it.
- Each `##` section must make sense **alone**: restate the subject ("On Let Me Lens, the
  **Save photos** button…") instead of "it", "this page" or "as said above".
- Sections should be about 80–400 words. Long sections get split by size and lose their meaning.
- Headings are phrased the way users ask: "How do I add photos to a collection?" rather than
  "Collection photo management".

## 3. Inside a section

1. **Answer first**, in one or two sentences.
2. **Prerequisites before the steps** ("You must be signed in.").
3. **Numbered steps**, one click per step, with what happens after it.
4. **Exact limits and numbers**: 15 MB, 4-digit code, 15 minutes, 8 characters.
5. **Quote error messages verbatim** in the troubleshooting docs so they can be matched.
6. Facts only. Personality, tone and greetings belong to the chatbot's system prompt, not here.
7. Never invent a feature. If something is not possible, say so plainly ("There is no button to make a
   collection private").

## 4. Front matter (YAML, at the top of every file)

```yaml
---
id: studio-upload-photos          # unique, kebab-case, never reused
title: How to upload photos       # human title, phrased as a task or question
audience: owner                   # visitor | owner | everyone
category: feature                 # core | site | feature | faq | legal | tech | about
screen: New photo                 # screen name as written in the UI ("" if not a screen)
ui_path: "Profile → My Studio → New photo"   # click path in UI words
route: /{your-link}/manage/photos#queue      # address bar hint, secondary ("" if none)
requires_login: true
keywords: [add photos, import pictures]      # the words users type, incl. synonyms
related: [studio-reorder-photos]             # ids of related files
status: published                 # published | needs-input  (only "published" is ingested)
last_updated: 2026-11-25          # date the content was last checked against the site/code
---
```

## 5. Ingestion notes (for whoever builds the pipeline)

- Ingest only `status: published` files outside `_*` folders.
- Always put `00-core/core-profile.md` in the system prompt; retrieve everything else.
- Split on `##` headings (for example with `MarkdownHeaderTextSplitter` from
  `langchain-text-splitters`, headers `#` and `##`), then size-split only sections that are too long.
- Prefix every chunk with `title` and the heading path, e.g.
  `How to upload photos > What file types and sizes are accepted?`, before embedding and before
  building the keyword index.
- Keep the front matter as metadata (filter by `audience`, cite `title`, link `route`). The
  `keywords` list is worth adding to the chunk text too, so keyword search matches user vocabulary.
- Drop the "Questions this answers" section into every chunk of its file, or index it as its own
  chunk that points back to the file: it is the part written in the users' own words.
- Re-ingest a file when its content hash changes; delete its old chunks first.

## 6. Keeping it true

- When a label, limit or flow changes in the code, update the matching file in the same change and
  bump `last_updated`.
- One fact lives in one place. Link to it with `related` instead of copying it.
- Public information only: no secrets, no server settings, no security internals, no private data
  about Satea beyond what Satea approved.
