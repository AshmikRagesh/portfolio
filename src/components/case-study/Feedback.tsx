"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowUp,
  Bug,
  CaretDown,
  ChatCircleDots,
  Check,
  ImageSquare,
  ListBullets,
  Palette,
  Quotes,
  Table,
  Tag,
  TextAa,
  TextAlignLeft,
  TextH,
  TextT,
  UserCircle,
  VideoCamera,
  Wheelchair,
  X,
  type Icon,
} from "@phosphor-icons/react";
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
type Target = ReturnType<typeof describe> & { el: HTMLElement };

interface FeedbackState {
  on: boolean;
  setOn: (on: boolean) => void;
  items: Saved[];
  add: (item: Saved) => void;
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
  const page = usePathname();
  const [on, setOn] = useState(false);
  const [items, setItems] = useState<Saved[]>([]);
  const [author, setAuthor] = useState("");

  useEffect(() => setAuthor(authorId()), []);

  // This reviewer's earlier comments on this page
  useEffect(() => {
    if (!author) return;
    let live = true;
    fetch(`${FEEDBACK_PATH}?page=${encodeURIComponent(page)}&author=${author}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list: Saved[]) => live && setItems(list))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [author, page]);

  const add = useCallback((item: Saved) => setItems((list) => [...list, item]), []);

  return <Ctx.Provider value={{ on, setOn, items, add, author, imagesEnabled }}>{children}</Ctx.Provider>;
}

/** The round button that sits beside the section pill. */
export function FeedbackButton() {
  const fb = useFeedback();
  if (!fb) return null;
  const { on, setOn, items } = fb;
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

const CATEGORY_ICONS: Record<FeedbackCategory, Icon> = {
  accessibility: Wheelchair,
  content: TextAa,
  visual: Palette,
  bug: Bug,
};

const KIND_ICONS: Record<string, Icon> = {
  Heading: TextH,
  Paragraph: TextAlignLeft,
  "List item": ListBullets,
  Quote: Quotes,
  Image: ImageSquare,
  Video: VideoCamera,
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
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            show();
          }
        }}
      >
        <Current size={14} weight={value ? "fill" : "regular"} aria-hidden="true" />
        {value ? CATEGORIES[value] : "Category"}
        <CaretDown size={10} weight="bold" aria-hidden="true" className="fb-select-caret" />
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
            const OptionIcon = o.value ? CATEGORY_ICONS[o.value] : X;
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
                <OptionIcon size={16} aria-hidden="true" />
                <span>{o.label}</span>
                {o.value === value && o.value && <Check size={14} weight="bold" aria-hidden="true" className="fb-menu-check" />}
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
  const items = fb?.items ?? NONE;

  useEffect(() => setName(storageGet(NAME_KEY) ?? ""), []);

  const root = () => document.querySelector<HTMLElement>("[data-cs-main]");

  const pick = useCallback(
    (el: HTMLElement) => {
      const main = root();
      if (!main) return;
      setTarget({ el, ...describe(el, main, sections) });
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

  // Deep link from the inbox: /works/x?fb=<anchor> opens feedback mode on that block
  useEffect(() => {
    const anchor = new URLSearchParams(window.location.search).get("fb");
    const main = root();
    if (!anchor || !main || !setOn) return;
    const el = locate(anchor, "", main);
    if (!el) return;
    setOn(true);
    el.scrollIntoView({ block: "center" });
    pick(el);
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (targetRef.current) setTarget(null);
      else setOn?.(false);
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

  // Leaving feedback mode closes the card (only on the switch off, so a deep link
  // that opens the mode and picks a block in the same pass keeps its card)
  const wasOn = useRef(on);
  useEffect(() => {
    if (wasOn.current && !on) setTarget(null);
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

  // Focus the comment box when a block is picked
  useEffect(() => {
    if (target) textRef.current?.focus({ preventScroll: true });
  }, [target]);

  if (!fb) return null;

  const thread = target ? items.filter((i) => i.anchor === target.anchor) : [];
  const TargetIcon = (target && KIND_ICONS[target.label]) || TextT;
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
      {on && (
        <div className="fb-strip" role="status">
          <span className="fb-strip-dot" aria-hidden="true" />
          <span className="fb-strip-wide">Feedback mode · click any block to comment</span>
          <span className="fb-strip-narrow">Tap any block to comment</span>
          <button type="button" className="fb-strip-exit" onClick={() => setOn?.(false)}>
            Exit <kbd>Esc</kbd>
          </button>
        </div>
      )}

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

      <div ref={cardRef} className="fb-card" data-open={Boolean(on && target)} inert={!(on && target)}>
        {target && (
          <form onSubmit={send} className="fb-card-form">
            <header className="fb-card-head">
              <p className="fb-card-title">Leave feedback</p>
              <button type="button" className="fb-icon-button" onClick={() => setTarget(null)}>
                <X size={16} aria-hidden="true" />
                <span className="sr-only">Close</span>
              </button>
            </header>

            {thread.length > 0 && (
              <section className="fb-thread" aria-label="Your earlier feedback on this block">
                <p className="fb-thread-heading">Your earlier feedback</p>
                <ul>
                  {thread.map((c) => (
                    <li key={c.id}>
                      <p className="fb-thread-meta">
                        <span className="fb-thread-name">{c.name || "You"}</span>
                        <span>{new Date(c.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                        {c.category && <span className="fb-chip">{CATEGORIES[c.category]}</span>}
                      </p>
                      <p className="fb-thread-text">{c.text}</p>
                      {c.hasImage && (
                        <p className="fb-thread-attach">
                          <ImageSquare size={14} aria-hidden="true" />
                          Image attached
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

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
              <button
                type="button"
                className="fb-target"
                title="Show this block"
                onClick={() => target.el.scrollIntoView({ behavior: "smooth", block: "center" })}
              >
                <TargetIcon size={14} weight="bold" aria-hidden="true" />
                <span className="fb-target-kind">{target.label}</span>
                <span className="fb-target-where">in {target.sectionLabel}</span>
              </button>
              <label className="sr-only" htmlFor="fb-text">
                Your feedback
              </label>
              <textarea
                id="fb-text"
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
                    <X size={12} weight="bold" aria-hidden="true" />
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
                      <ImageSquare size={16} weight={image ? "fill" : "regular"} aria-hidden="true" />
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
                  <ArrowUp size={16} weight="bold" aria-hidden="true" />
                  <span className="sr-only">Send feedback</span>
                </button>
              </div>
            </div>
            {/* Honeypot: hidden from people, filled by bots */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="fb-trap" aria-hidden="true" />

            <div className="fb-card-foot">
              <label className="fb-name-field">
                <UserCircle size={16} aria-hidden="true" />
                <span className="sr-only">Your name (optional)</span>
                <input
                  placeholder="Your name (optional)"
                  maxLength={LIMITS.name}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <p className="fb-card-note" aria-live="polite" data-state={state}>
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
          </form>
        )}
      </div>
    </>
  );
}
