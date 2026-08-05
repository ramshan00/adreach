import type { Metadata } from "next";
import { Host_Grotesk } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/constants";

const hostGrotesk = Host_Grotesk({ subsets: ["latin"], variable: "--font-host", display: "swap" });
const description = "Register for the Adreach TikTok Seminar 2026 in Karachi and create your personalized LinkedIn attendee image.";
export const metadata: Metadata = { metadataBase: new URL(SITE_URL), title: "Adreach TikTok Seminar 2026 | Register Now", description, alternates: { canonical: "/" }, icons: { icon: "/brand/adreach-icon.png" }, openGraph: { title: "Adreach TikTok Seminar 2026", description, url: "/", siteName: "Adreach", locale: "en_PK", type: "website" }, twitter: { card: "summary_large_image", title: "Adreach TikTok Seminar 2026", description } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" className={hostGrotesk.variable}><body>{children}</body></html>; }
