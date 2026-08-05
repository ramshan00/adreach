export const EVENT = {
  slug: process.env.NEXT_PUBLIC_EVENT_SLUG ?? "adreach-tiktok-seminar-2026",
  name: "Adreach TikTok Seminar 2026",
  date: "30th August 2026",
  isoStart: "2026-08-30T12:30:00+05:00",
  isoEnd: "2026-08-30T17:00:00+05:00",
  time: "12:30 PM – 5:00 PM",
  venue: "Baradari Banquet",
  address: "D-10, Block 10-A, Gulshan-e-Iqbal, Karachi, Pakistan",
} as const;

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
