import type { UploadPhotoDraft } from "../../../../../types/types";

const ACCEPTED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

function getExtension(filename: string) {
  const parts = filename.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] ?? "" : "";
}

function titleFromFilename(filename: string) {
  const withoutExtension = filename.replace(/\.[^.]+$/, "");
  return withoutExtension.replace(/[_-]+/g, " ").trim() || "Untitled";
}

export function isAcceptedUploadFile(file: File) {
  return ACCEPTED_EXTENSIONS.has(getExtension(file.name));
}

export function createUploadPhotoDraft(file: File): UploadPhotoDraft {
  return {
    id: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
    title: titleFromFilename(file.name),
    description: "",
    country: "",
    city: "",
    captureYear: "",
  };
}

export function revokeUploadDrafts(drafts: UploadPhotoDraft[]) {
  drafts.forEach((draft) => {
    URL.revokeObjectURL(draft.previewUrl);
  });
}
