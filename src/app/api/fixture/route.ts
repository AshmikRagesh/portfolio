// ── Chelsea's next fixtures ───────────────────────────────────────────────────
// For the Chelsea pin in the hero: the match on now (if any) and the next ones across every
// competition, plus Chelsea's last five results. Reads ESPN's public site API (no key);
// see lib/chelsea. Short cache so a live score stays close to real time.
//
// In development, ?demo=<ESPN event id> shows that (finished) match as if it were live, so
// the live card and the match centre can be checked on a day with no game.

import { NextResponse } from "next/server";
import { TEAM, espn, match, detail, type EspnEvent, type FormGame, type Match } from "@/lib/chelsea";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const demo = process.env.NODE_ENV !== "production" ? new URL(req.url).searchParams.get("demo") : null;
    const fixtures = await espn<{ events?: EspnEvent[] }>(`/all/teams/${TEAM}/schedule?fixture=true`, 60);
    const now = Date.now();
    let next: Match[] = (fixtures.events ?? [])
      .filter((e) => Date.parse(e.date) > now - 3 * 3600e3)
      .map((e) => match(e))
      .filter((m) => m.state !== "post")
      .slice(0, 3);

    if (demo && /^\d+$/.test(demo)) {
      const d = detail(await espn(`/all/summary?event=${demo}`, 600), demo, { state: "in", clock: "67'" });
      next = [d.match, ...next].slice(0, 3);
    }

    // Form comes with the first match's summary (ESPN's team results feed lags months behind)
    let form: FormGame[] = [];
    if (next[0]) {
      try {
        const d = detail(await espn(`/all/summary?event=${next[0].id}`, 600), next[0].id);
        form = d.form.find((f) => f.teamId === TEAM)?.games ?? [];
      } catch {}
    }

    return NextResponse.json(
      { next, form },
      { headers: { "Cache-Control": next[0]?.state === "in" ? "public, s-maxage=20" : "public, s-maxage=300, stale-while-revalidate=1800" } },
    );
  } catch {
    return NextResponse.json({ next: [], form: [] }, { status: 502 });
  }
}
