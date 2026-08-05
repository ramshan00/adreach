export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function sanitizeFilename(value: string) {
  return value.trim().toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "attendee";
}

export function nameFontSize(name: string) {
  const length = name.trim().length;
  if (length > 55) return 25;
  if (length > 38) return 28;
  if (length > 24) return 31;
  return 34;
}
