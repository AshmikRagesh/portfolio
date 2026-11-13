"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
// The round button keeps its filled Phosphor bubble; everything in the card uses Lucide, like the rest of the site
import { ChatCircleDots } from "@phosphor-icons/react";
import {
  Accessibility,
  AlignLeft,
  ArrowUp,
  ArrowUpRight,
  Bug,
  Check,
  ChevronDown,
  CircleUser,
  CircleX,
  Heading,
  Image as ImageIcon,
  Moon,
  Sun,
  List,
  MessageSquare,
  Palette,
  Quote,
  Table,
  Tag,
  Trash2,
  Type,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import type { CaseStudySection } from "@/components/case-study/SectionPill";
import { blockFor, describe, locate } from "@/lib/feedback/anchor";
import {
  AUTHOR_KEY,
  CATEGORIES,
  FEEDBACK_PATH,
  IMAGE_EDGE,
  IMAGE_MAX_BYTES,
  IMAGE_PATH,
  LIMITS,
  NAME_KEY,
  type FeedbackCategory,
  type FeedbackItem,
} from "@/lib/feedback/shared";
import { playSound } from "@/lib/sound/ui";

// ── Case study feedback ───────────────────────────────────────────────────────
// A round button beside the section pill turns on feedback mode. In it, the block
// under the pointer is outlined; clicking one opens a floating card at the right to
// leave a comment on it. Reviewers see only their own comments (numbered dots);
// everything goes to the private /feedback inbox. Styles: .fb-* in globals.css.

type Saved = Omit<FeedbackItem, "author" | "test" | "image"> & { hasImage?: boolean };
type Target = ReturnType<typeof describe> & { el: HTMLElement | null };
type Panel = "closed" | "compose" | "notes";

/** Feedback about the case study as a whole, before (or instead of) picking a block */
/** Remembers a ?fb-theme preview (dark | light) in this browser */
const THEME_KEY = "ash.feedback.theme";

/** How long "Note deleted · Undo" stays before the note is really deleted */
const UNDO_MS = 5000;

const PAGE_TARGET: Target = {
  el: null,
  section: "page",
  sectionLabel: "This case study",
  anchor: "page|page|0",
  label: "Whole case study",
  snippet: "",
};

/** "Helix · Ashmik Ragesh" → "Helix"; falls back to the slug */
const pageName = (item: { page: string; pageTitle?: string }) =>
  item.pageTitle ||
  item.page.replace("/works/", "").replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());

interface FeedbackState {
  on: boolean;
  setOn: (on: boolean) => void;
  items: Saved[];
  add: (item: Saved) => void;
  /** Take a note out of the list (deleting it); restore puts it back (Undo) */
  remove: (id: string) => void;
  restore: (item: Saved) => void;
  author: string;
  imagesEnabled: boolean;
}

const Ctx = createContext<FeedbackState | null>(null);
const NONE: Saved[] = [];
const useFeedback = () => useContext(Ctx);
export const useFeedbackOn = () => useContext(Ctx)?.on ?? false;

function storageGet(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function storageSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Blocked storage: the comment still sends, it just won't be remembered here
  }
}

function authorId() {
  let id = storageGet(AUTHOR_KEY);
  if (!id) {
    id = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    storageSet(AUTHOR_KEY, id);
  }
  return id;
}

/** Shrink an image to a JPEG no wider or taller than IMAGE_EDGE and under IMAGE_MAX_BYTES */
async function toJpeg(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  // JPEG has no transparency: put see-through screenshots on white
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  for (const quality of [0.82, 0.7, 0.55]) {
    const out = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (out && out.size <= IMAGE_MAX_BYTES) return out;
  }
  throw new Error("too big");
}

export function FeedbackProvider({ children, imagesEnabled = false }: { children: React.ReactNode; imagesEnabled?: boolean }) {
  const [on, setOn] = useState(false);
  const [items, setItems] = useState<Saved[]>([]);
  const [author, setAuthor] = useState("");

  useEffect(() => setAuthor(authorId()), []);

  // All of this reviewer's earlier comments, on every case study
  useEffect(() => {
    if (!author) return;
    let live = true;
    fetch(`${FEEDBACK_PATH}?author=${author}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list: Saved[]) => live && setItems(list))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [author]);

  const add = useCallback((item: Saved) => setItems((list) => [...list, item]), []);
  const remove = useCallback((id: string) => setItems((list) => list.filter((i) => i.id !== id)), []);
  const restore = useCallback(
    (item: Saved) =>
      setItems((list) => (list.some((i) => i.id === item.id) ? list : [...list, item].sort((a, b) => a.createdAt - b.createdAt))),
    [],
  );

  return (
    <Ctx.Provider value={{ on, setOn, items, add, remove, restore, author, imagesEnabled }}>{children}</Ctx.Provider>
  );
}

/** The round button that sits beside the section pill. */
export function FeedbackButton() {
  const fb = useFeedback();
  const page = usePathname();
  if (!fb) return null;
  const { on, setOn } = fb;
  const items = fb.items.filter((i) => i.page === page);
  return (
    <button
      type="button"
      className="fb-button"
      data-on={on}
      aria-pressed={on}
      data-sound-click="toggle"
      onClick={() => setOn(!on)}
    >
      <ChatCircleDots size={20} weight="fill" aria-hidden="true" />
      <span className="sr-only">{on ? "Exit feedback mode" : "Leave feedback on this case study"}</span>
      {items.length > 0 && (
        <span className="fb-count" aria-hidden="true">
          {items.length}
        </span>
      )}
      <span className="fb-tip" aria-hidden="true">
        {on ? "Exit feedback" : "Leave feedback"}
      </span>
    </button>
  );
}

const CATEGORY_ICONS: Record<FeedbackCategory, LucideIcon> = {
  accessibility: Accessibility,
  content: Type,
  visual: Palette,
  bug: Bug,
};

/** Lucide is an outline set; these shapes still read when filled, so they're drawn solid */
const FILLED = new Set<LucideIcon>([Tag, MessageSquare, Bug, Quote, Video]);
const fill = (I: LucideIcon) => (FILLED.has(I) ? { fill: "currentColor" } : {});

const KIND_ICONS: Record<string, LucideIcon> = {
  Heading: Heading,
  Paragraph: AlignLeft,
  "List item": List,
  Quote: Quote,
  Image: ImageIcon,
  Video: Video,
  Table: Table,
};

const MENU: { value: FeedbackCategory | ""; label: string }[] = [
  ...(Object.entries(CATEGORIES) as [FeedbackCategory, string][]).map(([value, label]) => ({ value, label })),
  { value: "", label: "No category" },
];

/** The category picker: a small pill that opens a list above itself. Arrow keys, Enter, Esc. */
function CategoryMenu({ value, onChange }: { value: FeedbackCategory | ""; onChange: (v: FeedbackCategory | "") => void }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const options = value ? MENU : MENU.slice(0, -1);
  const Current = value ? CATEGORY_ICONS[value] : Tag;

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    listRef.current?.focus();
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const show = () => {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };
  const choose = (v: FeedbackCategory | "") => {
    onChange(v);
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div ref={wrapRef} className="fb-menu-wrap">
      <button
        ref={buttonRef}
        type="button"
        className="fb-select"
        data-filled={Boolean(value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Category (optional): ${value ? CATEGORIES[value] : "none"}`}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            show();
          }
        }}
      >
        <Current size={12} aria-hidden="true" {...fill(Current)} />
        {value ? CATEGORIES[value] : "Category"}
        <ChevronDown size={10} aria-hidden="true" className="fb-select-caret" />
      </button>
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label="Category"
          tabIndex={-1}
          className="fb-menu"
          aria-activedescendant={`fb-cat-${active}`}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") setActive((a) => (a + 1) % options.length);
            else if (e.key === "ArrowUp") setActive((a) => (a - 1 + options.length) % options.length);
            else if (e.key === "Enter" || e.key === " ") choose(options[active].value);
            else if (e.key === "Escape" || e.key === "Tab") {
              setOpen(false);
              if (e.key === "Escape") buttonRef.current?.focus();
            } else return;
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {options.map((o, i) => {
            const OptionIcon = o.value ? CATEGORY_ICONS[o.value] : CircleX;
            return (
              <li
                key={o.value || "none"}
                id={`fb-cat-${i}`}
                role="option"
                aria-selected={o.value === value}
                data-active={i === active}
                data-none={!o.value}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(o.value)}
              >
                <OptionIcon size={12} aria-hidden="true" {...fill(OptionIcon)} />
                <span>{o.label}</span>
                {o.value === value && o.value && <Check size={12} aria-hidden="true" className="fb-menu-check" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Outlines, dots and the comment card. Only does anything while feedback mode is on. */
export function FeedbackLayer({ sections }: { sections: CaseStudySection[] }) {
  const fb = useFeedback();
  const page = usePathname();
  const [target, setTarget] = useState<Target | null>(null);
  const [draft, setDraft] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<FeedbackCategory | "">("");
  const [image, setImage] = useState<{ blob: Blob; preview: string } | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error" | "image-error">("idle");
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [panel, setPanel] = useState<Panel>("closed");
  const [activeNote, setActiveNote] = useState<string | null>(null);
  // A deleted note waits UNDO_MS before it's really deleted, so Undo only has to cancel
  const [pending, setPending] = useState<Saved | null>(null);
  // Images that can't be shown (e.g. kept only in a dev server's memory): fall back to a label
  const [brokenImages, setBrokenImages] = useState<Set<string>>(() => new Set());
  const [deleteError, setDeleteError] = useState(false);
  const pendingTimer = useRef<number | null>(null);
  const pendingRef = useRef<Saved | null>(null);
  pendingRef.current = pending;
  const panelRef = useRef<Panel>("closed");
  const lastPanel = useRef<Panel>("compose");
  const lastTarget = useRef<Target | null>(null);
  panelRef.current = panel;
  const hoverRef = useRef<HTMLDivElement>(null);
  const pickedRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef(new Map<string, HTMLButtonElement>());
  const hovered = useRef<HTMLElement | null>(null);
  const located = useRef(new Map<string, HTMLElement | null>());
  const textRef = useRef<HTMLTextAreaElement>(null);
  const targetRef = useRef<Target | null>(null);
  targetRef.current = target;

  const on = fb?.on ?? false;
  const setOn = fb?.setOn;
  const allItems = fb?.items ?? NONE;
  // Dots and block lookups are for this page; the Your notes tab lists every page
  const items = useMemo(() => allItems.filter((i) => i.page === page), [allItems, page]);

  useEffect(() => setName(storageGet(NAME_KEY) ?? ""), []);

  // Card colours: dark by default; the sun/moon button beside close switches them,
  // remembered in this browser (?fb-theme=light|dark sets it from a link too).
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    const asked = new URLSearchParams(window.location.search).get("fb-theme");
    if (asked === "light" || asked === "dark") storageSet(THEME_KEY, asked);
    setTheme(storageGet(THEME_KEY) === "light" ? "light" : "dark");
  }, []);

  const root = () => document.querySelector<HTMLElement>("[data-cs-main]");

  const pick = useCallback(
    (el: HTMLElement) => {
      const main = root();
      if (!main) return;
      setTarget({ el, ...describe(el, main, sections) });
      setPanel("compose");
      setActiveNote(null);
      setState("idle");
      // Phones: the card is a bottom sheet, so lift the block into the space above it
      if (!window.matchMedia("(min-width: 768px)").matches) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollBy({ top: el.getBoundingClientRect().top - 176, behavior: reduce ? "auto" : "smooth" });
      }
      playSound("pop");
    },
    [sections],
  );

  // Deep link: /works/x?fb=<anchor> opens feedback mode on that block (from the inbox).
  // With &note=<id> (from Your notes on another case study) it opens Your notes on that note.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const anchor = params.get("fb");
    const note = params.get("note");
    const main = root();
    if (!anchor || !main || !setOn) return;
    const el = locate(anchor, "", main);
    setOn(true);
    if (el) {
      el.scrollIntoView({ block: "center" });
      pick(el);
    }
    if (note && /^[0-9a-f-]{36}$/.test(note)) {
      setPanel("notes");
      setActiveNote(note);
    }
  }, [setOn, pick]);

  // Points and clicks inside the case study belong to feedback mode while it's on
  useEffect(() => {
    if (!on) return;
    const main = root();
    if (!main) return;
    document.documentElement.dataset.feedback = "on";

    const onMove = (e: PointerEvent) => {
      hovered.current = e.pointerType === "touch" ? null : blockFor(e.target, main);
    };
    const swallow = (e: Event) => {
      if (!main.contains(e.target as Node)) return;
      e.preventDefault();
      e.stopPropagation();
    };
    const onClick = (e: MouseEvent) => {
      if (!main.contains(e.target as Node)) return;
      e.preventDefault();
      e.stopPropagation();
      const el = blockFor(e.target, main);
      if (el) pick(el);
    };
    // Esc leaves feedback mode (the card and the mode open and close together)
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOn?.(false);
      document.querySelector<HTMLButtonElement>(".fb-button")?.focus();
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", swallow, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey);
    return () => {
      delete document.documentElement.dataset.feedback;
      hovered.current = null;
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", swallow, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [on, pick, setOn]);

  // Turning feedback mode on opens the card straight away, ready for a note on the
  // whole case study (a deep link that picks a block in the same pass keeps it).
  // Turning it off closes the card.
  const wasOn = useRef(on);
  useEffect(() => {
    // Whenever the mode is on, the card is open (also after a remount or a hot reload)
    if (on) {
      if (!targetRef.current) setTarget(PAGE_TARGET);
      setPanel((p) => (p === "closed" ? "compose" : p));
    }
    if (wasOn.current && !on) {
      setTarget(null);
      setPanel("closed");
      setActiveNote(null);
    }
    wasOn.current = on;
  }, [on]);

  // Find each saved comment's block once per mode switch or new comment
  useEffect(() => {
    const main = root();
    if (!on || !main) return;
    located.current = new Map(items.map((i) => [i.id, locate(i.anchor, i.snippet, main)]));
  }, [on, items]);

  // Keep outlines, dots and the card stuck to their blocks while the page moves
  useEffect(() => {
    if (!on) return;
    let frame = 0;
    const place = (box: HTMLDivElement | null, el: HTMLElement | null) => {
      if (!box) return;
      if (!el) {
        box.style.opacity = "0";
        return;
      }
      const r = el.getBoundingClientRect();
      box.style.opacity = "1";
      box.style.transform = `translate(${r.left - 6}px, ${r.top - 6}px)`;
      box.style.width = `${r.width + 12}px`;
      box.style.height = `${r.height + 12}px`;
    };
    const tick = () => {
      const picked = target?.el ?? null;
      place(hoverRef.current, hovered.current && hovered.current !== picked ? hovered.current : null);
      place(pickedRef.current, picked);

      // One dot per block, on its top-right corner
      const seen = new Set<HTMLElement>();
      for (const [id, dot] of dotRefs.current) {
        const el = located.current.get(id);
        if (!el || seen.has(el)) {
          dot.style.opacity = "0";
          continue;
        }
        seen.add(el);
        const r = el.getBoundingClientRect();
        dot.style.opacity = "1";
        dot.style.transform = `translate(${r.right - 4}px, ${r.top - 16}px)`;
      }

      // Desktop card: level with the block, kept clear of the navbar and the dock
      const card = cardRef.current;
      if (card && picked && window.matchMedia("(min-width: 768px)").matches) {
        const r = picked.getBoundingClientRect();
        const top = Math.min(Math.max(r.top, 104), window.innerHeight - card.offsetHeight - 96);
        card.style.top = `${Math.max(104, top)}px`;
      } else if (card) {
        card.style.top = "";
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [on, target]);

  // Leaving the page (or the case study) while Undo is still offered: delete now, so it isn't lost
  const authorRef = useRef("");
  authorRef.current = fb?.author ?? "";
  useEffect(() => {
    const flush = () => {
      const note = pendingRef.current;
      if (!note || !authorRef.current) return;
      pendingRef.current = null;
      fetch(FEEDBACK_PATH, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: note.id, author: authorRef.current }),
        keepalive: true,
      });
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, []);

  // With no notes left (and nothing to undo), the tabs go away: back to writing
  useEffect(() => {
    if (allItems.length === 0 && !pending && panel === "notes") setPanel("compose");
  }, [allItems.length, pending, panel]);

  // Focus the comment box when the card opens or a block is picked
  useEffect(() => {
    if (target && panel === "compose") textRef.current?.focus({ preventScroll: true });
  }, [target, panel]);

  if (!fb) return null;

  const open = on && panel !== "closed";
  // While the card fades out, keep showing what it showed, so it never collapses to an empty bar
  if (panel !== "closed") lastPanel.current = panel;
  if (target) lastTarget.current = target;
  const view: Panel = open ? panel : lastPanel.current;
  const about = target ?? lastTarget.current;
  const TargetIcon = about?.el ? KIND_ICONS[about.label] || Type : MessageSquare;

  // Your notes: this page first, then the other case studies, newest first in each
  const groups = (() => {
    const map = new Map<string, Saved[]>();
    for (const n of [...allItems].sort((a, b) => b.createdAt - a.createdAt)) {
      map.set(n.page, [...(map.get(n.page) ?? []), n]);
    }
    return [...map].sort(([a], [b]) => Number(b === page) - Number(a === page));
  })();

  const reallyDelete = (note: Saved, opts: { keepalive?: boolean } = {}) =>
    fetch(FEEDBACK_PATH, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: note.id, author: fb?.author }),
      keepalive: opts.keepalive,
    });

  const finishDelete = () => {
    const note = pendingRef.current;
    if (pendingTimer.current !== null) window.clearTimeout(pendingTimer.current);
    pendingTimer.current = null;
    setPending(null);
    if (!note) return;
    reallyDelete(note)
      .then((res) => {
        // Already gone (404) counts as deleted; anything else puts the note back
        if (!res.ok && res.status !== 404) throw new Error(String(res.status));
      })
      .catch(() => {
        fb?.restore(note);
        setDeleteError(true);
      });
  };

  const deleteNote = (note: Saved) => {
    // One undo at a time: a second delete settles the first
    if (pendingRef.current) finishDelete();
    fb?.remove(note.id);
    setDeleteError(false);
    if (activeNote === note.id) setActiveNote(null);
    setPending(note);
    pendingTimer.current = window.setTimeout(finishDelete, UNDO_MS);
  };

  const undoDelete = () => {
    const note = pendingRef.current;
    if (pendingTimer.current !== null) window.clearTimeout(pendingTimer.current);
    pendingTimer.current = null;
    setPending(null);
    if (note) fb?.restore(note);
  };

  // Closing the card leaves feedback mode too: there's no in-between state
  const closeCard = () => {
    setOn?.(false);
    // Back to where the reviewer opened it from
    document.querySelector<HTMLButtonElement>(".fb-button")?.focus();
  };

  const goToNote = (n: Saved) => {
    if (n.page !== page) {
      window.location.href = `${n.page}?fb=${encodeURIComponent(n.anchor)}&note=${n.id}`;
      return;
    }
    setActiveNote(n.id);
    const main = root();
    const el = located.current.get(n.id) ?? (main ? locate(n.anchor, n.snippet, main) : null);
    if (!el || !main) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    setTarget({ el, ...describe(el, main, sections) });
  };
  // Number the dots in reading order of when they were left
  const blocks = Array.from(new Set(items.map((i) => i.anchor)));

  const clearImage = () => {
    setImage((current) => {
      if (current) URL.revokeObjectURL(current.preview);
      return null;
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  const attach = async (file: File | null | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const blob = await toJpeg(file);
      clearImage();
      setImage({ blob, preview: URL.createObjectURL(blob) });
      if (state !== "sending") setState("idle");
    } catch {
      setState("image-error");
    }
  };

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!target || !text || state === "sending") return;
    setState("sending");
    storageSet(NAME_KEY, name.trim());
    try {
      // The image goes up first; the comment carries its private pathname
      let imagePath = "";
      if (image) {
        const up = await fetch(IMAGE_PATH, { method: "POST", headers: { "Content-Type": "image/jpeg" }, body: image.blob });
        if (!up.ok) throw new Error(String(up.status));
        imagePath = (await up.json()).image;
      }
      const res = await fetch(FEEDBACK_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          pageTitle: document.title.split(" · ")[0],
          section: target.section,
          sectionLabel: target.sectionLabel,
          anchor: target.anchor,
          label: target.label,
          snippet: target.snippet,
          text,
          name: name.trim(),
          category,
          image: imagePath,
          author: fb.author,
          website: (e?.target as HTMLFormElement | undefined)?.website?.value ?? "",
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      if (res.status === 201) fb.add(await res.json());
      setDraft("");
      setCategory("");
      clearImage();
      setState("sent");
      playSound("done");
    } catch {
      setState("error");
    }
  };

  return (
    <>
      <div className="fb-overlay" data-on={on} aria-hidden="true">
        <div ref={hoverRef} className="fb-outline" data-kind="hover" />
        <div ref={pickedRef} className="fb-outline" data-kind="picked">
          {target && (
            <span className="fb-outline-tag">
              {target.sectionLabel} · {target.label}
            </span>
          )}
        </div>
      </div>

      {on &&
        items.map((item) => (
          <button
            key={item.id}
            type="button"
            ref={(node) => {
              if (node) dotRefs.current.set(item.id, node);
              else dotRefs.current.delete(item.id);
            }}
            className="fb-dot"
            aria-label={`Your comment on ${item.sectionLabel}, ${item.label.toLowerCase()}`}
            onClick={() => {
              const el = located.current.get(item.id);
              if (el) pick(el);
            }}
          >
            {blocks.indexOf(item.anchor) + 1}
          </button>
        ))}

      <div
        ref={cardRef}
        className="fb-card"
        data-theme={theme}
        data-open={open}
        inert={!open}
        role="dialog"
        aria-modal="false"
        aria-labelledby="fb-title"
      >
        {about && (
          <form onSubmit={send} className="fb-card-form">
            <header className="fb-card-head">
              <h2 id="fb-title" className="fb-card-title">
                Leave feedback
              </h2>
              <div className="fb-card-actions">
                <button
                  type="button"
                  className="fb-icon-button"
                  data-sound-click="toggle"
                  aria-label={theme === "dark" ? "Switch to light colours" : "Switch to dark colours"}
                  title={theme === "dark" ? "Light colours" : "Dark colours"}
                  onClick={() => {
                    const next = theme === "dark" ? "light" : "dark";
                    setTheme(next);
                    storageSet(THEME_KEY, next);
                  }}
                >
                  {theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" fill="currentColor" />}
                </button>
                <button type="button" className="fb-icon-button" onClick={closeCard} aria-label="Close feedback">
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            </header>

            {/* Two views, once there's something to go back to: write a note, or see the ones
                already left. Arrow keys move between tabs. */}
            {(allItems.length > 0 || pending) && (
            <div
              className="fb-tabs"
              role="tablist"
              aria-label="Feedback views"
              onKeyDown={(e) => {
                const order: Panel[] = ["compose", "notes"];
                let next: Panel | null = null;
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") next = order[(order.indexOf(view) + 1) % 2];
                else if (e.key === "Home") next = "compose";
                else if (e.key === "End") next = "notes";
                if (!next) return;
                e.preventDefault();
                setPanel(next);
                document.getElementById(`fb-tab-${next}`)?.focus();
              }}
            >
              {(["compose", "notes"] as const).map((tab) => (
                <button
                  key={tab}
                  id={`fb-tab-${tab}`}
                  type="button"
                  role="tab"
                  aria-selected={view === tab}
                  aria-controls={`fb-panel-${tab}`}
                  tabIndex={view === tab ? 0 : -1}
                  data-sound-click="toggle"
                  onClick={() => setPanel(tab)}
                >
                  {tab === "compose" ? "Comment" : "Your notes"}
                  {tab === "notes" && (
                    <span className="fb-tab-count">
                      {allItems.length}
                      <span className="sr-only"> notes</span>
                    </span>
                  )}
                </button>
              ))}
            </div>
            )}

            <div
              role={allItems.length > 0 || pending ? "tabpanel" : undefined}
              id={`fb-panel-${view}`}
              aria-labelledby={allItems.length > 0 || pending ? `fb-tab-${view}` : undefined}
              className="fb-panel"
            >
            {(pending || deleteError) && (
              <div className="fb-toast" role="status">
                {pending ? (
                  <>
                    <span>Note deleted</span>
                    <button type="button" onClick={undoDelete}>
                      Undo
                    </button>
                  </>
                ) : (
                  <span>Couldn&apos;t delete that note. It&apos;s back in your list.</span>
                )}
              </div>
            )}

            {view === "notes" ? (
              allItems.length === 0 ? (
                <div className="fb-empty">
                  <MessageSquare size={24} aria-hidden="true" fill="currentColor" />
                  <p className="fb-empty-title">No notes yet</p>
                  <p className="fb-empty-text">Notes you leave on any case study show up here.</p>
                  <button type="button" className="fb-empty-action" onClick={() => setPanel("compose")}>
                    Write a note
                  </button>
                </div>
              ) : (
                <div className="fb-notes">
                  {groups.map(([notePage, notes]) => {
                    const here = notePage === page;
                    return (
                      <section key={notePage} aria-label={here ? "Your notes on this case study" : `Your notes on ${pageName(notes[0])}`}>
                        {/* This case study's notes need no heading; others are named, and open that case study */}
                        {!here && (
                          <p className="fb-notes-heading">
                            {pageName(notes[0])}
                            <ArrowUpRight size={14} aria-hidden="true" />
                          </p>
                        )}
                        <ol className="fb-timeline">
                          {notes.map((n) => {
                            const KindIcon = n.anchor.startsWith("page|") ? MessageSquare : KIND_ICONS[n.label] || Type;
                            const when = new Date(n.createdAt);
                            return (
                              <li key={n.id} data-active={activeNote === n.id}>
                                <span className="fb-timeline-dot" aria-hidden="true" />
                                <time className="fb-timeline-date" dateTime={when.toISOString()}>
                                  {when.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                  <span aria-hidden="true"> · </span>
                                  {when.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                                </time>
                                <div className="fb-note-card">
                                <button type="button" className="fb-note" onClick={() => goToNote(n)}>
                                  <span className="fb-note-where">
                                    <KindIcon size={14} aria-hidden="true" {...fill(KindIcon)} />
                                    <span className="fb-note-kind">{n.label}</span>
                                    {!n.anchor.startsWith("page|") && <span className="fb-note-section">in {n.sectionLabel}</span>}
                                    {!here && <span className="sr-only">, opens {pageName(n)}</span>}
                                  </span>
                                  <span className="fb-note-text">{n.text}</span>
                                  {n.hasImage && !brokenImages.has(n.id) && (
                                    // eslint-disable-next-line @next/next/no-img-element -- the reviewer's own private image
                                    <img
                                      className="fb-note-thumb"
                                      src={`${IMAGE_PATH}?id=${n.id}&author=${fb.author}`}
                                      alt="The image you attached"
                                      loading="lazy"
                                      onError={() => setBrokenImages((b) => new Set(b).add(n.id))}
                                    />
                                  )}
                                  {(n.category || (n.hasImage && brokenImages.has(n.id))) && (
                                    <span className="fb-note-meta">
                                      {n.category && <span className="fb-chip">{CATEGORIES[n.category]}</span>}
                                      {n.hasImage && brokenImages.has(n.id) && (
                                        <span className="fb-note-image">
                                          <ImageIcon size={12} aria-hidden="true" />
                                          Image attached
                                        </span>
                                      )}
                                    </span>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  className="fb-note-delete"
                                  aria-label={`Delete your note "${n.text.slice(0, 40)}${n.text.length > 40 ? "…" : ""}"`}
                                  title="Delete note"
                                  onClick={() => deleteNote(n)}
                                >
                                  <Trash2 size={14} aria-hidden="true" />
                                </button>
                                </div>
                              </li>
                            );
                          })}
                        </ol>
                      </section>
                    );
                  })}
                </div>
              )
            ) : (
            <>
            <div className="fb-about">
              <button
                type="button"
                className="fb-target"
                title={about.el ? "Show this block" : undefined}
                aria-label={
                  about.el
                    ? `Commenting on ${about.label.toLowerCase()} in ${about.sectionLabel}. Show it on the page`
                    : "Commenting on the whole case study. Click a block on the page to be specific"
                }
                onClick={() => about.el?.scrollIntoView({ behavior: "smooth", block: "center" })}
              >
                <TargetIcon size={14} aria-hidden="true" {...fill(TargetIcon)} />
                <span className="fb-target-kind">{about.label}</span>
                {about.el && <span className="fb-target-where">in {about.sectionLabel}</span>}
              </button>
            </div>

            <div
              className="fb-composer"
              data-dragging={dragging}
              onDragOver={(e) => {
                if (!fb.imagesEnabled || !Array.from(e.dataTransfer.types).includes("Files")) return;
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                if (!fb.imagesEnabled) return;
                e.preventDefault();
                setDragging(false);
                attach(Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/")));
              }}
            >
              <label className="sr-only" htmlFor="fb-text">
                Your feedback
              </label>
              <textarea
                id="fb-text"
                aria-describedby="fb-status"
                ref={textRef}
                className="fb-composer-text"
                placeholder="What would make this clearer?"
                maxLength={LIMITS.text}
                rows={3}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  if (state !== "sending") setState("idle");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
                }}
                onPaste={(e) => {
                  if (!fb.imagesEnabled) return;
                  const file = Array.from(e.clipboardData.files).find((f) => f.type.startsWith("image/"));
                  if (file) {
                    e.preventDefault();
                    attach(file);
                  }
                }}
              />

              {image && (
                <div className="fb-attachment">
                  {/* eslint-disable-next-line @next/next/no-img-element -- a local preview, not a site image */}
                  <img src={image.preview} alt="Image to send with your feedback" />
                  <button type="button" className="fb-attachment-remove" onClick={clearImage}>
                    <X size={12} aria-hidden="true" />
                    <span className="sr-only">Remove image</span>
                  </button>
                </div>
              )}

              <div className="fb-composer-bar">
                <CategoryMenu value={category} onChange={setCategory} />
                {fb.imagesEnabled && (
                  <>
                    <button
                      type="button"
                      className="fb-tool"
                      data-filled={Boolean(image)}
                      onClick={() => fileRef.current?.click()}
                      title="Add an image (or paste or drop one)"
                    >
                      <ImageIcon size={16} aria-hidden="true" />
                      <span className="sr-only">Add an image</span>
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="sr-only"
                      tabIndex={-1}
                      aria-hidden="true"
                      onChange={(e) => attach(e.target.files?.[0])}
                    />
                  </>
                )}
                <button
                  type="submit"
                  className="fb-send"
                  aria-disabled={!draft.trim() || state === "sending"}
                  title="Send (⌘↵)"
                >
                  <ArrowUp size={16} aria-hidden="true" />
                  <span className="sr-only">Send feedback</span>
                </button>
              </div>
            </div>
            {/* Honeypot: hidden from people, filled by bots */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="fb-trap" aria-hidden="true" />

            <div className="fb-card-foot">
              <label className="fb-name-field">
                <CircleUser size={16} aria-hidden="true" />
                <span className="sr-only">Your name (optional)</span>
                <input
                  placeholder="Your name (optional)"
                  maxLength={LIMITS.name}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <p id="fb-status" className="fb-card-note" aria-live="polite" data-state={state}>
                {state === "sent"
                  ? "Sent. Thank you!"
                  : state === "error"
                    ? "Couldn't send. Try again."
                    : state === "image-error"
                      ? "That image didn't work. Try another."
                      : state === "sending"
                        ? "Sending…"
                        : draft.length > LIMITS.text - 100
                          ? `${draft.length}/${LIMITS.text}`
                          : ""}
              </p>
            </div>
            </>
            )}
            </div>
          </form>
        )}
      </div>
    </>
  );
}
