"use server";

import { getDb } from "@/db";
import { registrations } from "@/db/schema";
import { EVENT } from "@/lib/constants";
import { normalizePakistaniMobile } from "@/lib/mobile";
import { registrationSchema, type RegistrationInput } from "@/lib/validation";
import type { RegistrationResponse } from "@/types/registration";

export async function registerAttendee(input: RegistrationInput): Promise<RegistrationResponse> {
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Please correct the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const mobile = normalizePakistaniMobile(parsed.data.mobile);
  if (!mobile) return { success: false, message: "Please correct the highlighted fields.", fieldErrors: { mobile: ["Enter a valid Pakistani mobile number."] } };

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
    return { success: true, message: "Registration successful. Your personalized image is ready." };
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
    const message = error instanceof Error ? error.message : "";
    if (code === "23505" || message.includes("registrations_email_unique")) {
      return { success: false, message: "This email is already registered. No new registration was created." };
    }
    return { success: false, message: process.env.DATABASE_URL ? "We could not complete your registration. Please try again shortly." : "Registration is temporarily unavailable. Please contact the event team." };
  }
}
