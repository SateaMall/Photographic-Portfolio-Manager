import * as exifr from "exifr";

import type { UploadPhotoDraft } from "../../../../../../../types/types";

const ACCEPTED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const MAX_UPLOAD_FILE_SIZE_MB = 15;
export const MAX_UPLOAD_FILE_SIZE_BYTES = MAX_UPLOAD_FILE_SIZE_MB * 1024 * 1024;
const MIN_CAPTURE_YEAR = 1800;
const MAX_CAPTURE_YEAR = 2100;

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
export function isUploadFileTooLarge(file: File) {
  return file.size > MAX_UPLOAD_FILE_SIZE_BYTES;
}
export function getMaxUploadFileSizeLabel() {
  return `${MAX_UPLOAD_FILE_SIZE_MB}MB`;
}
function normalizeCaptureYear(value: Date | number | string | null | undefined) {
  if (value instanceof Date) {
    const year = value.getFullYear();
    return year >= MIN_CAPTURE_YEAR && year <= MAX_CAPTURE_YEAR ? String(year) : "";
  }

  if (typeof value === "number") {
    return value >= MIN_CAPTURE_YEAR && value <= MAX_CAPTURE_YEAR ? String(value) : "";
  }

  if (typeof value === "string") {
    const match = value.match(/(19|20)\d{2}/);
    if (!match) {
      return "";
    }

    const year = Number(match[0]);
    return year >= MIN_CAPTURE_YEAR && year <= MAX_CAPTURE_YEAR ? String(year) : "";
  }

  return "";
}

async function readCaptureYear(file: File) {
  try {
    const metadata = await exifr.parse(file, ["DateTimeOriginal", "CreateDate", "DateTimeDigitized"]);

    return (
      normalizeCaptureYear(metadata?.DateTimeOriginal) ||
      normalizeCaptureYear(metadata?.CreateDate) ||
      normalizeCaptureYear(metadata?.DateTimeDigitized)
    );
  } catch {
    return "";
  }
}

export async function createUploadPhotoDraft(file: File): Promise<UploadPhotoDraft> {
  const captureYear = await readCaptureYear(file);

  return {
    id: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
    title: titleFromFilename(file.name),
    description: "",
    country: "",
    city: "",
    captureYear,
  };
}

export function revokeUploadDrafts(drafts: UploadPhotoDraft[]) {
  drafts.forEach((draft) => {
    URL.revokeObjectURL(draft.previewUrl);
  });
}
