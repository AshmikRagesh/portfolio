// ── Chelsea match data ────────────────────────────────────────────────────────
// Shapes the Chelsea pin's card reads, and the ESPN → card mapping both API routes use.
// ESPN's public site API needs no key. Its team schedule gives the fixtures; the match
// summary gives everything inside one match: lineups, stats, the timeline of goals,
// cards and changes, news, both sides' form, the head-to-head and the league table.

export const TEAM = "363"; // Chelsea on ESPN
export const ESPN = "https://site.api.espn.com/apis/site/v2/sports/soccer";

export type MatchState = "pre" | "in" | "post";
export type Side = { id: string; name: string; abbr: string; logo: string; isChelsea: boolean; score?: string };
export type Match = {
  id: string;
  date: string;
  competition: string;
  venue: string;
  state: MatchState;
  /** "67'", "HT", "FT" */
  clock: string;
  home: Side;
  away: Side;
};
export type FormGame = { result: "W" | "D" | "L"; score: string; opponent: string; logo: string; home: boolean; date: string };
export type KeyEvent = { kind: "goal" | "own-goal" | "penalty" | "yellow" | "red" | "sub"; minute: string; home: boolean; player: string; other?: string };
export type Player = { name: string; short: string; number: string; pos: string; place: number; subIn?: boolean; subOut?: boolean };
export type Lineup = { teamId: string; formation?: string; starters: Player[]; bench: Player[] };
export type Stat = { label: string; home: number; away: number; pct?: boolean };
export type Article = { headline: string; image?: string; href: string; published: string };
export type TableRow = { teamId: string; name: string; logo: string; pos: number; played: number; won: number; drawn: number; lost: number; gd: string; pts: number };
export type MatchDetail = {
  match: Match;
  events: KeyEvent[];
  lineups: Lineup[];
  stats: Stat[];
  news: Article[];
  form: { teamId: string; games: FormGame[] }[];
  h2h: { date: string; home: Side; away: Side; competition: string }[];
  table: TableRow[];
  tableName?: string;
};

// ── ESPN shapes (only what we read) ───────────────────────────────────────────
type EspnTeam = { id: string; displayName: string; shortDisplayName?: string; abbreviation?: string; logo?: string; logos?: { href: string }[] };
type EspnCompetitor = { homeAway: "home" | "away"; team: EspnTeam; score?: { displayValue?: string } | string };
type EspnStatus = { displayClock?: string; type?: { state?: MatchState; shortDetail?: string; detail?: string } };
type EspnCompetition = { id?: string; venue?: { fullName?: string }; competitors: EspnCompetitor[]; status?: EspnStatus };
export type EspnEvent = { id: string; date: string; league?: { name?: string }; competitions: EspnCompetition[] };

const logoOf = (t: EspnTeam) => t.logos?.[0]?.href ?? t.logo ?? `https://a.espncdn.com/i/teamlogos/soccer/500/${t.id}.png`;

export function side(c: EspnCompetitor): Side {
  return {
    id: c.team.id,
    name: c.team.shortDisplayName ?? c.team.displayName,
    abbr: c.team.abbreviation ?? "",
    logo: logoOf(c.team),
    isChelsea: c.team.id === TEAM,
    score: typeof c.score === "string" ? c.score : c.score?.displayValue,
  };
}

function clockOf(s?: EspnStatus): string {
  const state = s?.type?.state;
  if (state === "post") return s?.type?.shortDetail ?? "FT";
  if (state === "in") {
    const d = s?.type?.shortDetail ?? "";
    if (/HT|Half/i.test(d)) return "HT";
    return s?.displayClock ?? d;
  }
  return "";
}

export function match(e: EspnEvent, competition?: string, venue?: string): Match {
  const c = e.competitions[0];
  const home = c.competitors.find((x) => x.homeAway === "home")!;
  const away = c.competitors.find((x) => x.homeAway === "away")!;
  return {
    id: e.id,
    date: e.date,
    competition: (competition ?? e.league?.name ?? "").replace(/^\d{4}-\d{2} /, ""),
    venue: venue ?? c.venue?.fullName ?? "",
    state: c.status?.type?.state ?? "pre",
    clock: clockOf(c.status),
    home: side(home),
    away: side(away),
  };
}

export async function espn<T>(path: string, revalidate: number): Promise<T> {
  const r = await fetch(`${ESPN}${path}`, { next: { revalidate } });
  if (!r.ok) throw new Error(String(r.status));
  return (await r.json()) as T;
}

// ── One match ─────────────────────────────────────────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
type Summary = Record<string, any>;

const num = (v: unknown) => {
  const n = parseFloat(String(v ?? "").replace("%", ""));
  return Number.isFinite(n) ? n : 0;
};

const STATS: [string, string, boolean?][] = [
  ["possessionPct", "Possession", true],
  ["totalShots", "Shots"],
  ["shotsOnTarget", "Shots on target"],
  ["wonCorners", "Corners"],
  ["accuratePasses", "Accurate passes"],
  ["saves", "Saves"],
  ["foulsCommitted", "Fouls"],
  ["offsides", "Offsides"],
  ["yellowCards", "Yellow cards"],
  ["redCards", "Red cards"],
];

function eventKind(type: string, text: string): KeyEvent["kind"] | null {
  if (type === "goal" || type === "goal---header" || type === "goal---free-kick" || type.startsWith("goal")) {
    if (/own goal/i.test(text)) return "own-goal";
    if (/penalty/i.test(text)) return "penalty";
    return "goal";
  }
  if (type === "own-goal") return "own-goal";
  if (type === "penalty---scored") return "penalty";
  if (type === "yellow-card") return "yellow";
  if (type === "red-card" || type === "yellow-red-card") return "red";
  if (type === "substitution") return "sub";
  return null;
}

function player(p: any): Player {
  return {
    name: p.athlete?.displayName ?? "",
    short: p.athlete?.lastName || p.athlete?.shortName || p.athlete?.displayName || "",
    number: String(p.jersey ?? ""),
    pos: p.position?.abbreviation ?? "",
    place: Number(p.formationPlace ?? 0),
    subIn: Boolean(p.subbedIn),
    subOut: Boolean(p.subbedOut),
  };
}

export function detail(d: Summary, eventId: string, force?: Partial<Match>): MatchDetail {
  const comp = d.header?.competitions?.[0] ?? {};
  const m = match(
    { id: eventId, date: comp.date ?? d.header?.date, competitions: [comp] },
    d.header?.league?.name ?? d.header?.season?.name,
    d.gameInfo?.venue?.fullName,
  );
  Object.assign(m, force);
  const homeId = m.home.id;

  const events: KeyEvent[] = (d.keyEvents ?? [])
    .map((k: any): KeyEvent | null => {
      const kind = eventKind(k.type?.type ?? "", k.text ?? "");
      if (!kind || !k.participants?.length) return null;
      return {
        kind,
        minute: k.clock?.displayValue ?? "",
        home: k.team?.id === homeId,
        player: k.participants[0]?.athlete?.displayName ?? "",
        other: k.participants[1]?.athlete?.displayName,
      };
    })
    .filter(Boolean);

  const lineups: Lineup[] = (d.rosters ?? [])
    .filter((r: any) => r.roster?.length)
    .map((r: any) => ({
      teamId: r.team?.id,
      formation: r.formation,
      starters: r.roster.filter((p: any) => p.starter).map(player),
      bench: r.roster.filter((p: any) => !p.starter).map(player),
    }));
  lineups.sort((a) => (a.teamId === homeId ? -1 : 1));

  const box: any[] = d.boxscore?.teams ?? [];
  const statOf = (teamId: string, name: string) => box.find((t) => t.team?.id === teamId)?.statistics?.find((s: any) => s.name === name)?.displayValue;
  const stats: Stat[] =
    m.state === "pre"
      ? []
      : STATS.filter(([n]) => statOf(m.home.id, n) != null).map(([n, label, pct]) => ({ label, home: num(statOf(m.home.id, n)), away: num(statOf(m.away.id, n)), pct }));

  const news: Article[] = (d.news?.articles ?? [])
    .filter((a: any) => a.links?.web?.href)
    .slice(0, 6)
    .map((a: any) => ({ headline: a.headline, image: a.images?.[0]?.url, href: a.links.web.href, published: a.published }));

  const form = (d.lastFiveGames ?? []).map((t: any) => ({
    teamId: t.team?.id,
    games: (t.events ?? []).map(
      (e: any): FormGame => ({
        result: e.gameResult,
        score: e.score,
        opponent: e.opponent?.abbreviation ?? e.opponent?.displayName ?? "",
        logo: e.opponent?.logo ?? `https://a.espncdn.com/i/teamlogos/soccer/500/${e.opponent?.id}.png`,
        home: e.atVs === "vs",
        date: e.gameDate,
      }),
    ),
  }));

  const series = (d.seasonseries ?? []).find((s: any) => s.type === "head-to-head") ?? d.seasonseries?.[0];
  const h2h = (series?.events ?? [])
    .filter((e: any) => e.status === "post" || e.statusType?.completed)
    .slice(0, 5)
    .map((e: any) => {
      const c = e.competitors ?? [];
      const h = c.find((x: any) => x.homeAway === "home");
      const a = c.find((x: any) => x.homeAway === "away");
      return { date: e.date, competition: e.league?.name ?? "", home: side(h), away: side(a) };
    })
    .filter((x: any) => x.home && x.away);

  const group = d.standings?.groups?.[0];
  const stat = (x: any, a: string) => x.stats?.find((s: any) => s.abbreviation === a || s.name === a)?.displayValue;
  const table: TableRow[] = (group?.standings?.entries ?? []).map((x: any, i: number) => ({
    teamId: String(x.id ?? x.team?.id ?? ""),
    name: x.team?.displayName ?? x.team ?? "",
    logo: x.logo?.[0]?.href ?? `https://a.espncdn.com/i/teamlogos/soccer/500/${x.id}.png`,
    pos: i + 1,
    played: num(stat(x, "GP")),
    won: num(stat(x, "W")),
    drawn: num(stat(x, "D")),
    lost: num(stat(x, "L")),
    gd: stat(x, "GD") ?? "0",
    pts: num(stat(x, "P")),
  }));

  return { match: m, events, lineups, stats, news, form, h2h, table, tableName: group?.header };
}
