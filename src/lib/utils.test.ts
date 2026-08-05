import { describe, expect, it } from "vitest";
import { nameFontSize, sanitizeFilename } from "./utils";
describe("card helpers", () => { it("sanitizes filenames", () => expect(sanitizeFilename("  Ayesha Khan!  ")).toBe("ayesha-khan")); it("reduces long names", () => expect(nameFontSize("A very long attendee name that needs smaller typography")).toBeLessThan(nameFontSize("Ayesha"))); });
