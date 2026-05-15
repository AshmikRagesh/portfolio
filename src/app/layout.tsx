import type { Metadata } from "next";
import { Geist_Mono, Roboto_Slab, Nanum_Pen_Script } from "next/font/google";
import GlobalLayout from "@/components/GlobalLayout";
import "./globals.css";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-brand",
  weight: ["400", "500"],
});

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500"],
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
        className={`${geistMono.variable} ${robotoSlab.variable} ${nanumPen.variable} bg-background text-text-base antialiased`}
      >
        <GlobalLayout>{children}</GlobalLayout>
      </body>
    </html>
  );
}
