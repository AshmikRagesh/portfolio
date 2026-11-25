"use client";

// ── Password gate ─────────────────────────────────────────────────────────────
// Sits over a locked case study's image (the home work card, and the password screen
// the locked address shows). Modelled on lydiashan.com's locked cards:
//   hover    the cursor becomes a frosted "Enter password" pill that follows the pointer.
//   click    the pill opens out, where it is, into a password field with a round submit
//            button that turns grape once something's typed.
//   wrong    the field shakes and clears.
//   right    the lock springs open, then the case study loads — or, for a card with nothing
//            behind it yet (comingSoon), the pill reads "Case study coming soon".
// Phones and tablets have no hover, so the pill rests at the foot of the image instead,
// and a tap opens the field right where the finger landed (kept inside the card); when the
// keyboard comes up, the field is scrolled to stay in sight above it. Escape, or a click
// away, folds the field back into the pill.
//
// The check happens on the server (/api/unlock); this is only the way in.

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
// The same lucide icons, at the same 2px stroke, as the card's "Unlock to read case study" button
import { ArrowRight, LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { flagName } from "@/lib/caseLock";
import { useTouchScreen } from "@/components/host/useTouchScreen";

type State = "pill" | "form" | "checking" | "open" | "soon";

export type PasswordGateHandle = {
  /** Open the field — at the pointer when the click came from inside the image, else in the middle. */
  open: (clientX?: number, clientY?: number) => void;
};

/** Whether this browser already entered the password (the readable twin of the real cookie). */
export function useUnlocked(slug: string) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  useEffect(() => {
    setUnlocked(document.cookie.split("; ").includes(`${flagName(slug)}=1`));
  }, [slug]);
  return unlocked;
}

const PILL_W = 168; // for keeping the pill and field inside the image
const FORM_W = 264;
const H = 44;
const EDGE = 12;

type Props = {
  slug: string;
  href: string;
  /** Always show the resting pill, not only on hover (the password screen) */
  pinned?: boolean;
  /** No case study yet: the right password shows "coming soon" instead of loading a page */
  comingSoon?: boolean;
  className?: string;
};

const PasswordGate = forwardRef<PasswordGateHandle, Props>(function PasswordGate(
  { slug, href, pinned = false, comingSoon = false, className = "" },
  ref,
) {
  const touch = useTouchScreen();
  const areaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<State>("pill");
  const [inside, setInside] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [value, setValue] = useState("");
  const [shake, setShake] = useState(0);
  const [message, setMessage] = useState("");

  const resting = touch || pinned;

  // Where the pill sits when it isn't following a pointer: the foot of the image
  const restPos = useCallback(() => {
    const r = areaRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return resting ? { x: r.width / 2, y: r.height - EDGE - H / 2 } : { x: r.width / 2, y: r.height / 2 };
  }, [resting]);

  // Keep a box of this width inside the image
  const clamp = useCallback((p: { x: number; y: number }, width: number) => {
    const r = areaRef.current?.getBoundingClientRect();
    if (!r) return p;
    const half = Math.min(width, r.width - EDGE * 2) / 2;
    return {
      x: Math.min(Math.max(p.x, EDGE + half), r.width - EDGE - half),
      y: Math.min(Math.max(p.y, EDGE + H / 2), r.height - EDGE - H / 2),
    };
  }, []);

  const toLocal = (clientX: number, clientY: number) => {
    const r = areaRef.current!.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  };

  const openAt = useCallback(
    (clientX?: number, clientY?: number) => {
      if (state !== "pill") return;
      const r = areaRef.current?.getBoundingClientRect();
      const inImage =
        r && clientX !== undefined && clientY !== undefined &&
        clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
      // Open where the click or tap landed; from the keyboard (no point), where the pill is
      const from = inImage ? toLocal(clientX!, clientY!) : (pos ?? restPos());
      setPos(clamp(from, FORM_W));
      setMessage("");
      setState("form");
    },
    [state, resting, pos, restPos, clamp],
  );

  useImperativeHandle(ref, () => ({ open: openAt }), [openAt]);

  useEffect(() => {
    if (state === "form") inputRef.current?.focus({ preventScroll: true });
  }, [state]);

  // Phones: once the keyboard is up, bring the field into the visible part of the screen
  // if the keyboard covers it
  useEffect(() => {
    if (state !== "form" || !touch) return;
    const vv = window.visualViewport;
    const keepInSight = () => {
      const form = areaRef.current?.querySelector<HTMLElement>(".pw-form");
      if (!form) return;
      const r = form.getBoundingClientRect();
      const bottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
      if (r.bottom > bottom - 16 || r.top < 80) form.scrollIntoView({ block: "center", behavior: "smooth" });
    };
    vv?.addEventListener("resize", keepInSight);
    const t = window.setTimeout(keepInSight, 360);
    return () => {
      vv?.removeEventListener("resize", keepInSight);
      window.clearTimeout(t);
    };
  }, [state, touch]);

  const close = useCallback(() => {
    setState((s) => (s === "form" || s === "soon" ? "pill" : s));
    setValue("");
    setMessage("");
  }, []);

  // Escape, or a press anywhere outside the field, folds it back into the pill
  useEffect(() => {
    if (state !== "form" && state !== "soon") return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onDown = (e: PointerEvent) => {
      if (!(e.target as Element).closest(".pw-form, .pw-soon")) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown, true);
    };
  }, [state, close]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!value || state !== "form") return;
    setState("checking");
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password: value }),
      });
      if (res.ok && comingSoon) {
        setState("open");
        setMessage("Case study coming soon");
        window.setTimeout(() => setState("soon"), 560);
        setValue("");
        return;
      }
      if (res.ok) {
        setState("open");
        setMessage("Unlocked");
        // A full load, so the unlocked page comes from the server rather than a cached lock screen
        window.setTimeout(() => window.location.assign(href), 520);
        return;
      }
      const err = res.status === 503 ? "The password isn't set up yet." : "That's not the password.";
      setMessage(err);
    } catch {
      setMessage("Couldn't check the password. Try again.");
    }
    setState("form");
    setValue("");
    setShake((n) => n + 1);
    window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0);
  };

  const showForm = state !== "pill";
  const pillAt = resting || !pos ? restPos() : pos;
  const pillPos = clamp(pillAt, PILL_W);
  const visible = showForm || resting || inside;

  return (
    <div
      ref={areaRef}
      className={`pw-gate ${className}`}
      data-cursor-off={!showForm && !resting ? "" : undefined}
      data-state={state}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        setInside(true);
        if (state === "pill") setPos(toLocal(e.clientX, e.clientY));
      }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || state !== "pill") return;
        setPos(toLocal(e.clientX, e.clientY));
      }}
      onPointerLeave={() => setInside(false)}
      onClick={(e) => {
        if ((e.target as Element).closest(".pw-form")) {
          // Clicks inside the field stay there. The card around it is a link, so a click on
          // the field itself mustn't follow it; the submit button keeps its own default.
          e.stopPropagation();
          if (!(e.target as Element).closest("button")) e.preventDefault();
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        openAt(e.clientX, e.clientY);
      }}
    >
      <div className="pw-layer" data-visible={visible || undefined}>
        {state === "soon" ? (
          <div
            className="pw-pill pw-soon"
            style={{ transform: `translate(${pos!.x}px, ${pos!.y}px) translate(-50%, -50%)` }}
          >
            <LockKeyholeOpen size={16} strokeWidth={2} aria-hidden="true" />
            Case study coming soon
          </div>
        ) : !showForm ? (
          <button
            type="button"
            className="pw-pill"
            tabIndex={-1}
            aria-hidden="true"
            data-resting={resting || undefined}
            style={{ transform: `translate(${pillPos.x}px, ${pillPos.y}px) translate(-50%, -50%)` }}
          >
            <LockKeyhole size={16} strokeWidth={2} aria-hidden="true" />
            Enter password
          </button>
        ) : (
          <form
            key={shake}
            className={`pw-form ${shake ? "pw-form--shake" : ""}`}
            data-state={state}
            noValidate
            onSubmit={submit}
            style={{ transform: `translate(${pos!.x}px, ${pos!.y}px) translate(-50%, -50%)` }}
          >
            <span className="pw-lock" aria-hidden="true">
              {state === "open" ? <LockKeyholeOpen size={16} strokeWidth={2} /> : <LockKeyhole size={16} strokeWidth={2} />}
            </span>
            <input
              ref={inputRef}
              type="password"
              className="pw-input"
              autoComplete="current-password"
              aria-label="Case study password"
              placeholder="Password"
              spellCheck={false}
              value={value}
              disabled={state !== "form"}
              onChange={(e) => setValue(e.target.value)}
            />
            <button
              type="submit"
              className="pw-submit"
              data-ready={value ? "" : undefined}
              aria-label="Open the case study"
              disabled={!value || state !== "form"}
            >
              <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          </form>
        )}
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {message}
      </span>
    </div>
  );
});

export default PasswordGate;
