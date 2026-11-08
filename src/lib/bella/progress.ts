"use client";

// ── Bella: what a visitor has found ───────────────────────────────────────────
// Everything Bella rewards is about exploring, never waiting:
//
//   finished    a case study whose end is reached after at least a minute of active
//               time on it; finished case studies count towards two of the goals.
//   goals       a short bow-tie celebration, once per visitor each: two case studies in
//               one visit, every case study, the resume, the first email copied, and
//               watching the walkthrough videos.
//
// It also remembers who the visitor said they're here as, and where they were reading,
// so a returning visitor can pick up where they left off. All of it lives in this
// browser's localStorage (case studies finished this visit in sessionStorage); the server only
// hears anonymous counts, through track().
//
// Each reward becomes a "moment": queued, then played by whichever Bella is on screen
// (the footer's while it's up, the navbar's otherwise) for a few seconds each, one at a
// time, and only while the tab is visible.

import { useSyncExternalStore } from "react";
import { artemisDesignSystem, artemisInsurance, artemisReservations, featuredWorks, roomFor, type FeaturedWork } from "@/content/works";
import type { StampKey } from "./stampArt";
import { track } from "@/lib/curiosity/report";
import type { BellaEvent } from "@/lib/curiosity/config";

// ── Case studies ──
const SHORT: Record<string, string> = {
  helix: "Helix",
  "tcs-search": "TCS Search",
  "tcs-find-a-trip": "TCS Find a Trip",
  bella: "Bella",
  "artemis-reservations": "Artemis Reservations",
  "artemis-insurance": "Artemis Insurance",
  "artemis-design-system": "Artemis Design System",
};
const room = (w: FeaturedWork, i: number) => (featuredWorks.includes(w) ? roomFor(w) : String(101 + i));
// The homepage works, then the Artemis case studies that stay live off the list. Only the
// listed ones count towards reading every case study
export const CASE_STUDIES = [...featuredWorks, artemisDesignSystem, artemisReservations, artemisInsurance]
  .filter((w) => w.href.startsWith("/works/"))
  .map((w, i) => {
    const slug = w.href.slice("/works/".length);
    return { slug, name: SHORT[slug] ?? w.title, room: room(w, i), href: w.href, listed: featuredWorks.includes(w) };
  });
const LISTED = CASE_STUDIES.filter((c) => c.listed);
export const caseStudy = (slug: string) => CASE_STUDIES.find((c) => c.slug === slug);

// ── Storage ──
export type Goal = "two" | "resume" | "all" | "email" | "video";
export type HereAs = "Recruiter" | "Designer" | "Engineer" | "Just curious";
export interface Reading {
  slug: string;
  section: string;
  sectionId: string;
  at: number;
}
export interface Progress {
  keys: Record<string, number>;
  /** Stamps found before they were retired; kept so old progress still reads. */
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
  | { kind: "celebrate"; line: string }
  | { kind: "welcome"; line: string; href: string; link: string };

// How long a moment stays up. Phones get a few seconds more, since the line sits over
// the page and is read while scrolling; either can be closed sooner with its cross.
const LENGTH: Record<Moment["kind"], number> = { celebrate: 4000, welcome: 7000 };
const PHONE_EXTRA = 2500;
const lengthOf = (k: Moment["kind"]) =>
  LENGTH[k] + (window.matchMedia("(hover: none), (pointer: coarse)").matches ? PHONE_EXTRA : 0);
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
  }, lengthOf(current.kind));
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
/** A goal's celebration, once per visitor. */
export function celebrate(goal: Goal, line: string, delay = 0) {
  const p = readProgress();
  if (p.goals[goal]) return false;
  save({ ...p, goals: { ...p.goals, [goal]: Date.now() } });
  track(`goal_${goal}` as BellaEvent);
  pushMoment({ kind: "celebrate", line }, delay);
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
  }
  const thisVisit = visitKeys();
  if (!thisVisit.includes(slug)) {
    thisVisit.push(slug);
    try {
      sessionStorage.setItem(VISIT_KEYS, JSON.stringify(thisVisit));
    } catch {}
  }
  if (thisVisit.length >= 2) celebrate("two", "Two case studies in one visit.");
  const all = LISTED.every((c) => readProgress().keys[c.slug]);
  if (all) celebrate("all", `All ${LISTED.length} case studies read.`);
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

/** Once per visit, on arrival: on a new day, an offer to pick up the reading. */
export function arrive(visits: number, here: string) {
  const p = readProgress();
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const returning = visits > 1 && p.lastDay !== null && p.lastDay !== today;
  if (p.lastDay !== today) save({ ...p, lastDay: today });
  if (!returning) return;
  const study = p.reading && caseStudy(p.reading.slug);
  if (study && !here.startsWith(study.href)) {
    pushMoment(
      { kind: "welcome", line: `Welcome back. You were reading ${study.name}, ${p.reading!.section}.`, href: `${study.href}#${p.reading!.sectionId}`, link: "Continue" },
      2500,
    );
  }
}
