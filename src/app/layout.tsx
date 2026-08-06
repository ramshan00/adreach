import type { Metadata } from "next";
import { League_Spartan, Montserrat } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/constants";

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-spartan",
  display: "swap",
  weight: ["800", "900"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const description = "Register for the Adreach TikTok Seminar 2026 in Karachi and create your personalized attendee image.";
export const metadata: Metadata = { metadataBase: new URL(SITE_URL), title: "Adreach TikTok Seminar 2026 | Register Now", description, alternates: { canonical: "/" }, icons: { icon: "/favicon.ico" }, openGraph: { title: "Adreach TikTok Seminar 2026", description, url: "/", siteName: "Adreach", locale: "en_PK", type: "website" }, twitter: { card: "summary_large_image", title: "Adreach TikTok Seminar 2026", description } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${leagueSpartan.variable} ${montserrat.variable}`}><body>{children}</body></html>;
}
