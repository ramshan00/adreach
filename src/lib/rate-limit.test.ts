import { describe, expect, it } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  it("allows a burst under the limit then blocks", () => {
    const key = `test-${Date.now()}-${Math.random()}`;
    for (let i = 0; i < 10; i += 1) {
      expect(checkRateLimit(key).ok).toBe(true);
    }
    const blocked = checkRateLimit(key);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });
});
