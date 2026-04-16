export function normalizeSlug(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}
