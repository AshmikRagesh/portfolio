import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { LOCKED } from "@/lib/caseLock";
import LockedCard from "./LockedCard";

// The password screen. middleware.ts shows it at a locked case study's own address
// until the password has been entered; then the case study itself loads there.

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = LOCKED[slug];
  return {
    title: c ? c.title : "Locked",
    robots: { index: false, follow: false },
  };
}

export default async function LockedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = LOCKED[slug];
  if (!c) notFound();

  return (
    <main className="relative z-10 min-h-screen bg-surface pt-[88px] pb-[96px] md:pb-[128px]">
      <div className="page-container">
        <div className="mx-auto flex w-full max-w-[880px] flex-col items-center gap-[32px] pt-[48px] text-center md:gap-[40px] md:pt-[72px]">
          <div className="flex flex-col items-center gap-[12px]">
            <span className="font-geist text-caption uppercase tracking-[1px] text-heading">Password protected</span>
            <h1 className="m-0 max-w-[720px] text-balance font-heading text-h1 font-normal text-heading md:text-h1-md lg:text-h1-lg">
              {c.title}
            </h1>
            <p className="m-0 max-w-[520px] text-pretty font-body text-lead text-secondary md:text-lead-md">
              This case study is shared on request. Enter the password to read it.
            </p>
          </div>
          <LockedCard slug={slug} href={`/works/${slug}`} comingSoon={c.comingSoon}>
            <Image src={c.cover} alt={c.coverAlt} fill priority sizes="(min-width: 1024px) 880px, 100vw" className="object-cover" />
          </LockedCard>
        </div>
      </div>
    </main>
  );
}
