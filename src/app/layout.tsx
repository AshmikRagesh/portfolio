import type { Metadata } from "next";
import { Geist_Mono, Geist, Inter } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-brand",
  weight: ["400", "500"],
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
  weight: ["400", "500", "600", "700"],
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
        className={`${geistMono.variable} ${geist.variable} ${inter.variable} bg-background text-text-base antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
