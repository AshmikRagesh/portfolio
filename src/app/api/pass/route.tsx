// ── GET /api/pass?c=<code> ────────────────────────────────────────────────────
// The Curiosity Pass as a 1200×630 PNG: the preview image when a pass link is shared,
// and the file the pass page downloads or hands to the share sheet. The details come
// from the code in the link (lib/bella/passArt); nothing is looked up or stored.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { decodePass, formatStay, frameSvg, guestNumber } from "@/lib/bella/passArt";
import { STAMPS, stampSvg } from "@/lib/bella/stampArt";

export const runtime = "nodejs";

const W = 1200;
const H = 630;
const PASS_W = 728;
const PASS_H = 520;

// Geist from Google Fonts, as TTF (the format the image renderer reads)
async function geist(weight: number) {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Geist:wght@${weight}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

const dataUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

export async function GET(req: Request) {
  const d = decodePass(new URL(req.url).searchParams.get("c") ?? "") ?? { n: null, f: null, a: "", s: 0, h: null, k: [] };
  const [alpina, g400, g500] = await Promise.all([
    readFile(path.join(process.cwd(), "public/fonts/GT-Alpina-Standard-Regular-Trial.otf")).catch(() => null),
    geist(400),
    geist(500),
  ]);
  const fonts = [
    alpina && { name: "Alpina", data: alpina, weight: 400 as const },
    g400 && { name: "Geist", data: g400, weight: 400 as const },
    g500 && { name: "Geist", data: g500, weight: 500 as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer | Buffer; weight: 400 | 500 }[];

  const line = [`Guest no. ${guestNumber(d.n)}`, d.a && `Arrived ${d.a}`, `Stayed ${formatStay(d.s)}`].filter(Boolean).join("  ·  ");
  const gold = "#e3bd62";

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#140317",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          fontFamily: "Geist",
        }}
      >
        <div style={{ position: "relative", width: PASS_W, height: PASS_H, display: "flex", transform: "rotate(-2deg)" }}>
          <img alt="" src={dataUri(frameSvg("og"))} width={PASS_W} height={PASS_H} style={{ position: "absolute", left: 0, top: 0 }} />
          <div style={{ position: "absolute", left: 0, top: 0, width: PASS_W, height: PASS_H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "60px 80px 48px" }}>
            <div style={{ display: "flex", width: 40, height: 40 }} />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                fontFamily: "Alpina",
                fontSize: 108,
                lineHeight: 0.88,
                color: "#4d165b",
                textShadow: "0 -3px 0 rgba(10,0,14,0.7), 0 3px 0 rgba(255,220,255,0.22)",
              }}
            >
              <span>Curiosity</span>
              <span>Pass</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 19, color: "#f8f1e3" }}>
              <span>{line}</span>
              {d.f ? <span style={{ color: gold }}>From {d.f}</span> : null}
            </div>
          </div>
        </div>
        {/* The stamps found, round the pass */}
        {STAMPS.filter((s) => d.k.includes(s.key)).map((s, i) => {
          const spots: [number, number, number][] = [[40, 30, -8], [1010, 24, 6], [44, 430, 5], [1012, 420, -6], [560, 470, 4]];
          const [x, y, r] = spots[STAMPS.indexOf(s)];
          return <img key={s.key} alt="" src={dataUri(stampSvg(s.key, { id: `o${i}`, rotate: r }))} width={150} height={150} style={{ position: "absolute", left: x, top: y }} />;
        })}
        <div style={{ position: "absolute", bottom: 24, display: "flex", fontSize: 14, letterSpacing: 3, textTransform: "uppercase", color: "rgba(248,241,227,0.5)" }}>
          Ashmik Ragesh · Portfolio
        </div>
      </div>
    ),
    { width: W, height: H, fonts: fonts.length ? fonts : undefined, headers: { "Cache-Control": "public, max-age=86400, immutable" } },
  );
}
