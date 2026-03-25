// src/App.tsx

import { useMemo, useState } from "react";
import {
  uploadPhoto,
  deletePhoto,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  addPhotoToAlbum,
  removePhotoFromAlbum,
  getAlbum,
} from "./admin_api";
import {
  type Scope,
  type Theme,
  type Owner} from "../types/types"


const THEMES: { value: Theme; label: string }[] = [
  { value: "STREET_SOCIETY", label: "Street & Society" },
  { value: "PEOPLE_EMOTION", label: "People & Emotion" },
  { value: "NATURE_ENVIRONMENT", label: "Nature & Environment" },
  { value: "ARCHITECTURE_SPACES", label: "Architecture & Spaces" },
  { value: "CONCEPTUAL_ARTISTIC", label: "Conceptual & Artistic" },
  { value: "DOCUMENTARY_SOCIAL", label: "Documentary & Social" },
];

const OWNERS: Owner[] = ["SATEA", "ALEXIS"];
const SCOPES: Scope[] = ["SATEA", "ALEXIS", "SHARED"];

function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 16, marginBottom: 16 }}>
      <h2 style={{ marginTop: 0 }}>{props.title}</h2>
      {props.children}
    </div>
  );
}

function Row(props: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 12, marginBottom: 10 }}>
      <div style={{ fontWeight: 600 }}>{props.label}</div>
      <div>{props.children}</div>
    </div>
  );
}

export default function AdminPage() {
  const [log, setLog] = useState<any>(null);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [owner, setOwner] = useState<Owner>("SATEA");
  const [albumId, setAlbumId] = useState("");
  const [themes, setThemes] = useState<Theme[]>([]);
  // Photo delete
  const [photoIdToDelete, setPhotoIdToDelete] = useState("");

  // Album create/update/delete
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumScope, setAlbumScope] = useState<Scope>("SATEA");
  const [albumDesc, setAlbumDesc] = useState("");

  const [albumIdToUpdate, setAlbumIdToUpdate] = useState("");
  const [albumIdToDelete, setAlbumIdToDelete] = useState("");

  // Add/remove photo to album
  const [linkAlbumId, setLinkAlbumId] = useState("");
  const [linkPhotoId, setLinkPhotoId] = useState("");
  const [position, setPosition] = useState<string>("");

  const selectedThemesLabel = useMemo(() => themes.join(", "), [themes]);

  function toggleTheme(t: Theme) {
    setThemes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  async function run<T>(fn: () => Promise<T>) {
    try {
      const res = await fn();
      setLog(res);
    } catch (e: any) {
      setLog({ error: String(e?.message ?? e) });
    }
  }
const [albumIdToShow, setAlbumIdToShow] = useState("");
const [album, setAlbum] = useState<import("./admin_api").AlbumResponse | null>(null);


  return (
    <div style={{ maxWidth: 980, margin: "24px auto", padding: "0 16px", fontFamily: "system-ui" }}>
      <h1 style={{ marginTop: 0 }}>Photo Gallery — Admin API Tester</h1>
      <p style={{ color: "#555" }}>
        Base URL: <code>{import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"}</code>
      </p>

      <Card title="1) Upload Photo">
        <Row label="File">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </Row>

        <Row label="Owner">
          <select value={owner} onChange={(e) => setOwner(e.target.value as Owner)}>
            {OWNERS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Row>

        <Row label="Album ID (optional)">
          <input
            value={albumId}
            onChange={(e) => setAlbumId(e.target.value)}
            placeholder="UUID or empty"
            style={{ width: "100%" }}
          />
        </Row>

        <Row label="Themes (optional)">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {THEMES.map((t) => (
              <label key={t.value} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={themes.includes(t.value)}
                  onChange={() => toggleTheme(t.value)}
                />
                {t.label}
              </label>
            ))}
          </div>
          <div style={{ marginTop: 8, color: "#666" }}>
            Selected: <code>{selectedThemesLabel || "(none)"}</code>
          </div>
        </Row>

        <button
          onClick={() =>
            run(() => {
              if (!file) throw new Error("Pick a file first.");
              return uploadPhoto({
                file,
                owner,
                albumId: albumId.trim() || undefined,
                themes,
              });
            })
          }
        >
          Upload
        </button>
      </Card>

      <Card title="2) Delete Photo">
        <Row label="Photo ID">
          <input
            value={photoIdToDelete}
            onChange={(e) => setPhotoIdToDelete(e.target.value)}
            placeholder="Photo UUID"
            style={{ width: "100%" }}
          />
        </Row>
        <button onClick={() => run(() => deletePhoto(photoIdToDelete.trim()))}>Delete Photo</button>
      </Card>

      <Card title="3) Create Album">
        <Row label="Title">
          <input value={albumTitle} onChange={(e) => setAlbumTitle(e.target.value)} style={{ width: "100%" }} />
        </Row>

        <Row label="Scope">
          <select value={albumScope} onChange={(e) => setAlbumScope(e.target.value as Scope)}>
            {SCOPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Row>

        <Row label="Description (optional)">
          <input value={albumDesc} onChange={(e) => setAlbumDesc(e.target.value)} style={{ width: "100%" }} />
        </Row>

        <button
          onClick={() =>
            run(() =>
              createAlbum({
                title: albumTitle.trim(),
                scope: albumScope,
                description: albumDesc.trim() || undefined,
              })
            )
          }
        >
          Create Album
        </button>
      </Card>

      <Card title="4) Update Album (supports your current controller signature)">
        <Row label="Album ID">
          <input
            value={albumIdToUpdate}
            onChange={(e) => setAlbumIdToUpdate(e.target.value)}
            placeholder="Album UUID"
            style={{ width: "100%" }}
          />
        </Row>

        <Row label="Title">
          <input value={albumTitle} onChange={(e) => setAlbumTitle(e.target.value)} style={{ width: "100%" }} />
        </Row>

        <Row label="Scope">
          <select value={albumScope} onChange={(e) => setAlbumScope(e.target.value as Scope)}>
            {SCOPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Row>

        <Row label="Description (optional)">
          <input value={albumDesc} onChange={(e) => setAlbumDesc(e.target.value)} style={{ width: "100%" }} />
        </Row>

        <button
          onClick={() =>
            run(() =>
              updateAlbum({
                id: albumIdToUpdate.trim(),
                title: albumTitle.trim(),
                scope: albumScope,
                description: albumDesc.trim() || undefined,
              })
            )
          }
        >
          Update Album
        </button>
      </Card>

      <Card title="5) Add Photo to Album (supports your current controller signature)">
        <Row label="Album ID">
          <input value={linkAlbumId} onChange={(e) => setLinkAlbumId(e.target.value)} style={{ width: "100%" }} />
        </Row>
        <Row label="Photo ID">
          <input value={linkPhotoId} onChange={(e) => setLinkPhotoId(e.target.value)} style={{ width: "100%" }} />
        </Row>
        <Row label="Position (optional)">
          <input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="e.g. 0, 1, 2..."
            style={{ width: "100%" }}
          />
        </Row>
        <button
          onClick={() =>
            run(() =>
              addPhotoToAlbum({
                albumId: linkAlbumId.trim(),
                photoId: linkPhotoId.trim(),
                position: position.trim() === "" ? undefined : Number(position),
              })
            )
          }
        >
          Add Link
        </button>
      </Card>

      <Card title="6) Remove Photo From Album">
        <Row label="Album ID">
          <input value={linkAlbumId} onChange={(e) => setLinkAlbumId(e.target.value)} style={{ width: "100%" }} />
        </Row>
        <Row label="Photo ID">
          <input value={linkPhotoId} onChange={(e) => setLinkPhotoId(e.target.value)} style={{ width: "100%" }} />
        </Row>
        <button onClick={() => run(() => removePhotoFromAlbum(linkAlbumId.trim(), linkPhotoId.trim()))}>
          Remove Link
        </button>
      </Card>

      <Card title="7) Delete Album (supports your current controller signature)">
        <Row label="Album ID">
          <input
            value={albumIdToDelete}
            onChange={(e) => setAlbumIdToDelete(e.target.value)}
            placeholder="Album UUID"
            style={{ width: "100%" }}
          />
        </Row>
        <button onClick={() => run(() => deleteAlbum(albumIdToDelete.trim()))}>Delete Album</button>
      </Card>

      <Card title="Response / Debug">
        <pre
          style={{
            margin: 0,
            padding: 12,
            background: "#0b1020",
            color: "#d6e3ff",
            borderRadius: 10,
            overflowX: "auto",
          }}
        >
          {JSON.stringify(log, null, 2)}
        </pre>
      </Card>
      
<button
  onClick={async () => {
    const id = albumIdToShow.trim();
    if (!id) {
      setLog({ ok: false, status: 0, data: { error: "Album id is empty" }, raw: null });
      return;
    }
    const res = await getAlbum(id);
    setLog(res);
    if (res.ok) setAlbum(res.data);
  }}
>
  Load Album
</button>
 <Row label="Album ID">
          <input
            value={albumId}
            onChange={(e) => setAlbumIdToShow(e.target.value)}
            placeholder="UUID"
            style={{ width: "100%" }}
          />
  </Row>

{album && (
  <div style={{ marginTop: 12 }}>
    <h3>{album.title} ({album.scope})</h3>
    <p>{album.description ?? ""}</p>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
      {album.photos.map((p) => (
        <div key={p.photoId} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 8 }}>
          <div style={{ fontSize: 12, color: "#555" }}>
            pos: {p.position} — {p.owner}
          </div>
          <img
            src={`${import.meta.env.VITE_API_BASE_URL}${p.fileUrl}`}
            style={{ width: "100%", borderRadius: 8, marginTop: 6 }}
          />
          <div style={{ fontSize: 11, color: "#777", marginTop: 6 }}>
            {p.photoId}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
    </div>
    
  );
  
}

