#!/usr/bin/env python3
"""Draws the still illustrations for the Bella case study into public/images/bella/.

- sketch-*  the first three directions, as drawn on 23 Oct 2026 (flat, one colour each)
- depth-*   the same three with depth: lit side, shade side and a smile
- finish-*, sign-*, tip-*  the later rounds, redrawn on the desk bell from the
  design notes (my-portfolio/case-studies/bella-notes.md); the code only kept the winners
- final-bella  the bell as it ships (see components/host/HostCharacter)

Run: python3 scripts/draw-bella-explorations.py
"""

from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "images" / "bella"

MIDNIGHT = "#1e0525"
DARK, DARK_LIT = "#32073e", "#4c1a5c"
BLACKCURRANT = "#3e0d4b"
GRAPE, GRAPE_LIT, GRAPE_SHADE = "#9D136A", "#c22a88", "#6e0e4b"
GOLD, GOLD_SHADE, GOLD_INK = "#f2c75c", "#c8952e", "#3a2406"
IVORY = "#f8f1e3"
SERIF = "Georgia, 'Times New Roman', serif"
SANS = "-apple-system, 'Helvetica Neue', Arial, sans-serif"


def svg(view: str, body: str, defs: str = "") -> str:
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}">'
        + (f"<defs>{defs}</defs>" if defs else "")
        + body
        + "</svg>\n"
    )


# ── The first sketches (23 Oct, 09:12) ───────────────────────────────────────
SKETCH_FACE = lambda cx, cy: (  # noqa: E731
    f'<ellipse cx="{cx - 8}" cy="{cy}" rx="3" ry="4" fill="#fff"/>'
    f'<ellipse cx="{cx + 8}" cy="{cy}" rx="3" ry="4" fill="#fff"/>'
    f'<path d="M{cx - 5} {cy + 12} Q{cx} {cy + 16} {cx + 5} {cy + 12}" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
)

SKETCHES = {
    "sketch-key-tag": svg(
        "-15 -2 100 104",
        '<circle cx="35" cy="10" r="7" fill="none" stroke="#9D136A" stroke-width="3"/>'
        '<path d="M14 26 Q14 18 22 18 L48 18 Q56 18 56 26 L56 78 Q56 92 35 96 Q14 92 14 78 Z" fill="#9D136A"/>'
        '<circle cx="35" cy="28" r="4" fill="#fff"/>' + SKETCH_FACE(35, 54),
    ),
    "sketch-bellhop": svg(
        "-10 14 100 100",
        f'<rect x="26" y="24" width="28" height="12" rx="3" fill="{GRAPE}"/><rect x="24" y="34" width="32" height="4" rx="2" fill="{DARK}"/>'
        f'<circle cx="40" cy="64" r="28" fill="{DARK}"/>' + SKETCH_FACE(40, 62),
    ),
    "sketch-desk-bell": svg(
        "-5 18 100 84",
        f'<rect x="41" y="30" width="8" height="8" rx="2" fill="{GRAPE}"/><rect x="36" y="36" width="18" height="4" rx="2" fill="{GRAPE}"/>'
        f'<path d="M14 84 Q14 42 45 42 Q76 42 76 84 Z" fill="{DARK}"/><rect x="8" y="84" width="74" height="8" rx="4" fill="{GRAPE}"/>'
        + SKETCH_FACE(45, 64),
    ),
}


# ── With depth (23 Oct, 09:24) ───────────────────────────────────────────────
def eyes(fx: float, fy: float, pupil: str = MIDNIGHT) -> str:
    out = ""
    for dx in (-15, 15):
        out += (
            f'<ellipse cx="{fx + dx}" cy="{fy}" rx="7" ry="9" fill="#fff"/>'
            f'<circle cx="{fx + dx}" cy="{fy + 1}" r="4" fill="{pupil}"/>'
            f'<circle cx="{fx + dx + 2}" cy="{fy - 2}" r="1.6" fill="#fff"/>'
        )
    return out


def smile(fx: float, fy: float, ink: str = "#fff") -> str:
    return (
        f'<path d="M{fx - 6} {fy + 17} Q{fx} {fy + 22} {fx + 6} {fy + 17}" stroke="{ink}" stroke-width="3" fill="none" stroke-linecap="round"/>'
    )


def depth(name: str, body: str, fill: str, lit: str, shade: str, face: tuple, extra: str, behind: bool) -> str:
    fx, fy = face
    clip = f'<clipPath id="{name}"><path d="{body}"/></clipPath>'
    shape = (
        f'<path d="{body}" fill="{shade}"/>'
        f'<g clip-path="url(#{name})"><path d="{body}" fill="{lit}" transform="translate(-6 -7)"/>'
        f'<ellipse cx="{fx - 24}" cy="{fy - 34}" rx="16" ry="9" fill="#fff" opacity=".16" transform="rotate(-24 {fx - 24} {fy - 34})"/></g>'
    )
    return svg(
        "30 84 140 164",
        f'<ellipse cx="100" cy="240" rx="46" ry="6" fill="{DARK}" opacity=".14"/>'
        + (extra + shape if behind else shape + extra)
        + eyes(fx, fy)
        + smile(fx, fy),
        clip,
    )


DEPTHS = {
    "depth-key-tag": depth(
        "kt",
        "M62 128 Q62 112 78 112 L122 112 Q138 112 138 128 L138 204 Q138 228 100 234 Q62 228 62 204 Z",
        GRAPE, GRAPE, GRAPE_SHADE, (100, 172),
        '<circle cx="100" cy="98" r="11" fill="none" stroke="#b9a7bf" stroke-width="4"/>',
        True,
    ).replace('</g><ellipse cx="85"', '</g><circle cx="100" cy="126" r="6" fill="#fff"/><ellipse cx="85"'),
    "depth-bellhop": depth(
        "bh",
        "M100 128 A52 52 0 1 1 99.9 128 Z",
        DARK, DARK_LIT, MIDNIGHT, (100, 180),
        f'<rect x="80" y="112" width="40" height="20" rx="5" fill="{GRAPE}"/><rect x="80" y="112" width="40" height="7" rx="3" fill="{GRAPE_LIT}"/>'
        f'<rect x="76" y="128" width="48" height="6" rx="3" fill="{GRAPE_SHADE}"/>',
        False,
    ),
    "depth-desk-bell": depth(
        "db",
        "M48 214 Q48 140 100 140 Q152 140 152 214 Z",
        DARK, DARK_LIT, MIDNIGHT, (100, 184),
        f'<rect x="94" y="126" width="12" height="12" rx="3" fill="{GRAPE_LIT}"/><rect x="88" y="136" width="24" height="6" rx="3" fill="{GRAPE}"/>'
        f'<rect x="38" y="212" width="124" height="14" rx="7" fill="{GRAPE_SHADE}"/><rect x="38" y="212" width="124" height="6" rx="3" fill="{GRAPE}"/>',
        False,
    ),
}


# ── The desk bell, in each finish ───────────────────────────────────
DOME = "M48 214 Q48 140 100 140 Q152 140 152 214 Z"
FX, FY = 100, 184


def bell(name: str, dome: dict, base: dict, face: str, defs: str = "") -> str:
    """`dome` / `base`: lit, shade (and optional gloss) fills; `face`: the face markup."""
    clip = f'<clipPath id="{name}"><path d="{DOME}"/></clipPath>'
    gloss = dome.get("gloss", "")
    lit = (
        f'<g clip-path="url(#{name})"><path d="{DOME}" fill="{dome["lit"]}" transform="translate(-6 -7)"/>{gloss}</g>'
        if dome.get("lit") != dome["shade"]
        else ""
    )
    return svg(
        "30 116 140 132",
        f'<ellipse cx="100" cy="238" rx="54" ry="6" fill="{DARK}" opacity=".12"/>'
        f'<rect x="94" y="126" width="12" height="12" rx="3" fill="{base["lit"]}"/>'
        f'<rect x="88" y="136" width="24" height="6" rx="3" fill="{base["mid"]}"/>'
        f'<path d="{DOME}" fill="{dome["shade"]}"/>{lit}'
        f'<rect x="38" y="212" width="124" height="14" rx="7" fill="{base["shade"]}"/>'
        f'<rect x="38" y="212" width="124" height="6" rx="3" fill="{base["mid"]}"/>' + face,
        clip + defs,
    )


BASE_GRAPE = {"lit": GRAPE_LIT, "mid": GRAPE, "shade": GRAPE_SHADE}
BASE_CHROME = {"lit": "#f4f5f7", "mid": "#c9ccd2", "shade": "#8b9099"}
BASE_CHARCOAL = {"lit": "#5a5a62", "mid": "#3a3a40", "shade": "#222226"}

HIGHLIGHT = f'<ellipse cx="{FX - 24}" cy="{FY - 30}" rx="18" ry="9" fill="#fff" opacity=".5" transform="rotate(-24 {FX - 24} {FY - 30})"/>'
CHROME_GRAD = (
    '<linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1">'
    '<stop offset="0" stop-color="#fbfbfc"/><stop offset=".45" stop-color="#c3c7ce"/>'
    '<stop offset=".7" stop-color="#eef0f2"/><stop offset="1" stop-color="#7d828b"/></linearGradient>'
)
PLUM_GRAD = (
    '<linearGradient id="plum" x1="0" y1="0" x2="1" y2="1">'
    f'<stop offset="0" stop-color="{GRAPE_LIT}"/><stop offset=".5" stop-color="{GRAPE}"/>'
    f'<stop offset="1" stop-color="{DARK}"/></linearGradient>'
)


def shipped(dome_shade: str, dome_lit: str, face: str, extra: str = "") -> str:
    """The bell as HostCharacter draws it (idle pose), so the kept finishes match the site."""
    return svg(
        "30 118 140 130",
        f'<ellipse cx="100" cy="238" rx="56" ry="6" fill="{DARK}" opacity=".12"/>'
        f'<rect x="94" y="126" width="12" height="12" rx="3" fill="{GRAPE}"/>'
        f'<rect x="94" y="126" width="12" height="5" rx="2.5" fill="{GRAPE_LIT}"/>'
        f'<rect x="88" y="136" width="24" height="6" rx="3" fill="{GRAPE_SHADE}"/>'
        f'<path d="{DOME}" fill="{dome_shade}"/>'
        f'<g clip-path="url(#dome)"><path d="{DOME}" fill="{dome_lit}" transform="translate(-6 -7)"/></g>'
        '<path d="M66 198 Q64 168 82 152" stroke="#fff" stroke-opacity=".18" stroke-width="5" fill="none" stroke-linecap="round"/>'
        + face
        + f'<rect x="38" y="212" width="124" height="14" rx="7" fill="{GRAPE_SHADE}"/>'
        f'<rect x="38" y="212" width="124" height="6" rx="3" fill="{GRAPE}"/>'
        '<rect x="48" y="213" width="44" height="2" rx="1" fill="#fff" opacity=".2"/>'
        + extra,
        f'<clipPath id="dome"><path d="{DOME}"/></clipPath>',
    )


SHIPPED_EYES = (
    '<ellipse cx="85" cy="176" rx="9" ry="11" fill="#fff"/><ellipse cx="115" cy="176" rx="9" ry="11" fill="#fff"/>'
    f'<circle cx="87" cy="177" r="5.4" fill="{MIDNIGHT}"/><circle cx="117" cy="177" r="5.4" fill="{MIDNIGHT}"/>'
    '<circle cx="88.8" cy="174.6" r="1.9" fill="#fff"/><circle cx="118.8" cy="174.6" r="1.9" fill="#fff"/>'
)
SHIPPED_HAPPY = (
    f'<g stroke="{GOLD_INK}" stroke-width="4.2" stroke-linecap="round" fill="none">'
    '<path d="M75 180 Q85 168 95 180"/><path d="M105 180 Q115 168 125 180"/></g>'
)
STAR = "M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6 Z"
SPARKLES = '<g fill="#f1bf45">' + "".join(
    f'<path d="{STAR}" transform="translate({x} {y}) scale({k})"/>'
    for x, y, k in ((40, 152, 1), (162, 148, 0.8), (150, 124, 0.6), (52, 128, 0.7))
) + "</g>"

FINISHES = {
    "finish-flat-plum": bell("fp", {"lit": GRAPE, "shade": GRAPE}, BASE_GRAPE, eyes(FX, FY)),
    "finish-plum-metal": bell(
        "pm", {"lit": "url(#plum)", "shade": GRAPE_SHADE, "gloss": HIGHLIGHT}, BASE_GRAPE, eyes(FX, FY), PLUM_GRAD
    ),
    "finish-chrome": bell(
        "ch", {"lit": "url(#chrome)", "shade": "#8b9099", "gloss": HIGHLIGHT}, BASE_CHROME, eyes(FX, FY), CHROME_GRAD
    ),
    "finish-chrome-charcoal": bell(
        "cc", {"lit": "url(#chrome)", "shade": "#8b9099", "gloss": HIGHLIGHT}, BASE_CHARCOAL, eyes(FX, FY), CHROME_GRAD
    ),
    "finish-blackcurrant": shipped(MIDNIGHT, BLACKCURRANT, SHIPPED_EYES),
    "finish-gold": shipped(GOLD_SHADE, GOLD, SHIPPED_HAPPY, SPARKLES),
}

# ── Signs: where the time shows ──────────────────────────────────────────────
def sign(body: str, view: str = "0 0 220 120", defs: str = "") -> str:
    return svg(view, body, defs)


def flip_card(x: int, text: str) -> str:
    return (
        f'<rect x="{x}" y="34" width="64" height="56" rx="6" fill="#2a1030"/>'
        f'<rect x="{x}" y="34" width="64" height="28" rx="6" fill="#3a1842"/>'
        f'<line x1="{x}" y1="62" x2="{x + 64}" y2="62" stroke="{MIDNIGHT}" stroke-width="2"/>'
        f'<text x="{x + 32}" y="78" text-anchor="middle" font-family="{SANS}" font-size="38" font-weight="600" fill="#f4eef6">{text}</text>'
    )


SIGNS = {
    "sign-flip-clock": sign(
        f'<rect x="28" y="22" width="164" height="80" rx="12" fill="{MIDNIGHT}"/>' + flip_card(40, "04") + flip_card(116, "16")
    ),
    "sign-brass-ivory": sign(
        f'<rect x="24" y="22" width="172" height="80" rx="10" fill="{GOLD_SHADE}"/><rect x="32" y="30" width="156" height="64" rx="6" fill="{IVORY}"/>'
        + "".join(f'<circle cx="{x}" cy="{y}" r="3" fill="{GOLD}"/>' for x in (40, 180) for y in (38, 86))
        + f'<text x="110" y="74" text-anchor="middle" font-family="{SERIF}" font-style="italic" font-size="32" fill="{DARK}">04:16</text>'
    ),
    "sign-grape-wood": sign(
        f'<rect x="22" y="20" width="176" height="84" rx="8" fill="{GRAPE_SHADE}"/>'
        + "".join(f'<path d="M24 {y} Q110 {y + 4} 196 {y}" stroke="{GRAPE}" stroke-width="2" fill="none" opacity=".6"/>' for y in (26, 36, 90, 98))
        + f'<rect x="36" y="34" width="148" height="56" rx="4" fill="{IVORY}"/>'
        f'<text x="110" y="72" text-anchor="middle" font-family="{SERIF}" font-style="italic" font-size="28" fill="{DARK}">04:16</text>'
    ),
    "sign-neutral": sign(
        '<rect x="20" y="22" width="180" height="80" rx="10" fill="url(#frame)"/>'
        '<rect x="25" y="27" width="170" height="70" rx="7" fill="#faf5ea"/>'
        f'<text x="110" y="46" text-anchor="middle" font-family="{SANS}" font-size="8" letter-spacing="1.5" fill="#7a6a58">MEASURING YOUR CURIOSITY</text>'
        '<rect x="36" y="54" width="148" height="34" rx="5" fill="#2a2228"/>'
        + "".join(
            f'<rect x="{x}" y="58" width="20" height="26" rx="3" fill="#3a3238"/>'
            f'<text x="{x + 10}" y="78" text-anchor="middle" font-family="{SANS}" font-size="18" fill="#f4efe6">{d}</text>'
            for x, d in ((42, "0"), (64, "4"), (112, "1"), (134, "6"))
        )
        + f'<text x="94" y="82" font-family="{SANS}" font-size="9" fill="#b9ad9e">m</text>'
        f'<text x="162" y="82" font-family="{SANS}" font-size="9" fill="#b9ad9e">s</text>'
        '<line x1="38" y1="71" x2="182" y2="71" stroke="#000" stroke-opacity=".6" stroke-width="1"/>',
        defs='<linearGradient id="frame" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4ecdc"/>'
        '<stop offset=".26" stop-color="#d9c9a8"/><stop offset=".5" stop-color="#b8a27b"/>'
        '<stop offset=".74" stop-color="#e7d9bc"/><stop offset="1" stop-color="#c0a984"/></linearGradient>',
    ),
}


# ── Tooltips: how Bella's lines appear ───────────────────────────────────────
TIPS = {
    "tip-grape-bubble": sign(
        f'<rect x="30" y="36" width="160" height="48" rx="24" fill="{GRAPE}"/>'
        f'<text x="110" y="65" text-anchor="middle" font-family="{SANS}" font-size="13" fill="#fff">Still here. Noted.</text>'
    ),
    "tip-front-desk": sign(
        '<rect x="22" y="20" width="176" height="84" rx="10" fill="#fff" stroke="#e4dfe6" stroke-width="1.5"/>'
        f'<text x="38" y="46" font-family="{SANS}" font-size="12" font-weight="600" fill="{DARK}">Front desk</text>'
        f'<text x="38" y="68" font-family="{SANS}" font-size="11" fill="#6f6676">Oh hi. 30 seconds already?</text>'
        f'<text x="38" y="84" font-family="{SANS}" font-size="11" fill="#6f6676">Late checkout is on me.</text>'
    ),
    "tip-percentile-card": sign(
        '<rect x="22" y="12" width="176" height="100" rx="10" fill="#fff" stroke="#e4dfe6" stroke-width="1.5"/>'
        f'<text x="36" y="34" font-family="{SANS}" font-size="11" fill="#6f6676">Longer than 72% of visitors</text>'
        f'<rect x="36" y="44" width="148" height="8" rx="4" fill="#efe9f1"/><rect x="36" y="44" width="107" height="8" rx="4" fill="{GRAPE}"/>'
        f'<rect x="36" y="66" width="70" height="28" rx="6" fill="{DARK}"/><text x="71" y="84" text-anchor="middle" font-family="{SANS}" font-size="10" fill="#fff">Keep going</text>'
        f'<rect x="114" y="66" width="70" height="28" rx="6" fill="#fff" stroke="#d8d1db"/><text x="149" y="84" text-anchor="middle" font-family="{SANS}" font-size="10" fill="{DARK}">Dismiss</text>'
    ),
    "tip-compact-dark": sign(
        f'<path d="M104 30 L110 22 L116 30 Z" fill="{MIDNIGHT}"/><rect x="30" y="30" width="160" height="56" rx="8" fill="{MIDNIGHT}"/>'
        f'<text x="44" y="54" font-family="{SANS}" font-size="11" fill="#fff">I&#8217;m Bella. You&#8217;ve been here</text>'
        f'<text x="44" y="72" font-family="{SANS}" font-size="11" fill="#fff">30 seconds.</text>'
    ),
}

FINAL = {"final-bella": shipped(MIDNIGHT, BLACKCURRANT, SHIPPED_EYES)}


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for group in (SKETCHES, DEPTHS, FINISHES, SIGNS, TIPS, FINAL):
        for name, markup in group.items():
            (OUT / f"{name}.svg").write_text(markup)
    print(f"wrote {sum(map(len, (SKETCHES, DEPTHS, FINISHES, SIGNS, TIPS, FINAL)))} files to {OUT}")
