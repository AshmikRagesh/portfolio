// A shared Curiosity Pass: the pass a visitor sent, read from the code in the link
// (nothing is stored), with a way into the portfolio. Its preview image is the pass.

import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import CuriosityPass from "@/components/bella/CuriosityPass";
import { decodePass, shareMessage } from "@/lib/bella/passArt";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const d = decodePass(code);
  const description = d ? shareMessage(d) : "A Curiosity Pass from Ashmik Ragesh's portfolio.";
  const image = { url: `/api/pass?c=${code}`, width: 1200, height: 630, alt: "A Curiosity Pass" };
  return {
    title: "A Curiosity Pass · Ashmik Ragesh",
    description,
    openGraph: { title: "A Curiosity Pass", description, images: [image] },
    twitter: { card: "summary_large_image", title: "A Curiosity Pass", description, images: [image.url] },
    robots: { index: false },
  };
}

export default async function SharedPass({ params }: Props) {
  const { code } = await params;
  const d = decodePass(code);
  return (
    <>
      <main className="pass-page relative z-10 flex min-h-screen flex-col items-center gap-[40px] px-[16px] pb-[120px] pt-[160px] text-center">
        <p className="font-brand text-[12px] uppercase leading-[16px] tracking-[3px] text-[#e3bd62]">Front desk · Measuring your curiosity</p>
        <h1 className="font-heading text-[40px] font-medium leading-[48px] text-[#f8f1e3] md:text-[56px] md:leading-[64px]">
          {d ? "Someone shared their Curiosity Pass" : "This pass couldn't be read"}
        </h1>
        {d && (
          <div className="w-full max-w-[620px]">
            <CuriosityPass data={d} />
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-[8px]">
          <Link href="/" className="inline-flex items-center rounded-full bg-[#e3bd62] px-[20px] py-[12px] font-geist text-[14px] font-medium leading-[20px] text-[#1e0525] hover:bg-[#f2cf7a]">
            Visit the portfolio
          </Link>
          <Link href="/pass" className="inline-flex items-center rounded-full border border-white/20 px-[20px] py-[12px] font-geist text-[14px] leading-[20px] text-[#f8f1e3] hover:border-[#e3bd62] hover:text-[#e3bd62]">
            Get your own pass
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
