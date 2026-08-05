import { describe, expect, it } from "vitest";
import { normalizePakistaniMobile } from "./mobile";
describe("normalizePakistaniMobile", () => { it.each([["03001234567", "+923001234567"],["923001234567", "+923001234567"],["+923001234567", "+923001234567"],["123", null]])("normalizes %s", (input, expected) => expect(normalizePakistaniMobile(input)).toBe(expected)); });
