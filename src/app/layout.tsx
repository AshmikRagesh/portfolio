import type { Metadata } from "next";
import { Geist, Geist_Mono, Nanum_Pen_Script } from "next/font/google";
import GlobalLayout from "@/components/GlobalLayout";
import "./globals.css";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-brand",
  weight: ["400", "500"],
});

// Geist — the secondary font: body text everywhere, and plain UI
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  weight: ["400", "500", "600"],
});

const nanumPen = Nanum_Pen_Script({
  subsets: ["latin"],
  variable: "--font-handwriting",
  weight: ["400"],
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
    <html lang="en">
      <body
        className={`${geist.variable} ${geistMono.variable} ${nanumPen.variable} bg-background font-body text-text-base antialiased`}
      >
        <GlobalLayout>{children}</GlobalLayout>
      </body>
    </html>
  );
}
