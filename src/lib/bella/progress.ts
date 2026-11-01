"use client";

// ── Bella: what a visitor has found ───────────────────────────────────────────
// Everything Bella rewards is about exploring, never waiting:
//
//   room keys   one per case study finished: its end reached after at least a minute
//               of active time on it. Numbered like the rooms on the work cards.
//   stamps      five small finds (lib/bella/stampArt).
//   goals       a short bow-tie celebration, once per visitor each: two case studies in
//               one visit, the resume, every case study, the first email copied.
//
// It also remembers who the visitor said they're here as, and where they were reading,
// so a returning visitor can pick up where they left off. All of it lives in this
// browser's localStorage (keys finished this visit in sessionStorage); the server only
// hears anonymous counts, through track().
//
// Each reward becomes a "moment": queued, then played by whichever Bella is on screen
// (the footer's while it's up, the navbar's otherwise) for a few seconds each, one at a
// time, and only while the tab is visible.

import { useSyncExternalStore } from "react";
import { artemisDesignSystem, featuredWorks, roomFor, type FeaturedWork } from "@/content/works";
import { STAMPS, stampDate, type StampKey } from "./stampArt";
import { track } from "@/lib/curiosity/report";
import type { BellaEvent } from "@/lib/curiosity/config";

// ── Case studies ──
const SHORT: Record<string, string> = {
  helix: "Helix",
  "tcs-find-a-trip": "TCS Find a Trip",
  "artemis-reservations": "Artemis Reservations",
  "artemis-insurance": "Artemis Insurance",
  "artemis-design-system": "Artemis Design System",
};
const room = (w: FeaturedWork, i: number) => (featuredWorks.includes(w) ? roomFor(w) : String(101 + i));
export const CASE_STUDIES = [...featuredWorks, artemisDesignSystem]
  .filter((w) => w.href.startsWith("/works/"))
  .map((w, i) => {
    const slug = w.href.slice("/works/".length);
    return { slug, name: SHORT[slug] ?? w.title, room: room(w, i), href: w.href };
  });
export const caseStudy = (slug: string) => CASE_STUDIES.find((c) => c.slug === slug);

// ── Storage ──
export type Goal = "two" | "resume" | "all" | "email";
export type HereAs = "Recruiter" | "Designer" | "Engineer" | "Just curious";
export interface Reading {
  slug: string;
  section: string;
  sectionId: string;
  at: number;
}
export interface Progress {
  keys: Record<string, number>;
  stamps: Partial<Record<StampKey, number>>;
  goals: Partial<Record<Goal, number>>;
  hereAs: HereAs | null;
  reading: Reading | null;
  /** Local date (YYYY-MM-DD) of the last visit, for Back again. */
  lastDay: string | null;
}

const KEY = "ash.bella.progress"; // localStorage
const VISIT_KEYS = "ash.bella.visitKeys"; // sessionStorage
const EMPTY: Progress = { keys: {}, stamps: {}, goals: {}, hereAs: null, reading: null, lastDay: null };

let cache: Progress | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function readProgress(): Progress {
  if (cache) return cache;
  try {
    cache = { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    cache = { ...EMPTY };
  }
  return cache!;
}
function save(next: Progress) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  emit();
}
function visitKeys(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(VISIT_KEYS) || "[]");
  } catch {
    return [];
  }
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    readProgress,
    () => EMPTY,
  );
}

// ── Moments ──
export type Moment =
  | { kind: "key"; room: string; line: string }
  | { kind: "stamp"; stamp: StampKey; line: string }
  | { kind: "celebrate"; line: string; stamp?: StampKey }
  | { kind: "welcome"; line: string; href: string; link: string };

const LENGTH: Record<Moment["kind"], number> = { key: 3000, stamp: 3200, celebrate: 3600, welcome: 7000 };
type Queued = Moment & { id: number };
const queue: Queued[] = [];
let current: Queued | null = null;
let nextId = 1;
let timer = 0;
const momentListeners = new Set<() => void>();
const emitMoment = () => momentListeners.forEach((l) => l());

function advance() {
  if (current || !queue.length) return;
  if (document.hidden) {
    // Wait until someone's looking
    document.addEventListener("visibilitychange", advance, { once: true });
    return;
  }
  current = queue.shift()!;
  emitMoment();
  timer = window.setTimeout(() => {
    current = null;
    emitMoment();
    window.setTimeout(advance, 400);
  }, LENGTH[current.kind]);
}

export function pushMoment(m: Moment, delay = 0) {
  window.setTimeout(() => {
    queue.push({ ...m, id: nextId++ });
    advance();
  }, delay);
}

/** The moment playing right now, if any. */
export function useMoment(): Queued | null {
  return useSyncExternalStore(
    (l) => {
      momentListeners.add(l);
      return () => momentListeners.delete(l);
    },
    () => current,
    () => null,
  );
}

/** Cut the current moment short (the visitor dismissed it). */
export function skipMoment() {
  if (!current) return;
  window.clearTimeout(timer);
  current = null;
  emitMoment();
  window.setTimeout(advance, 200);
}

// ── Rewards ──
const stampName = (k: StampKey) => STAMPS.find((s) => s.key === k)!.name;

/** Give a stamp if it's new. Returns true when it was. */
export function awardStamp(k: StampKey, { quiet = false } = {}) {
  const p = readProgress();
  if (p.stamps[k]) return false;
  save({ ...p, stamps: { ...p.stamps, [k]: Date.now() } });
  track(`stamp_${k}` as BellaEvent);
  if (!quiet) pushMoment({ kind: "stamp", stamp: k, line: `New stamp: ${stampName(k)}.` });
  return true;
}

/** A goal's celebration, once per visitor. A stamp that comes with it is shown in the same moment. */
export function celebrate(goal: Goal, line: string, stamp?: StampKey, delay = 0) {
  const p = readProgress();
  if (p.goals[goal]) return false;
  save({ ...p, goals: { ...p.goals, [goal]: Date.now() } });
  track(`goal_${goal}` as BellaEvent);
  const gotStamp = stamp ? awardStamp(stamp, { quiet: true }) : false;
  pushMoment({ kind: "celebrate", line, stamp: gotStamp ? stamp : undefined }, delay);
  return true;
}

/** The visitor reached the end of a case study after reading it for a while. */
export function finishCaseStudy(slug: string) {
  const study = caseStudy(slug);
  if (!study) return;
  const p = readProgress();
  const fresh = !p.keys[slug];
  if (fresh) {
    save({ ...p, keys: { ...p.keys, [slug]: Date.now() } });
    track("key_earned");
    pushMoment({ kind: "key", room: study.room, line: `Room key ${study.room}: ${study.name}.` });
  }
  const thisVisit = visitKeys();
  if (!thisVisit.includes(slug)) {
    thisVisit.push(slug);
    try {
      sessionStorage.setItem(VISIT_KEYS, JSON.stringify(thisVisit));
    } catch {}
  }
  if (thisVisit.length >= 2) celebrate("two", "Two case studies in one visit.", "two");
  const all = CASE_STUDIES.every((c) => readProgress().keys[c.slug]);
  if (all) celebrate("all", `All ${CASE_STUDIES.length} case studies read.`);
}

export function setHereAs(v: HereAs) {
  const p = readProgress();
  if (p.hereAs === v) return;
  save({ ...p, hereAs: v });
  track(`here_${v === "Just curious" ? "curious" : v.toLowerCase()}` as BellaEvent);
}

export function saveReading(r: Reading) {
  const p = readProgress();
  if (p.reading && p.reading.slug === r.slug && p.reading.sectionId === r.sectionId) return;
  save({ ...p, reading: r });
}

/** Once per visit, on arrival: Back again for a new day, and an offer to pick up the reading. */
export function arrive(visits: number, here: string) {
  const p = readProgress();
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const returning = visits > 1 && p.lastDay !== null && p.lastDay !== today;
  if (p.lastDay !== today) save({ ...p, lastDay: today });
  if (!returning) return;
  const gotBack = awardStamp("back", { quiet: true });
  const study = p.reading && caseStudy(p.reading.slug);
  if (study && !here.startsWith(study.href)) {
    pushMoment(
      { kind: "welcome", line: `Welcome back. You were reading ${study.name}, ${p.reading!.section}.`, href: `${study.href}#${p.reading!.sectionId}`, link: "Continue" },
      2500,
    );
  }
  if (gotBack) pushMoment({ kind: "stamp", stamp: "back", line: "New stamp: Back again." }, 2600);
}

export { stampDate };
