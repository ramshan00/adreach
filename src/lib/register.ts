import { getDb } from "@/db";
import { registrations } from "@/db/schema";
import { EVENT } from "@/lib/constants";
import { isUniqueViolation } from "@/lib/db-errors";
import { normalizePakistaniMobile } from "@/lib/mobile";
import { registrationSchema } from "@/lib/validation";
import type { RegistrationResponse } from "@/types/registration";

export type RegisterResult = RegistrationResponse & { status: number };

const DUPLICATE_EMAIL_MESSAGE = "This email is already registered. No new registration was created.";

export async function registerAttendee(body: unknown): Promise<RegisterResult> {
  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return {
      success: false,
      status: 400,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const mobile = normalizePakistaniMobile(parsed.data.mobile);
  if (!mobile) {
    return {
      success: false,
      status: 400,
      message: "Please correct the highlighted fields.",
      fieldErrors: { mobile: ["Enter a valid Pakistani mobile number."] },
    };
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

    return {
      success: true,
      status: 200,
      message: "Registration successful. Your personalized image is ready.",
    };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        success: false,
        status: 409,
        message: DUPLICATE_EMAIL_MESSAGE,
        fieldErrors: { email: [DUPLICATE_EMAIL_MESSAGE] },
      };
    }

    console.error("Registration failed:", error);

    return {
      success: false,
      status: 500,
      message: process.env.DATABASE_URL
        ? "We could not complete your registration. Please try again shortly."
        : "Registration is temporarily unavailable. Please contact the event team.",
    };
  }
}
