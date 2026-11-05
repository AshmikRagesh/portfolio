"use client";

// ── Folding the résumé into a paper plane ─────────────────────────────────────
// Folded the way you'd fold one by hand, in front of the viewer, from the open sheet:
//
//   1. The top-left corner folds down and in to the centre line, then the top-right:
//      two triangles turning towards you, their blank backs landing on the type.
//   2. The sheet folds in half down the middle, the right half swinging over onto the
//      left, while it turns a quarter so the point faces right and draws back.
//   3. The wings fold out from the spine, giving it its plane shape.
//   4. It flies off to the downloads corner at the top right, nose along its path:
//      out and a little down first, then climbing into the corner as it shrinks away,
//      leaving a dotted trail that fades. A ring pings where it lands.
//
// Steps 1–2 are real 3D: the sheet is cut into four pieces (two triangles, two halves)
// along its creases, each with the sheet on the front and plain stock on the back.
// Step 3 hands over to a drawn plane whose three facets start as that folded half.

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { Grain, PAPER, PaperBack } from "./paper";
import { bezier, clamp01, FOLD_EASE, lerp } from "./motion";
import { planeSequenceSound, whooshSound } from "./paperSound";

// Timeline, in ms from the click
const T = {
  leftCorner: { delay: 120, duration: 560 },
  rightCorner: { delay: 300, duration: 560 },
  half: { delay: 980, duration: 640 },
  turn: { delay: 940, duration: 800 },
  wings: { delay: 1740, duration: 680 },
  fly: { delay: 2520, duration: 1050 },
};

// How long the plane is on screen once folded, in px: smaller on a phone
const planePx = () => Math.min(280, window.innerWidth * 0.46);

type Pt = [number, number];
type Shape = [Pt, Pt, Pt, Pt];
const lerpShape = (a: Shape, b: Shape, t: number) => a.map((p, i) => [lerp(p[0], b[i][0], t), lerp(p[1], b[i][1], t)]) as Shape;
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lerpColor = (a: string, b: string, t: number) => `rgb(${hex(a).map((v, i) => Math.round(lerp(v, hex(b)[i], t))).join(",")})`;
const poly = (pts: Pt[]) => `polygon(${pts.map(([x, y]) => `${x}px ${y}px`).join(", ")})`;

const easeWings = bezier(0.5, 0, 0.2, 1);
const flyEase = bezier(0.5, 0, 0.8, 0.6);
const shrinkEase = bezier(0.4, 0, 0.75, 0.6);

const face: CSSProperties = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };

export default function PlaneFold({
  width: W,
  height: H,
  scale,
  Sheet,
  trail,
  onGone,
}: {
  width: number;
  height: number;
  /** The card's own scale, to turn screen px into the sheet's px */
  scale: number;
  Sheet: () => ReactNode;
  trail: RefObject<SVGSVGElement | null>;
  onGone: () => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const leftCorner = useRef<HTMLDivElement>(null);
  const rightCorner = useRef<HTMLDivElement>(null);
  const rightHalf = useRef<HTMLDivElement>(null);
  const pieces = useRef<HTMLDivElement>(null);
  const plane = useRef<SVGSVGElement>(null);
  const facets = useRef<(SVGPolygonElement | null)[]>([]);
  const shades = useRef<Record<string, HTMLDivElement | null>>({});
  const gone = useRef(onGone);
  gone.current = onGone;

  const c = W / 2; // the centre line, later the spine
  const k = W / 2; // how far down the corner creases reach the edges
  // Pieces overlap a hair along their cuts so no seam shows
  const LEFT: Pt[] = [[0, k], [c + 0.5, 0], [c + 0.5, H], [0, H]];
  const RIGHT: Pt[] = [[c - 0.5, 0], [W, k], [W, H], [c - 0.5, H]];
  const TL: Pt[] = [[0, 0], [c + 1, 0], [0, k + 1]];
  const TR: Pt[] = [[c - 1, 0], [W, 0], [W, k + 1]];
  const mirror = (pts: Pt[]) => pts.map(([x, y]) => [W - x, y] as Pt);

  useLayoutEffect(() => {
    const PLANE_PX = planePx();
    const anims: Animation[] = [];
    let raf = 0;
    const timers: number[] = [];
    const run = (el: Element | null | undefined, frames: Keyframe[], opts: KeyframeAnimationOptions) => {
      const a = el?.animate(frames, opts);
      if (a) anims.push(a);
      return a;
    };
    const shadeIn = (keys: string[], timing: { delay: number; duration: number }) =>
      keys.forEach((key) =>
        run(shades.current[key], [{ opacity: 0 }, { opacity: 0.22, offset: 0.5 }, { opacity: 0 }], { ...timing, easing: "linear", fill: "both" }),
      );

    planeSequenceSound({
      creases: [T.leftCorner.delay + T.leftCorner.duration - 60, T.rightCorner.delay + T.rightCorner.duration - 60, T.half.delay + T.half.duration - 50],
      wings: [T.wings.delay, T.wings.duration],
    });

    // 1. The corners
    run(leftCorner.current, [{ transform: "translateZ(1px) rotate3d(-1, 1, 0, 0deg)" }, { transform: "translateZ(1px) rotate3d(-1, 1, 0, 180deg)" }], {
      ...T.leftCorner,
      easing: FOLD_EASE,
      fill: "both",
    });
    shadeIn(["tlFront", "tlBack"], T.leftCorner);
    run(rightCorner.current, [{ transform: "translateZ(1px) rotate3d(1, 1, 0, 0deg)" }, { transform: "translateZ(1px) rotate3d(1, 1, 0, -180deg)" }], {
      ...T.rightCorner,
      easing: FOLD_EASE,
      fill: "both",
    });
    shadeIn(["trFront", "trBack"], T.rightCorner);

    // 2. In half, turning a quarter so the point faces right, drawing back as it goes
    run(rightHalf.current, [{ transform: "translateZ(3px) rotateY(0deg)" }, { transform: "translateZ(3px) rotateY(-180deg)" }], {
      ...T.half,
      easing: FOLD_EASE,
      fill: "both",
    });
    shadeIn(["rFront", "rBack"], T.half);
    const halfScale = 0.66;
    run(
      stage.current,
      [
        { transform: "translate(0px, 0px) rotate(0deg) scale(1)" },
        { transform: `translate(${W / 8}px, -18px) rotate(40deg) scale(${(1 + halfScale) / 2})`, offset: 0.45 },
        { transform: `translate(${W / 4}px, 0px) rotate(90deg) scale(${halfScale})` },
      ],
      { ...T.turn, easing: "cubic-bezier(0.45, 0, 0.25, 1)", fill: "both" },
    );

    // 3. The wings: the plane shape, drawn in the sheet's own (turned) space, nose up
    const Lp = H * 0.9;
    const S = Lp * 0.3;
    const N: Pt = [c, 0];
    const tail: Pt = [c, Lp * 0.92];
    const half: Pt[] = LEFT.map(([x, y]) => [Math.min(x, c), y] as Pt);
    const spine: Shape = [[c, H], [c, 0], [c, 0], [c, H]];
    const shapes: [Shape, Shape][] = [
      // Far wing, keel, near wing (drawn back to front)
      [spine, [tail, N, N, [c + S * 0.78, Lp * 1.02]]],
      [spine, [tail, N, N, [c + Lp * 0.1, Lp * 0.86]]],
      [[half[3], half[1], half[0], half[2]] as Shape, [[c - S, Lp], N, N, tail]],
    ];
    const colors = ["#e7dcc6", "#d6c9ae", PAPER];
    const draw = (t: number) =>
      shapes.forEach(([from, to], i) => {
        const el = facets.current[i];
        if (!el) return;
        el.setAttribute("points", lerpShape(from, to, t).map((p) => p.join(",")).join(" "));
        el.setAttribute("fill", lerpColor("#efe7d8", colors[i], clamp01(t * 1.6)));
      });
    draw(0);
    const planeScale = PLANE_PX / (Lp * scale);
    run(
      stage.current,
      [
        { transform: `translate(${W / 4}px, 0px) rotate(90deg) scale(${halfScale})` },
        { transform: `translate(${W / 4}px, -24px) rotate(90deg) scale(${planeScale})` },
      ],
      { ...T.wings, easing: "cubic-bezier(0.3, 0, 0.2, 1)", fill: "forwards" },
    );
    timers.push(
      window.setTimeout(() => {
        if (pieces.current) pieces.current.style.visibility = "hidden";
        if (plane.current) plane.current.style.opacity = "1";
        const begin = performance.now();
        const fold = () => {
          const t = clamp01((performance.now() - begin) / T.wings.duration);
          draw(easeWings(t));
          if (t < 1) raf = requestAnimationFrame(fold);
        };
        raf = requestAnimationFrame(fold);
      }, T.wings.delay),
    );

    // 4. Away to the downloads corner
    timers.push(
      window.setTimeout(() => {
        const el = wrap.current;
        const g = plane.current?.querySelector("g");
        if (!el || !g) return gone.current();
        const box = el.getBoundingClientRect();
        const p = g.getBoundingClientRect();
        const P0: Pt = [p.left + p.width / 2, p.top + p.height / 2];
        const P3: Pt = [window.innerWidth - 44, 18];
        const P1: Pt = [P0[0] + 150, P0[1] + 50];
        const P2: Pt = [Math.max(P0[0] + 60, P3[0] - 90), P3[1] + 200];
        const at = (u: number, a: number, b: number, cc: number, d: number) =>
          (1 - u) ** 3 * a + 3 * (1 - u) ** 2 * u * b + 3 * (1 - u) * u ** 2 * cc + u ** 3 * d;
        const slope = (u: number, a: number, b: number, cc: number, d: number) =>
          3 * (1 - u) ** 2 * (b - a) + 6 * (1 - u) * u * (cc - b) + 3 * u ** 2 * (d - cc);
        el.style.transformOrigin = `${(P0[0] - box.left) / scale}px ${(P0[1] - box.top) / scale}px`;

        // The trail, drawn along the same curve as the plane goes
        const svg = trail.current;
        const path = svg?.querySelector<SVGPathElement>("[data-trail]");
        const reveal = svg?.querySelector<SVGPathElement>("[data-reveal]");
        const ping = svg?.querySelector<SVGCircleElement>("[data-ping]");
        const d = `M${P0} C${P1} ${P2} ${P3}`;
        let len = 0;
        if (svg && path && reveal) {
          svg.getAnimations().forEach((a) => a.cancel());
          svg.style.opacity = "1";
          path.setAttribute("d", d);
          reveal.setAttribute("d", d);
          len = reveal.getTotalLength();
          reveal.style.strokeDasharray = `${len}`;
          reveal.style.strokeDashoffset = `${len}`;
        }
        if (ping) {
          ping.setAttribute("cx", String(P3[0]));
          ping.setAttribute("cy", String(P3[1]));
        }

        whooshSound(0.22, T.fly.duration);
        const endScale = 26 / PLANE_PX;
        const begin = performance.now();
        const step = () => {
          const t = clamp01((performance.now() - begin) / T.fly.duration);
          const u = flyEase(t);
          const x = at(u, P0[0], P1[0], P2[0], P3[0]);
          const y = at(u, P0[1], P1[1], P2[1], P3[1]);
          const heading = (Math.atan2(slope(u, P0[1], P1[1], P2[1], P3[1]), slope(u, P0[0], P1[0], P2[0], P3[0])) * 180) / Math.PI;
          // Eases into the heading rather than snapping to it, and banks into the climb
          const rot = lerp(0, heading, clamp01(t * 5));
          const bank = 1 - 0.3 * Math.sin(Math.PI * clamp01(t * 1.2));
          const s = lerp(1, endScale, shrinkEase(t));
          el.style.transform = `translate(${(x - P0[0]) / scale}px, ${(y - P0[1]) / scale}px) rotate(${rot}deg) scale(${s}, ${s * bank})`;
          el.style.opacity = String(clamp01((T.fly.duration * (1 - t)) / 160));
          // The trail stops just behind the tail, so it never draws over the plane
          if (reveal) reveal.style.strokeDashoffset = String(len - Math.max(0, u * len - (PLANE_PX / 2 + 16) * s));
          if (t < 1) {
            raf = requestAnimationFrame(step);
            return;
          }
          svg?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, delay: 150, easing: "ease-out", fill: "forwards" });
          ping?.animate(
            [
              { r: "3px", opacity: 0.55 },
              { r: "22px", opacity: 0 },
            ],
            { duration: 700, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" },
          );
          gone.current();
        };
        step();
      }, T.fly.delay),
    );

    return () => {
      anims.forEach((a) => a.cancel());
      timers.forEach(window.clearTimeout);
      cancelAnimationFrame(raf);
    };
    // The fold runs once per take; its geometry is fixed for that run
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shade = (key: string) => (
    <div
      ref={(el) => {
        shades.current[key] = el;
      }}
      className="pointer-events-none absolute inset-0 bg-[#2a2216]"
      style={{ opacity: 0 }}
    />
  );
  const front = (pts: Pt[], key?: string) => (
    <div className="absolute inset-0 overflow-hidden" style={{ ...face, clipPath: poly(pts), backgroundColor: PAPER }}>
      <Grain />
      <Sheet />
      {key && shade(key)}
    </div>
  );
  const back = (pts: Pt[], key: string) => (
    <div className="absolute inset-0 overflow-hidden" style={{ ...face, clipPath: poly(mirror(pts)), transform: "rotateY(180deg)" }}>
      <PaperBack />
      {shade(key)}
    </div>
  );
  const group = (style: CSSProperties = {}): CSSProperties => ({ position: "absolute", inset: 0, transformStyle: "preserve-3d", ...style });

  return (
    <div
      ref={wrap}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0"
      style={{ width: W, height: H, perspective: 2600, filter: "drop-shadow(0 10px 16px rgba(48,40,26,0.16))", willChange: "transform, opacity" }}
    >
      <div ref={stage} style={group({ transformOrigin: `${W / 4}px ${H / 2}px` })}>
        <div ref={pieces} style={group()}>
          {/* Left half, with the top-left corner */}
          <div style={group()}>
            {front(LEFT)}
            <div ref={leftCorner} style={group({ transformOrigin: `${c}px 0px` })}>
              {front(TL, "tlFront")}
              {back(TL, "tlBack")}
            </div>
          </div>
          {/* Right half, with the top-right corner: folds over onto the left */}
          <div ref={rightHalf} style={group({ transformOrigin: `${c}px 0px` })}>
            {front(RIGHT, "rFront")}
            {back(RIGHT, "rBack")}
            <div ref={rightCorner} style={group({ transformOrigin: `${c}px 0px` })}>
              {front(TR, "trFront")}
              {back(TR, "trBack")}
            </div>
          </div>
        </div>
        <svg ref={plane} width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="absolute left-0 top-0 overflow-visible" style={{ opacity: 0, transform: "translateZ(6px)" }}>
          <g>
            {[0, 1, 2].map((i) => (
              <polygon
                key={i}
                ref={(el) => {
                  facets.current[i] = el;
                }}
                stroke="rgba(90,70,40,0.18)"
                strokeWidth={1.4}
                strokeLinejoin="round"
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}

/** The plane's dotted trail and the ring where it lands, drawn over the whole screen. */
export function FlightTrail({ svgRef }: { svgRef: RefObject<SVGSVGElement | null> }) {
  return (
    <svg ref={svgRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" style={{ opacity: 0 }}>
      <defs>
        <mask id="resume-trail-mask" maskUnits="userSpaceOnUse">
          <path data-reveal fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" />
        </mask>
      </defs>
      <path data-trail fill="none" stroke="rgba(157,19,106,0.5)" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="0 9" mask="url(#resume-trail-mask)" />
      <circle data-ping r="3" fill="none" stroke="rgba(157,19,106,0.6)" strokeWidth="1.6" opacity="0" />
    </svg>
  );
}
