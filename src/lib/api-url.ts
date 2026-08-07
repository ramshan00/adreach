const REGISTER_PATH = "/api/register/";

/**
 * Resolves the registration API URL for the current build.
 * - NEXT_PUBLIC_API_URL set (Hostinger): `${origin}/api/register/`
 * - unset (local + Vercel): same-origin `/api/register/`
 * Never appends /seminar to the API path. Never falls back to a production host.
 */
export function getRegistrationApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!configured) {
    return REGISTER_PATH;
  }

  const origin = configured.replace(/\/+$/, "");
  return `${origin}${REGISTER_PATH}`;
}
