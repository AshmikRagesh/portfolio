"use client";

// ── Chelsea ───────────────────────────────────────────────────────────────────
// The lion and staff on their own, no circle, made as a luxury enamel pin: a polished
// gold outline with grape cloisonné enamel inside it (the shape shrunk inwards for the
// enamel, so a raised gold wall runs all the way round), a glossy reflection across the
// enamel, gold eye and staff ring, and a small gold bar underneath, "CFC · LDN", in
// gold on grape. A point light follows the pointer so the polish moves across the gold.
//
// Hover leans it towards the pointer. Click (with a very quiet clink) and it comes to
// the middle of the screen and turns over into Chelsea's next match, live from ESPN.

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { LION_BODY, LION_EYE, LION_RING, LION_STAFF, LION_TRANSFORM, LION_VIEWBOX } from "./lionPath";
import { clink, useCursorLight } from "./light";
import FocusOverlay, { FlipStage, TURN_MS, useReducedMotion, type FocusPhase } from "./FocusOverlay";

const W = 200;
const H = 300;
const LION_SCALE = Math.min(W / LION_VIEWBOX.w, 256 / LION_VIEWBOX.h);
const LION_X = (W - LION_VIEWBOX.w * LION_SCALE) / 2;
const PLACE = `translate(${LION_X} 0) scale(${LION_SCALE}) translate(${-LION_VIEWBOX.x} ${-LION_VIEWBOX.y})`;

function Lion({ fill }: { fill: string }) {
  return (
    <g transform={PLACE}>
      <g transform={LION_TRANSFORM} fill={fill}>
        <path d={LION_BODY} />
        <path d={LION_STAFF} />
      </g>
    </g>
  );
}

export function LionArt({ id, svgRef }: { id: string; svgRef?: React.Ref<SVGSVGElement> }) {
  const f = (s: string) => `${id}-${s}`;
  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="block h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={f("gold")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1c4" />
          <stop offset="0.22" stopColor="#e3b553" />
          <stop offset="0.45" stopColor="#a06d17" />
          <stop offset="0.62" stopColor="#f7d784" />
          <stop offset="0.82" stopColor="#b8842a" />
          <stop offset="1" stopColor="#6e480c" />
        </linearGradient>
        <linearGradient id={f("enamel")} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#b02a83" />
          <stop offset="0.4" stopColor="#7d0f56" />
          <stop offset="1" stopColor="#32073e" />
        </linearGradient>
        <linearGradient id={f("gloss")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.34" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.42" stopColor="#fff" stopOpacity="0.32" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>

        {/* Polished gold: a tight bevel and a sharp highlight from the pointer's light */}
        <filter id={f("goldLit")} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.6" result="bevel" />
          <feSpecularLighting in="bevel" surfaceScale="4" specularConstant="1.4" specularExponent="38" lightingColor="#fffaf0" result="spec">
            <fePointLight data-light="" x="40" y="30" z="110" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
          <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
        </filter>
        {/* Enamel: the lion shrunk inwards so a gold wall shows round it, slightly domed and glossy */}
        <filter id={f("enamelFx")} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceGraphic" operator="erode" radius="2.6" result="enamel" />
          <feMorphology in="SourceAlpha" operator="erode" radius="2.6" result="insetA" />
          <feMorphology in="SourceAlpha" operator="erode" radius="5" result="deepA" />
          <feComposite in="insetA" in2="deepA" operator="out" result="lip" />
          <feGaussianBlur in="lip" stdDeviation="1.2" result="lipSoft" />
          <feFlood floodColor="#1e0525" floodOpacity="0.45" />
          <feComposite in2="lipSoft" operator="in" result="lipShade0" />
          <feComposite in="lipShade0" in2="insetA" operator="in" result="lipShade" />
          <feGaussianBlur in="insetA" stdDeviation="3" result="dome" />
          <feSpecularLighting in="dome" surfaceScale="2" specularConstant="0.55" specularExponent="28" lightingColor="#ffe6f6" result="spec">
            <fePointLight data-light="" x="40" y="30" z="140" />
          </feSpecularLighting>
          <feComposite in="spec" in2="insetA" operator="in" result="specIn" />
          <feMerge>
            <feMergeNode in="enamel" />
            <feMergeNode in="lipShade" />
            <feMergeNode in="specIn" />
          </feMerge>
        </filter>
        <filter id={f("shadow")} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#1e0525" floodOpacity="0.3" />
          <feDropShadow dx="0" dy="12" stdDeviation="9" floodColor="#1e0525" floodOpacity="0.18" />
        </filter>
        <clipPath id={f("clip")}>
          <path d={LION_BODY} transform={`${PLACE} ${LION_TRANSFORM}`} />
          <path d={LION_STAFF} transform={`${PLACE} ${LION_TRANSFORM}`} />
        </clipPath>
      </defs>

      <g filter={`url(#${f("shadow")})`}>
        {/* Gold body */}
        <g filter={`url(#${f("goldLit")})`}>
          <Lion fill={`url(#${f("gold")})`} />
          <rect x="44" y="266" width="112" height="28" rx="6" fill={`url(#${f("gold")})`} />
        </g>
        {/* Enamel inlay */}
        <g filter={`url(#${f("enamelFx")})`}>
          <Lion fill={`url(#${f("enamel")})`} />
          <rect x="44" y="266" width="112" height="28" rx="6" fill={`url(#${f("enamel")})`} />
        </g>
        {/* Gold eye and staff ring, raised through the enamel */}
        <g filter={`url(#${f("goldLit")})`}>
          <g transform={PLACE}>
            <g transform={LION_TRANSFORM} fill={`url(#${f("gold")})`}>
              <path d={LION_EYE} />
              <path d={LION_RING} />
            </g>
          </g>
        </g>
        {/* A sweep of reflection over the pin */}
        <rect x="0" y="0" width={W} height="260" fill={`url(#${f("gloss")})`} clipPath={`url(#${f("clip")})`} />
        {/* Gold letters standing up out of the bar's enamel */}
        <text x="100" y="285" textAnchor="middle" fontFamily="var(--font-brand), monospace" fontSize="13" fontWeight="700" letterSpacing="3" fill="#1e0525" opacity="0.45" dy="0.9">
          CFC · LDN
        </text>
        <text x="100" y="285" textAnchor="middle" fontFamily="var(--font-brand), monospace" fontSize="13" fontWeight="700" letterSpacing="3" fill={`url(#${f("gold")})`}>
          CFC · LDN
        </text>
      </g>
    </svg>
  );
}

// ── The next fixture (back) ───────────────────────────────────────────────────
// After matchday cards in sports apps (Apple Sports, the Premier League app): the two
// crests either side of the kick-off time, the competition and venue, a live countdown,
// then the two after it as a short list. Times are shown in the visitor's own time zone.

type Side = { name: string; abbr: string; logo: string; isChelsea: boolean };
type Match = { date: string; competition: string; venue: string; home: Side; away: Side };

function useFixtures(open: boolean) {
  const [data, setData] = useState<Match[] | null | "error">(null);
  useEffect(() => {
    if (!open || (data && data !== "error")) return;
    fetch("/api/fixture")
      .then((r) => r.json())
      .then((d: { next: Match[] }) => setData(d.next?.length ? d.next : "error"))
      .catch(() => setData("error"));
  }, [open, data]);
  return data;
}

function useNow(on: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!on) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [on]);
  return now;
}

const comp = (s: string) => s.replace(/^English /, "");
const day = (d: Date) => d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
const time = (d: Date) => d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
const zone = (d: Date) => d.toLocaleTimeString(undefined, { timeZoneName: "short" }).split(" ").pop();

function Crest({ side, size = 56 }: { side: Side; size?: number }) {
  return (
    <div className="flex w-[96px] flex-col items-center gap-2 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={side.logo} alt="" width={size} height={size} className="object-contain drop-shadow-[0_2px_4px_rgba(30,5,37,0.15)]" style={{ width: size, height: size }} />
      <span className={`font-geist text-body font-medium leading-tight ${side.isChelsea ? "text-heading" : "text-secondary"}`}>{side.name}</span>
    </div>
  );
}

function Countdown({ to, now }: { to: number; now: number }) {
  const left = Math.max(0, to - now);
  const parts = [
    [Math.floor(left / 864e5), "days"],
    [Math.floor(left / 36e5) % 24, "hrs"],
    [Math.floor(left / 6e4) % 60, "min"],
    [Math.floor(left / 1e3) % 60, "sec"],
  ] as const;
  if (left === 0) return <p className="font-geist text-body font-medium text-grape">Kicking off now</p>;
  return (
    <div className="flex items-start justify-center gap-2" role="timer" aria-label="Time to kick-off">
      {parts.map(([v, l], i) => (
        <div key={l} className="flex items-start gap-2">
          {i > 0 && <span className="pt-1 font-heading text-[24px] leading-none text-line">:</span>}
          <div className="flex w-[52px] flex-col items-center gap-1">
            <span className="font-heading text-[32px] leading-none tracking-[-1px] tabular-nums text-heading">{String(v).padStart(2, "0")}</span>
            <span className="font-geist text-caption text-muted">{l}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function FixtureCard({ open }: { open: boolean }) {
  const data = useFixtures(open);
  const now = useNow(open);
  const shell = "w-[calc(100vw-24px)] max-w-[420px] overflow-hidden rounded-[20px] bg-background shadow-[0_0_0_1px_rgba(30,5,37,0.06),0_2px_4px_rgba(30,5,37,0.04),0_24px_56px_rgba(30,5,37,0.16)]";
  if (data === null)
    return (
      <div className={`${shell} flex h-[360px] items-center justify-center`}>
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-grape" aria-label="Loading fixtures" />
      </div>
    );
  if (data === "error")
    return (
      <div className={`${shell} p-7`}>
        <p className="font-heading text-[24px] text-heading">Blue, always.</p>
        <p className="mt-2 font-geist text-body text-secondary">The fixture list isn’t loading right now. Try again in a bit.</p>
      </div>
    );
  const [m, ...later] = data;
  const at = new Date(m.date);
  return (
    <div className={shell}>
      <div className="relative overflow-hidden px-6 pb-6 pt-5 sm:px-7" style={{ background: "linear-gradient(180deg, #fbf7fc 0%, #ffffff 100%)" }}>
        <div className="flex items-center justify-between gap-4">
          <span className="font-geist text-caption font-medium text-grape">Next match</span>
          <span className="truncate font-geist text-caption text-muted">{comp(m.competition)}</span>
        </div>
        <div className="mt-6 flex items-start justify-between">
          <Crest side={m.home} />
          <div className="flex flex-col items-center gap-1 pt-3">
            <span className="font-heading text-[28px] leading-none tracking-[-0.8px] text-heading">{time(at)}</span>
            <span className="font-geist text-caption text-muted">
              {day(at)} · {zone(at)}
            </span>
          </div>
          <Crest side={m.away} />
        </div>
        <p className="mt-4 text-center font-geist text-caption text-muted">{m.venue}</p>
        <div className="mt-6 rounded-xl bg-surface py-4">
          <Countdown to={at.getTime()} now={now} />
        </div>
      </div>
      {later.length > 0 && (
        <div className="border-t border-line-soft px-6 py-4 sm:px-7">
          <p className="font-geist text-caption font-medium text-muted">After that</p>
          <ul className="mt-2 flex flex-col">
            {later.map((x) => {
              const d = new Date(x.date);
              const home = x.home.isChelsea;
              const opp = home ? x.away : x.home;
              return (
                <li key={x.date} className="flex items-center gap-3 border-t border-line-soft py-3 first:border-t-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={opp.logo} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
                  <span className="flex-1 font-geist text-body text-heading">
                    {home ? "vs" : "at"} {opp.name}
                  </span>
                  <span className="font-geist text-caption tabular-nums text-muted">
                    {day(d)}, {time(d)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── In the hero ───────────────────────────────────────────────────────────────
export default function ChelseaBadge({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const svg = useRef<SVGSVGElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  useCursorLight(svg, { w: W, h: H }, { tilt, tiltDeg: 10, reduced });
  const onClosed = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        ref={btn}
        type="button"
        onClick={() => {
          clink();
          setOpen(true);
        }}
        aria-label="Chelsea lion pin. See the next match"
        aria-haspopup="dialog"
        className={`group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grape ${className}`}
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        <div ref={tilt} className="h-full w-full" style={{ transformStyle: "preserve-3d" }}>
          <LionArt id={id} svgRef={svg} />
        </div>
      </button>

      <FocusOverlay source={btn.current} open={open} onClosed={onClosed} label="Chelsea's next match" width={W} height={H} fitWidth={W} fitHeight={H} closeMs={reduced ? 0 : TURN_MS}>
        {(phase) => <LionStage id={`${id}big`} phase={phase} />}
      </FocusOverlay>
    </>
  );
}

function LionStage({ id, phase }: { id: string; phase: FocusPhase }) {
  const svg = useRef<SVGSVGElement>(null);
  useCursorLight(svg, { w: W, h: H });
  return <FlipStage phase={phase} front={<LionArt id={id} svgRef={svg} />} back={<FixtureCard open />} />;
}
