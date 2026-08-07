function collectErrorText(error: unknown): string {
  const parts: string[] = [];
  const seen = new Set<unknown>();
  let current: unknown = error;

  for (let depth = 0; depth < 6 && current; depth += 1) {
    if (seen.has(current)) break;
    seen.add(current);

    if (typeof current === "string") {
      parts.push(current);
      break;
    }

    if (typeof current !== "object" || current === null) break;

    const record = current as Record<string, unknown>;
    for (const key of ["code", "message", "detail", "constraint", "severity"]) {
      const value = record[key];
      if (typeof value === "string" || typeof value === "number") {
        parts.push(String(value));
      }
    }

    current = record.cause ?? record.originalError ?? record.error;
  }

  return parts.join(" ");
}

/** True when Postgres / Neon reports a unique constraint violation (e.g. duplicate email). */
export function isUniqueViolation(error: unknown): boolean {
  const text = collectErrorText(error).toLowerCase();
  return (
    text.includes("23505") ||
    text.includes("registrations_email_unique") ||
    text.includes("duplicate key") ||
    text.includes("unique constraint")
  );
}
