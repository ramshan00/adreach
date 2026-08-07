"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import type { Area } from "react-easy-crop";
import { Camera, LoaderCircle, LockKeyhole } from "lucide-react";
import type { RegistrationResponse } from "@/types/registration";
import { DownloadCardButton } from "@/components/event-card/DownloadCardButton";
import { EventCardPreview } from "@/components/event-card/EventCardPreview";
import { createCroppedImage, PhotoCropper } from "@/components/event-card/PhotoCropper";
import { RegistrationSuccess } from "@/components/registration/RegistrationSuccess";
import { getRegistrationApiUrl } from "@/lib/api-url";
import { MAX_PHOTO_BYTES, PHOTO_TYPES } from "@/lib/constants";
import { registrationSchema, type RegistrationInput } from "@/lib/validation";

export function RegistrationForm() {
  const cardRef = useRef<HTMLDivElement>(null); const fileRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState(""); const [photo, setPhoto] = useState(""); const [photoError, setPhotoError] = useState("");
  const [saved, setSaved] = useState(false); const [message, setMessage] = useState(""); const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, setError, setValue, formState: { errors, isValid } } = useForm<RegistrationInput>({ resolver: zodResolver(registrationSchema), mode: "onChange", defaultValues: { fullName: "", mobile: "", email: "", designation: "", consent: false, website: "", utmSource: "", utmMedium: "", utmCampaign: "" } });
  const fullName = useWatch({ control, name: "fullName" }); const designation = useWatch({ control, name: "designation" });
  useEffect(() => { const params = new URLSearchParams(location.search); setValue("utmSource", params.get("utm_source") ?? ""); setValue("utmMedium", params.get("utm_medium") ?? ""); setValue("utmCampaign", params.get("utm_campaign") ?? ""); }, [setValue]);
  useEffect(() => () => { if (source) URL.revokeObjectURL(source); }, [source]);
  function chooseFile(file?: File) { setSaved(false); setMessage(""); setPhotoError(""); if (!file) return; if (!PHOTO_TYPES.includes(file.type)) return setPhotoError("Choose a JPG, PNG, or WebP photograph."); if (file.size > MAX_PHOTO_BYTES) return setPhotoError("Photograph must be 5 MB or smaller."); setSource((current) => { if (current) URL.revokeObjectURL(current); return URL.createObjectURL(file); }); setPhoto(""); }
  async function cropChanged(area: Area) { try { if (source) setPhoto(await createCroppedImage(source, area)); } catch { setPhotoError("This photograph could not be processed."); } }
  function focusStatus() { queueMicrotask(() => document.getElementById("registration-status")?.focus()); }
  async function submit(data: RegistrationInput) { setMessage(""); setSaved(false); if (!photo) { setPhotoError("Select and crop a photograph before registering."); document.getElementById("photo-upload")?.focus(); return; } setSubmitting(true); try { const res = await fetch(getRegistrationApiUrl(), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result: RegistrationResponse = await res.json(); setMessage(result.message); if (result.fieldErrors) Object.entries(result.fieldErrors).forEach(([field, messages]) => setError(field as keyof RegistrationInput, { message: messages[0] })); setSaved(result.success); focusStatus(); } catch { setMessage("We could not complete your registration. Please try again."); focusStatus(); } finally { setSubmitting(false); } }
  const field = (name: "fullName" | "mobile" | "email" | "designation", label: string, required = false, type = "text", placeholder = "") => <label className="field"><span>{label}{required && <em>*</em>}</span><input type={type} placeholder={placeholder} aria-invalid={!!errors[name]} aria-describedby={`${name}-error`} {...register(name)} />{errors[name] && <small id={`${name}-error`} className="form-error">{errors[name]?.message}</small>}</label>;
  return <div className="registration-grid">
    <div className="form-card"><h2>Your details</h2>
      <form onSubmit={handleSubmit(submit)} noValidate>
        {field("fullName", "Full Name", true, "text", "e.g. Ayesha Khan")}{field("mobile", "Mobile Number", true, "tel", "03XXXXXXXXX")}<p className="field-hint">Accepted: 03XXXXXXXXX, +923XXXXXXXXX, or 923XXXXXXXXX</p>{field("email", "Email Address", true, "email", "you@example.com")}{field("designation", "Designation (optional)", false, "text", "e.g. Founder & CEO")}
        <div className="photo-field"><div className="field-title"><span>Photograph <em>*</em></span><small>JPG, PNG or WebP · Max 5 MB</small></div><input id="photo-upload" ref={fileRef} className="sr-only" aria-label="Photograph upload" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => chooseFile(e.target.files?.[0])} />
          {!source ? <button className="upload-zone" type="button" onClick={() => fileRef.current?.click()}><Camera /><b>Choose your photograph</b><span>You’ll crop it in the next step</span></button> : <><PhotoCropper source={source} onChange={cropChanged} onCancel={() => { URL.revokeObjectURL(source); setSource(""); setPhoto(""); }} /><button className="text-button" type="button" onClick={() => fileRef.current?.click()}>Choose a different photograph</button></>}{photoError && <small className="form-error" role="alert">{photoError}</small>}
        </div>
        <label className="consent"><input type="checkbox" {...register("consent")} /><span>I consent to Adreach storing my registration details for this event. My photograph will not be uploaded.</span></label>{errors.consent && <small className="form-error">{errors.consent.message}</small>}
        <label className="honeypot" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" {...register("website")} /></label><input type="hidden" {...register("utmSource")} /><input type="hidden" {...register("utmMedium")} /><input type="hidden" {...register("utmCampaign")} />
        <button className="button button-primary submit-button" disabled={submitting || !isValid || !photo} type="submit">{submitting ? <LoaderCircle className="spin" /> : <LockKeyhole />}{submitting ? "Registering…" : "Register & Generate Image"}</button>
      </form><div id="registration-status" tabIndex={-1} aria-live="polite">{message && (saved ? <RegistrationSuccess message={message} /> : <div className="notice-error" role="alert">{message}</div>)}</div>
    </div>
    <div className="preview-column"><EventCardPreview cardRef={cardRef} fullName={fullName} designation={designation} photo={photo} /><DownloadCardButton cardRef={cardRef} fullName={fullName} enabled={saved && !!photo && fullName.trim().length >= 2} /></div>
  </div>;
}
