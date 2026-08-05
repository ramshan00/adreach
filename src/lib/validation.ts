import { z } from "zod";
import { normalizePakistaniMobile } from "./mobile";

const optionalText = (max: number) => z.string().trim().max(max).optional().transform((v) => v || undefined);

export const registrationSchema = z.object({
  fullName: z.string().trim().min(2, "Enter at least 2 characters.").max(80, "Use 80 characters or fewer."),
  mobile: z.string().trim().refine((v) => normalizePakistaniMobile(v) !== null, "Enter a valid Pakistani mobile number."),
  email: z.string().trim().toLowerCase().max(150, "Use 150 characters or fewer.").email("Enter a valid email address."),
  designation: optionalText(80),
  consent: z.boolean().refine((value) => value, "Consent is required."),
  website: z.string().max(0, "Invalid submission."),
  utmSource: optionalText(200),
  utmMedium: optionalText(200),
  utmCampaign: optionalText(200),
});

export type RegistrationInput = z.input<typeof registrationSchema>;
export type ValidRegistration = z.output<typeof registrationSchema>;
