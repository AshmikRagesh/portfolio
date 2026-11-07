import type { Metadata } from "next";
import localFont from "next/font/local";
import GlobalLayout from "@/components/GlobalLayout";
import "./globals.css";

// All fonts are self-hosted from src/app/fonts (OFL, licences alongside). They used to come
// from next/font/google, but that downloads them at build time, and Next 15.1's loader
// crashes when Google returns a font address without a file extension, which failed
// production builds on Vercel.

const geistMono = localFont({
  src: "./fonts/GeistMono-Variable.woff2",
  variable: "--font-brand",
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

export const metadata: Metadata = {
  title: "Ashmik Ragesh",
  description: "Creator that designs for creators.",
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
      </body>
    </html>
  );
}
