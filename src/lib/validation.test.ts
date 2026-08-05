import { describe, expect, it } from "vitest";
import { registrationSchema } from "./validation";
const valid = { fullName: " Ayesha Khan ", mobile: "03001234567", email: "AYESHA@EXAMPLE.COM", designation: "", consent: true, website: "" };
describe("registrationSchema", () => { it("trims and normalizes text", () => { const result = registrationSchema.parse(valid); expect(result.fullName).toBe("Ayesha Khan"); expect(result.email).toBe("ayesha@example.com"); expect(result.designation).toBeUndefined(); }); it("rejects honeypot content", () => expect(registrationSchema.safeParse({ ...valid, website: "bot" }).success).toBe(false)); });
