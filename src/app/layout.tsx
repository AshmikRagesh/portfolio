import type { Metadata } from "next";
import localFont from "next/font/local";
import GlobalLayout from "@/components/GlobalLayout";
import SiteAnalytics from "@/components/SiteAnalytics";
import "./globals.css";

// All fonts are self-hosted from src/app/fonts (OFL, licences alongside). They used to come
// from next/font/google, but that downloads them at build time, and Next 15.1's loader
// crashes when Google returns a font address without a file extension, which failed
// production builds on Vercel.

// Geist Mono — the navbar tabs and the curiosity board, plus real code (inline code, URLs,
// tokens). Preloaded, since the navbar is on screen on every page
const geistMono = localFont({
  src: "./fonts/GeistMono-Variable.woff2",
  variable: "--font-code",
  weight: "100 900",
  display: "swap",
});

// Geist — the secondary font: body text everywhere, and plain UI
const geist = localFont({
  src: "./fonts/Geist-Variable.woff2",
  variable: "--font-geist",
  weight: "100 900",
  display: "swap",
});

// Source Serif 4 (the current release of Source Serif Pro) — the primary font, for headings.
// GT Alpina stays loaded in globals.css as the fallback, so switching back is one line in tokens.ts.
const sourceSerif = localFont({
  src: [
    { path: "./fonts/source-serif-4-latin-wght-normal.woff2", weight: "200 900", style: "normal" },
    { path: "./fonts/source-serif-4-latin-wght-italic.woff2", weight: "200 900", style: "italic" },
  ],
  variable: "--font-serif",
  display: "swap",
});

const nanumPen = localFont({
  src: "./fonts/nanum-pen-script-latin-400-normal.woff2",
  variable: "--font-handwriting",
  weight: "400",
  display: "swap",
});

// The site's own address, so link previews (Slack, LinkedIn, WhatsApp) get full links to the
// preview image in opengraph-image.png. Production is www.ashmikragesh.com (Vercel redirects
// the bare ashmikragesh.com to it); preview deployments use their own address; locally it's
// the dev server.
const SITE_URL =
  process.env.VERCEL_ENV === "production"
    ? "https://www.ashmikragesh.com"
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

const DESCRIPTION = "Product designer turned design engineer. I design it, then build it in code, so teams can click through an idea before they commit to it.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Ashmik Ragesh",
  description: DESCRIPTION,
  // No title or description here: each page's own <title> and description are what
  // previews fall back to, so a shared case study shows its own name
  openGraph: { type: "website", siteName: "Ashmik Ragesh", locale: "en_IN" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Bella's loader plays once per session: hide it before paint on repeat visits (?loader shows it again) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem("bella-loaded")&&!/[?&]loader/.test(location.search))document.documentElement.classList.add("loader-skip")}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${geist.variable} ${geistMono.variable} ${sourceSerif.variable} ${nanumPen.variable} bg-background font-body text-text-base antialiased`}
      >
        <GlobalLayout>{children}</GlobalLayout>
        <SiteAnalytics />
      </body>
    </html>
  );
}
