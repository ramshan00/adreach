import { describe, expect, it } from "vitest";
import { isUniqueViolation } from "./db-errors";

describe("isUniqueViolation", () => {
  it("detects top-level postgres code", () => {
    expect(isUniqueViolation({ code: "23505" })).toBe(true);
  });

  it("detects neon/drizzle wrapped cause", () => {
    const error = new Error("Failed query: insert into registrations");
    (error as Error & { cause: unknown }).cause = {
      code: "23505",
      constraint: "registrations_email_unique",
      detail: "Key (email)=(test@example.com) already exists.",
    };
    expect(isUniqueViolation(error)).toBe(true);
  });

  it("detects duplicate key wording", () => {
    expect(isUniqueViolation(new Error('duplicate key value violates unique constraint "registrations_email_unique"'))).toBe(true);
  });

  it("returns false for unrelated errors", () => {
    expect(isUniqueViolation(new Error("connection refused"))).toBe(false);
  });
});
