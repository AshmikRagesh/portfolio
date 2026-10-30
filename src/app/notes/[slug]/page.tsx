// ── A taste note, read in full ────────────────────────────────────────────────
// Where a note from the home-page mailers is actually read. The page carries the
// paper over from the mailer — a warm vanilla ground with the note itself on a
// single sheet — and otherwise stays with the portfolio: shared container, heading
// scale and footer. Every value is a multiple of 2/4px.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import { TypeTag, DisciplineTag } from "@/components/Tag";
import { notes, noteBySlug } from "@/content/notes";

export const generateStaticParams = () => notes.map((n) => ({ slug: n.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const note = noteBySlug((await params).slug);
  if (!note) return { title: "Note not found" };
  return { title: `${note.title} — Ashmik Ragesh`, description: note.summary };
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const note = noteBySlug((await params).slug);
  if (!note) notFound();

  const others = notes.filter((n) => n.slug !== note.slug);

  return (
    <>
      <div className="relative z-10 bg-vanilla">
        <article className="page-container pb-[96px] pt-[96px] md:pb-[128px] md:pt-[128px]">
          <Link
            href="/#notes"
            className="inline-flex items-center gap-2 font-brand text-[12px] uppercase leading-[16px] tracking-[0px] text-muted transition-colors duration-200 hover:text-grape"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H7M11 6l-6 6 6 6" />
            </svg>
            All taste notes
          </Link>

          <header className="mt-10 max-w-[720px] md:mt-14">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
              <TypeTag type={note.type} />
              <DisciplineTag discipline={note.discipline} />
              <span className="w-full font-brand text-[12px] uppercase leading-[16px] tracking-[1px] text-muted md:ml-2 md:w-auto">
                {note.date} · {note.readTime}
              </span>
            </div>

            <h1 className="m-0 mt-8 text-balance font-heading text-[34px] font-normal leading-[38px] tracking-[-1.2px] text-heading md:mt-10 md:text-[52px] md:leading-[56px] md:tracking-[-2px]">
              {note.title}
            </h1>

            <p className="m-0 mt-6 text-pretty font-body text-[18px] leading-[30px] text-secondary md:text-[20px] md:leading-[32px]">
              {note.summary}
            </p>
          </header>

          {/* The note on its sheet — the paper from the mailer, lying flat */}
          <div className="mt-12 max-w-[720px] rounded-md bg-[#f7f4ec] px-6 py-10 shadow-[0_1px_0_rgba(30,5,37,0.08),0_16px_40px_rgba(30,5,37,0.10),inset_0_0_0_1px_rgba(120,100,70,0.08)] md:mt-16 md:px-16 md:py-16">
            <p className="m-0 text-pretty font-body text-[18px] leading-[32px] text-text-base md:text-[20px] md:leading-[34px]">
              {note.excerpt}
            </p>
            {note.body.map((para) => (
              <p key={para.slice(0, 32)} className="m-0 mt-6 text-pretty font-body text-[16px] leading-[30px] text-secondary md:mt-8 md:text-[18px] md:leading-[32px]">
                {para}
              </p>
            ))}

            {note.href && (
              <a
                href={note.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-10 inline-flex items-center gap-2 font-brand text-[12px] uppercase leading-[16px] tracking-[0px] text-grape md:mt-12"
              >
                Also published elsewhere
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </a>
            )}
          </div>

          {/* What else is on the table */}
          {others.length > 0 && (
            <aside className="mt-20 max-w-[720px] border-t border-line/60 pt-10 md:mt-24 md:pt-12">
              <h2 className="m-0 font-brand text-[12px] uppercase leading-[16px] tracking-[1px] text-muted">
                Another note
              </h2>
              <ul className="m-0 mt-6 flex list-none flex-col gap-6 p-0">
                {others.map((n) => (
                  <li key={n.slug}>
                    <Link href={`/notes/${n.slug}`} className="group block">
                      <h3 className="m-0 font-heading text-[24px] font-normal leading-[28px] tracking-[-1px] text-heading transition-colors duration-200 group-hover:text-grape md:text-[28px] md:leading-[32px]">
                        {n.title}
                      </h3>
                      <p className="m-0 mt-2 max-w-[56ch] font-body text-[16px] leading-[26px] text-secondary">
                        {n.summary}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </article>
      </div>
      <Footer />
    </>
  );
}
