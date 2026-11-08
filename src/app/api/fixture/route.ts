// ── Chelsea's next fixtures ───────────────────────────────────────────────────
// For the Chelsea pin in the hero. Reads ESPN's public site API (no key): the upcoming
// fixtures across every competition. (Its results feed lags months behind, so no "last
// result".) Cached for half an hour so the page never waits on ESPN.

import { NextResponse } from "next/server";

export const revalidate = 1800;

const TEAM = "363"; // Chelsea on ESPN
const BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer";

type EspnCompetitor = {
  homeAway: "home" | "away";
  team: { id: string; displayName: string; shortDisplayName?: string; abbreviation?: string; logos?: { href: string }[] };
  score?: { displayValue?: string } | string;
};
type EspnEvent = {
  date: string;
  league?: { name?: string; abbreviation?: string };
  competitions: { venue?: { fullName?: string }; competitors: EspnCompetitor[] }[];
};

const side = (c: EspnCompetitor) => ({
  name: c.team.shortDisplayName ?? c.team.displayName,
  abbr: c.team.abbreviation ?? "",
  logo: c.team.logos?.[0]?.href ?? `https://a.espncdn.com/i/teamlogos/soccer/500/${c.team.id}.png`,
  isChelsea: c.team.id === TEAM,
  score: typeof c.score === "string" ? c.score : c.score?.displayValue,
});

function match(e: EspnEvent) {
  const c = e.competitions[0];
  const home = c.competitors.find((x) => x.homeAway === "home")!;
  const away = c.competitors.find((x) => x.homeAway === "away")!;
  return { date: e.date, competition: e.league?.name ?? "", venue: c.venue?.fullName ?? "", home: side(home), away: side(away) };
}

async function get(url: string) {
  const r = await fetch(url, { next: { revalidate } });
  if (!r.ok) throw new Error(String(r.status));
  return (await r.json()) as { events?: EspnEvent[] };
}

export async function GET() {
  try {
    const fixtures = await get(`${BASE}/all/teams/${TEAM}/schedule?fixture=true`);
    const now = Date.now();
    const next = (fixtures.events ?? []).filter((e) => Date.parse(e.date) > now - 2 * 3600e3).slice(0, 3).map(match);
    return NextResponse.json({ next }, { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } });
  } catch {
    return NextResponse.json({ next: [] }, { status: 502 });
  }
}
