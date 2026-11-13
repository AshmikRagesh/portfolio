// ── Feedback: finding blocks on the page (client only) ────────────────────────
// Feedback mode lets a reviewer point at any block of a case study. A block is a
// heading, paragraph, list item, quote, image, video, table or anything marked
// data-feedback-block. Each is saved as an anchor, "<section>|<tag>|<index>": the
// chapter it sits in, its tag, and which one of that tag it is inside the chapter.
// A snippet of its text is kept too, so it can still be found after copy moves.

import type { CaseStudySection } from "@/components/case-study/SectionPill";

export const BLOCK_SELECTOR =
  "h1,h2,h3,h4,h5,p,li,blockquote,figure,img,video,table,[data-feedback-block]";

const KIND: Record<string, string> = {
  h1: "Heading", h2: "Heading", h3: "Heading", h4: "Heading", h5: "Heading",
  p: "Paragraph", li: "List item", blockquote: "Quote",
  figure: "Image", img: "Image", video: "Video", table: "Table",
};

/** The block a click or hover lands on, or null outside the case study content. */
export function blockFor(target: EventTarget | null, root: HTMLElement): HTMLElement | null {
  if (!(target instanceof Element) || !root.contains(target)) return null;
  const pick =
    target.closest<HTMLElement>("[data-feedback-block]") ??
    target.closest<HTMLElement>("figure") ??
    target.closest<HTMLElement>(BLOCK_SELECTOR);
  if (pick && root.contains(pick)) return pick;
  // Text in a plain div (card titles, stats): the smallest element holding it
  if (target instanceof HTMLElement && target !== root && !target.matches("section, .cs-chapter, .cs-column")) {
    const r = target.getBoundingClientRect();
    if (r.height < window.innerHeight * 0.6 && (target.innerText?.trim() || target.querySelector("img, svg"))) return target;
  }
  return null;
}

function scopeOf(el: HTMLElement, root: HTMLElement) {
  const section = el.closest<HTMLElement>("section[id]");
  return section && root.contains(section) ? section : root;
}

export function snippetOf(el: HTMLElement) {
  const text =
    el.innerText?.replace(/\s+/g, " ").trim() ||
    el.querySelector("figcaption")?.textContent?.trim() ||
    (el as HTMLImageElement).alt ||
    el.querySelector("img")?.alt ||
    "";
  return text.slice(0, 140);
}

export function describe(el: HTMLElement, root: HTMLElement, sections: CaseStudySection[]) {
  const scope = scopeOf(el, root);
  const sectionId = scope === root ? "top" : scope.id;
  const sectionLabel =
    sections.find((s) => s.id === sectionId)?.label ?? (sectionId === "top" ? "Intro" : sectionId);
  const tag = el.tagName.toLowerCase();
  const index = Array.prototype.indexOf.call(scope.getElementsByTagName(tag), el);
  const named = el.dataset.feedbackBlock;
  return {
    section: sectionId,
    sectionLabel,
    anchor: `${sectionId}|${tag}|${Math.max(0, index)}`,
    label: named || KIND[tag] || (el.querySelector("img, svg, video") && !el.innerText?.trim() ? "Image" : "Text"),
    snippet: snippetOf(el),
  };
}

/** Find a saved block again: by position first, then by its text if the copy moved. */
export function locate(anchor: string, snippet: string, root: HTMLElement): HTMLElement | null {
  const [sectionId, tag, idx] = anchor.split("|");
  const scope = sectionId === "top" ? root : document.getElementById(sectionId) ?? root;
  const all = Array.from(scope.getElementsByTagName(tag)) as HTMLElement[];
  const byIndex = all[Number(idx)];
  const head = snippet.slice(0, 32);
  if (byIndex && (!head || snippetOf(byIndex).startsWith(head))) return byIndex;
  if (head) {
    const byText = all.find((el) => snippetOf(el).startsWith(head));
    if (byText) return byText;
  }
  return byIndex ?? null;
}
