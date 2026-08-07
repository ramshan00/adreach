import { corsHeaders, isRequestOriginAccepted } from "@/lib/cors";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { registerAttendee } from "@/lib/register";
import { NextResponse } from "next/server";

const MAX_BODY_BYTES = 32 * 1024;

export async function OPTIONS(request: Request) {
  if (!isRequestOriginAccepted(request)) {
    return new Response(null, { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}

export async function POST(request: Request) {
  const headers = corsHeaders(request);

  if (!isRequestOriginAccepted(request)) {
    return NextResponse.json(
      { success: false, message: "We could not complete your registration. Please try again shortly." },
      { status: 403 },
    );
  }

  const limited = checkRateLimit(clientIp(request));
  if (!limited.ok) {
    return NextResponse.json(
      { success: false, message: "We could not complete your registration. Please try again shortly." },
      {
        status: 429,
        headers: {
          ...headers,
          "Retry-After": String(limited.retryAfterSec),
        },
      },
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json(
      { success: false, message: "Please correct the highlighted fields." },
      { status: 400, headers },
    );
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { success: false, message: "Please correct the highlighted fields." },
        { status: 400, headers },
      );
    }
    body = raw ? JSON.parse(raw) : null;
  } catch {
    return NextResponse.json(
      { success: false, message: "Please correct the highlighted fields." },
      { status: 400, headers },
    );
  }

  const result = await registerAttendee(body);
  const { status, ...payload } = result;

  return NextResponse.json(payload, { status, headers });
}
