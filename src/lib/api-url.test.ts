import { afterEach, describe, expect, it } from "vitest";
import { getRegistrationApiUrl } from "./api-url";

const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

afterEach(() => {
  if (originalApiUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL;
  else process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
});

describe("getRegistrationApiUrl", () => {
  it("uses same-origin path when API URL is unset", () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(getRegistrationApiUrl()).toBe("/api/register/");
  });

  it("joins configured origin with /api/register/ and strips trailing slashes", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://adreach-psi.vercel.app/";
    expect(getRegistrationApiUrl()).toBe("https://adreach-psi.vercel.app/api/register/");
  });

  it("never inserts /seminar into the API path", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://adreach-psi.vercel.app";
    expect(getRegistrationApiUrl()).not.toContain("/seminar/");
    expect(getRegistrationApiUrl()).toBe("https://adreach-psi.vercel.app/api/register/");
  });
});
