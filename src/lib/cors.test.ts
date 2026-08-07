import { afterEach, describe, expect, it } from "vitest";
import { corsHeaders, isOriginAllowed, isRequestOriginAccepted } from "./cors";

const originalAllowed = process.env.ALLOWED_ORIGINS;
const originalSite = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  if (originalAllowed === undefined) delete process.env.ALLOWED_ORIGINS;
  else process.env.ALLOWED_ORIGINS = originalAllowed;
  if (originalSite === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = originalSite;
});

describe("cors allowlist", () => {
  it("allows only configured origins", () => {
    process.env.ALLOWED_ORIGINS = "https://adreach.agency,http://localhost:3000";
    expect(isOriginAllowed("https://adreach.agency")).toBe(true);
    expect(isOriginAllowed("http://localhost:3000")).toBe(true);
    expect(isOriginAllowed("https://evil.example")).toBe(false);
    expect(isOriginAllowed("https://adreach.agency/seminar")).toBe(false);
  });

  it("reflects allowed Origin in response headers", () => {
    process.env.ALLOWED_ORIGINS = "https://adreach.agency";
    const request = new Request("https://adreach-psi.vercel.app/api/register/", {
      headers: { origin: "https://adreach.agency" },
    });
    expect(corsHeaders(request)).toMatchObject({
      "Access-Control-Allow-Origin": "https://adreach.agency",
    });
  });

  it("omits CORS headers for disallowed origins", () => {
    process.env.ALLOWED_ORIGINS = "https://adreach.agency";
    const request = new Request("https://adreach-psi.vercel.app/api/register/", {
      headers: { origin: "https://evil.example" },
    });
    expect(corsHeaders(request)).toEqual({});
  });

  it("accepts same-origin requests even when not in ALLOWED_ORIGINS", () => {
    process.env.ALLOWED_ORIGINS = "https://adreach.agency";
    const request = new Request("https://adreach-psi.vercel.app/api/register/", {
      headers: { origin: "https://adreach-psi.vercel.app" },
    });
    expect(isRequestOriginAccepted(request)).toBe(true);
  });

  it("rejects foreign origins not on the allowlist", () => {
    process.env.ALLOWED_ORIGINS = "https://adreach.agency";
    const request = new Request("https://adreach-psi.vercel.app/api/register/", {
      headers: { origin: "https://evil.example" },
    });
    expect(isRequestOriginAccepted(request)).toBe(false);
  });
});

