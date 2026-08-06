import { getDb } from "@/db";
import { registrations } from "@/db/schema";
import { EVENT } from "@/lib/constants";
import { normalizePakistaniMobile } from "@/lib/mobile";
import { registrationSchema } from "@/lib/validation";
import { NextResponse } from "next/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Please correct the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400, headers: CORS }
    );
  }
  const mobile = normalizePakistaniMobile(parsed.data.mobile);
  if (!mobile) {
    return NextResponse.json(
      { success: false, message: "Please correct the highlighted fields.", fieldErrors: { mobile: ["Enter a valid Pakistani mobile number."] } },
      { status: 400, headers: CORS }
    );
  }
  try {
    await getDb().insert(registrations).values({
      eventSlug: EVENT.slug,
      fullName: parsed.data.fullName,
      mobile,
      email: parsed.data.email,
      designation: parsed.data.designation ?? null,
      consent: parsed.data.consent,
      utmSource: parsed.data.utmSource ?? null,
      utmMedium: parsed.data.utmMedium ?? null,
      utmCampaign: parsed.data.utmCampaign ?? null,
    });
    return NextResponse.json(
      { success: true, message: "Registration successful. Your personalized image is ready." },
      { headers: CORS }
    );
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
    const message = error instanceof Error ? error.message : "";
    if (code === "23505" || message.includes("registrations_email_unique")) {
      return NextResponse.json(
        { success: false, message: "This email is already registered. No new registration was created." },
        { status: 409, headers: CORS }
      );
    }
    return NextResponse.json(
      { success: false, message: process.env.DATABASE_URL ? "We could not complete your registration. Please try again shortly." : "Registration is temporarily unavailable. Please contact the event team." },
      { status: 500, headers: CORS }
    );
  }
}
