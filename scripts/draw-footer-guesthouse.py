"""Generate the footer's line drawing of a corner guesthouse, in two-point perspective.

Usage: python3 scripts/draw-footer-guesthouse.py public/images/footer-guesthouse.svg [preview]

Writes an SVG to the path given as argv[1]. argv[2] == "preview" adds a dark background.
"""
import math
import random
import sys

random.seed(11)

# ── Camera ────────────────────────────────────────────────────────────────────
EYE_Y = 1.6      # eye height (m)
CAM_Z = -44.0    # camera distance in front of the corner
F = 1180.0       # focal length in px

def proj(p):
    x, y, z = p
    d = z - CAM_Z
    return (F * x / d, -F * (y - EYE_Y) / d)

# ── Plan: two wings meeting at a rounded corner ────────────────────────────────
ALPHA = math.radians(34)
dL = (-math.cos(ALPHA), 0.0, math.sin(ALPHA))
dR = (math.cos(ALPHA), 0.0, math.sin(ALPHA))
theta = math.acos(dL[0] * dR[0] + dL[2] * dR[2])  # interior angle between faces
R = 7.0
tan_half = math.tan(theta / 2)
tangent = R / tan_half
A = (dL[0] * tangent, 0, dL[2] * tangent)
B = (dR[0] * tangent, 0, dR[2] * tangent)
O = (0, 0, R / math.sin(theta / 2))
LEN = 30.0  # wing length beyond the tangent point

def add(p, d, s):
    return (p[0] + d[0] * s, p[1] + d[1] * s, p[2] + d[2] * s)

def left(s, y, out=0.0):
    # outward normal of the left face points towards the viewer-left
    n = (-dL[2], 0, dL[0])  # rotate dL by -90 in plan
    if n[2] > 0:
        n = (-n[0], 0, -n[2])
    p = add(A, dL, s)
    return (p[0] + n[0] * out, y, p[2] + n[2] * out)

def right(s, y, out=0.0):
    n = (dR[2], 0, -dR[0])
    if n[2] > 0:
        n = (-n[0], 0, -n[2])
    p = add(B, dR, s)
    return (p[0] + n[0] * out, y, p[2] + n[2] * out)

a0 = math.atan2(A[2] - O[2], A[0] - O[0])
a1 = math.atan2(B[2] - O[2], B[0] - O[0])
if a1 < a0:
    a1 += 2 * math.pi
# the arc should bulge toward the viewer (negative z); pick the short way through -90deg
if not (a0 < -math.pi / 2 + 2 * math.pi * 0 < a1) and not (a0 < 1.5 * math.pi < a1):
    pass

def arc_angle(u):
    # u in [0,1] from A to B through the front
    start = math.atan2(A[2] - O[2], A[0] - O[0])
    end = math.atan2(B[2] - O[2], B[0] - O[0])
    # front of the arc is at angle -pi/2 (towards the camera)
    while end > start:
        end -= 2 * math.pi
    # going clockwise from start to end passes -pi/2? choose the path through -pi/2
    if not (end <= -math.pi / 2 <= start):
        end += 2 * math.pi
    return start + (end - start) * u

def corner(u, y, out=0.0, r=R):
    a = arc_angle(u)
    rr = r + out
    return (O[0] + math.cos(a) * rr, y, O[2] + math.sin(a) * rr)

ARC_LEN = R * abs(arc_angle(1) - arc_angle(0))

# ── Drawing helpers ───────────────────────────────────────────────────────────
paths = []      # stroked, in draw order
fills = []      # (d, order) silhouettes that hide what's behind them

def fmt(pt):
    return f"{pt[0]:.1f} {pt[1]:.1f}"

def line3(*pts):
    p = [proj(q) for q in pts]
    paths.append("M" + " L".join(fmt(q) for q in p))

def poly3(pts, close=True):
    p = [proj(q) for q in pts]
    paths.append("M" + " L".join(fmt(q) for q in p) + (" Z" if close else ""))

def curve3(fn, u0, u1, y, steps=24, out=0.0):
    pts = [proj(fn(u0 + (u1 - u0) * i / steps, y, out)) for i in range(steps + 1)]
    paths.append("M" + " L".join(fmt(q) for q in pts))

def face_rect(face, s0, s1, y0, y1, out=0.0):
    poly3([face(s0, y0, out), face(s1, y0, out), face(s1, y1, out), face(s0, y1, out)])

# Heights
GROUND = 4.6
BAND = 5.2
FLOORS = [5.2, 8.4, 11.6]
FLOOR_H = 3.2
ROOF = 14.8
PARAPET = 15.6

# ── Wings ─────────────────────────────────────────────────────────────────────
BAY = 6.0
for face in (left, right):
    # base, ground-floor cornice band, floor string courses, roof and parapet
    for y in (0.0, GROUND, BAND, ROOF, PARAPET):
        line3(face(0, y), face(LEN, y))
    line3(face(LEN, 0), face(LEN, PARAPET))
    # parapet steps over every other bay, like a row of town houses
    for k in range(0, int(LEN // BAY)):
        s0, s1 = k * BAY, (k + 1) * BAY
        if k % 2 == 0:
            poly3([face(s0 + 0.2, PARAPET), face(s0 + 0.2, PARAPET + 0.8), face(s1 - 0.2, PARAPET + 0.8), face(s1 - 0.2, PARAPET)], close=False)
            line3(face(s0, PARAPET + 0.8), face(s1, PARAPET + 0.8))
    # pilasters between bays
    for k in range(0, int(LEN // BAY) + 1):
        s = k * BAY
        for e in (-0.3, 0.3):
            if 0 <= s + e <= LEN:
                line3(face(s + e, BAND), face(s + e, ROOF))
    # upper-floor windows: two per bay; every third bay has Juliet balconies
    for k in range(int(LEN // BAY)):
        mid = k * BAY + BAY / 2
        balcony = k % 3 == 1
        for fy in FLOORS:
            for c in (-1.4, 1.4):
                w = 1.7 if balcony else 1.6
                s0, s1 = mid + c - w / 2, mid + c + w / 2
                if balcony:
                    y0, y1 = fy + 0.3, fy + 2.5
                    face_rect(face, s0, s1, y0, y1)
                    line3(face((s0 + s1) / 2, y0), face((s0 + s1) / 2, y1))
                    # railing
                    line3(face(s0 - 0.1, y0 + 1.0), face(s1 + 0.1, y0 + 1.0))
                    n = 6
                    for i in range(1, n):
                        s = s0 + (s1 - s0) * i / n
                        line3(face(s, y0), face(s, y0 + 1.0))
                else:
                    y0, y1 = fy + 0.8, fy + 2.6
                    face_rect(face, s0, s1, y0, y1)
                    line3(face((s0 + s1) / 2, y0), face((s0 + s1) / 2, y1))
                    line3(face(s0, y0 + 1.1), face(s1, y0 + 1.1))
                    # sill
                    line3(face(s0 - 0.15, y0 - 0.12), face(s1 + 0.15, y0 - 0.12))
    # ground floor: shop windows, every other bay under an awning
    for k in range(int(LEN // BAY)):
        s0, s1 = k * BAY + 0.6, (k + 1) * BAY - 0.6
        face_rect(face, s0, s1, 0.5, 3.8)
        for i in range(1, 4):
            s = s0 + (s1 - s0) * i / 4
            line3(face(s, 0.5), face(s, 3.8))
        line3(face(s0, 3.1), face(s1, 3.1))
        if k % 2 == 0:
            # awning: from the band, sloping out over the pavement, with a valance
            a, b = s0 - 0.2, s1 + 0.2
            poly3([face(a, 4.4), face(b, 4.4), face(b, 3.6, out=1.5), face(a, 3.6, out=1.5)])
            poly3([face(a, 3.6, out=1.5), face(b, 3.6, out=1.5), face(b, 3.25, out=1.5), face(a, 3.25, out=1.5)])

# ── Rounded corner bay ────────────────────────────────────────────────────────
for y in (0.0, GROUND, BAND, ROOF):
    curve3(corner, 0, 1, y)
# pilasters at the tangent points, carried up into the crown
for u in (0.0, 1.0):
    for e in (-0.012, 0.012):
        line3(corner(u + e, BAND), corner(u + e, PARAPET + 0.4))
# a curved crown cornice that overhangs the corner, as on old hotels
for y, out in ((ROOF, 0.0), (PARAPET + 0.4, 0.0), (PARAPET + 0.9, 0.9), (PARAPET + 1.4, 1.3)):
    curve3(corner, -0.06, 1.06, y, steps=40, out=out)
for u in (-0.06, 1.06):
    line3(corner(u, PARAPET + 0.4), corner(u, PARAPET + 0.9, out=0.9))
    line3(corner(u, PARAPET + 0.9, out=0.9), corner(u, PARAPET + 1.4, out=1.3))
# corner windows: three wide triple windows per floor
for fy in FLOORS:
    for u0, u1 in ((0.1, 0.3), (0.4, 0.6), (0.7, 0.9)):
        y0, y1 = fy + 0.7, fy + 2.6
        curve3(corner, u0, u1, y0, steps=10)
        curve3(corner, u0, u1, y1, steps=10)
        for u in (u0, u0 + (u1 - u0) / 3, u0 + 2 * (u1 - u0) / 3, u1):
            line3(corner(u, y0), corner(u, y1))
        curve3(corner, u0, u1, y0 + 1.2, steps=10)
# the entrance: double doors with a transom under a flat canopy, a planter each side
for u in (0.38, 0.62):
    line3(corner(u, 0), corner(u, 3.4))
curve3(corner, 0.38, 0.62, 3.4, steps=10)
curve3(corner, 0.38, 0.62, 2.7, steps=10)
line3(corner(0.5, 0), corner(0.5, 2.7))
for u in (0.43, 0.57):
    line3(corner(u, 1.1), corner(u, 1.5))
curve3(corner, 0.3, 0.7, 3.9, steps=14, out=1.8)
curve3(corner, 0.3, 0.7, 3.6, steps=14, out=1.8)
for u in (0.3, 0.7):
    line3(corner(u, 3.9), corner(u, 3.9, out=1.8))
    line3(corner(u, 3.6, out=1.8), corner(u, 3.9, out=1.8))
# side shop windows on the corner
for u0, u1 in ((0.05, 0.3), (0.7, 0.95)):
    for y in (0.5, 3.8, 3.1):
        curve3(corner, u0, u1, y, steps=10)
    for u in (u0, (u0 + u1) / 2, u1):
        line3(corner(u, 0.5), corner(u, 3.8))

# ── Street: kerb line across the whole drawing ────────────────────────────────
KERB_OUT = 4.2

def kerb_points():
    pts = [left(LEN + 30, 0, KERB_OUT)]
    pts += [left(LEN - i * 2, 0, KERB_OUT) for i in range(int(LEN / 2) + 1)]
    pts += [corner(i / 20, 0, out=KERB_OUT) for i in range(21)]
    pts += [right(i * 2, 0, KERB_OUT) for i in range(int(LEN / 2) + 1)]
    pts.append(right(LEN + 30, 0, KERB_OUT))
    return pts

kerb = [proj(p) for p in kerb_points()]

# ── Trees, a lamp post, planters, a guest with a suitcase ─────────────────────
tree_paths = []
fill_paths = []

def scribble_crown(cx, cy, rx, ry, density):
    # The crown is a cluster of lumps; its outline is the edge of their union, and the
    # inside is packed with small loops, like leaves drawn in quick scribbles.
    lumps = [(cx, cy, min(rx, ry) * 0.62)]
    for i in range(7):
        a = 2 * math.pi * i / 7 + random.uniform(-0.3, 0.3)
        lumps.append((cx + math.cos(a) * rx * 0.52, cy + math.sin(a) * ry * 0.52, min(rx, ry) * random.uniform(0.42, 0.52)))
    def reach(a):
        best = 0
        dx, dy = math.cos(a), math.sin(a)
        for lx, ly, lr in lumps:
            ox, oy = cx - lx, cy - ly
            b = ox * dx + oy * dy
            c = ox * ox + oy * oy - lr * lr
            disc = b * b - c
            if disc >= 0:
                best = max(best, -b + math.sqrt(disc))
        return best
    n = 90
    blob = [(cx + math.cos(2 * math.pi * i / n) * reach(2 * math.pi * i / n), cy + math.sin(2 * math.pi * i / n) * reach(2 * math.pi * i / n)) for i in range(n)]
    d = "M" + " L".join(fmt(p) for p in blob) + " Z"
    fill_paths.append(d)
    out = [d]
    def inside(x, y):
        return any((x - lx) ** 2 + (y - ly) ** 2 < (lr * 0.94) ** 2 for lx, ly, lr in lumps)
    placed = 0
    tries = 0
    while placed < density and tries < density * 20:
        tries += 1
        x, y = cx + random.uniform(-rx, rx), cy + random.uniform(-ry, ry)
        if not inside(x, y):
            continue
        placed += 1
        r = random.uniform(1.8, 3.4)
        a = random.uniform(0, 2 * math.pi)
        sweep = random.uniform(4.0, 5.6)
        pts = [(x + math.cos(a + sweep * j / 6) * r, y + math.sin(a + sweep * j / 6) * r * 0.9) for j in range(7)]
        out.append("M" + " L".join(f"{p[0]:.0f} {p[1]:.0f}" for p in pts))
    # a few branches showing through at the bottom of the crown
    for k in (-1, 1):
        out.append(f"M{cx:.1f} {cy + ry * 0.9:.1f} Q{cx + k * rx * 0.1:.1f} {cy + ry * 0.55:.1f} {cx + k * rx * 0.35:.1f} {cy + ry * 0.3:.1f}")
    return out

def tree(face, s, out):
    base = face(s, 0, out)
    trunk_top = (base[0], 3.6, base[2])
    crown_c = (base[0], 6.0, base[2])
    pb, pt, pc = proj(base), proj(trunk_top), proj(crown_c)
    edge = proj((base[0] + 2.8, 6.0, base[2]))
    rx = abs(edge[0] - pc[0])
    ry = rx * 1.08
    tree_paths.append(f"M{fmt(pb)} L{fmt((pt[0], pt[1]))}")
    tree_paths.append(f"M{fmt((pb[0] + 2, pb[1]))} L{fmt((pt[0] + 2, pt[1]))}")
    tree_paths.extend(scribble_crown(pc[0], pc[1], rx, ry, int(rx * ry * 0.075)))

# trees frame the two ends and leave the middle of the drawing quiet
for s in (17, 25, 33):
    tree(left, s, 3.0)
for s in (19, 27, 35):
    tree(right, s, 3.0)

# lamp post by the entrance
lp = corner(0.16, 0, out=3.2)
p0 = proj(lp)
p1 = proj((lp[0], 5.0, lp[2]))
tree_paths.append(f"M{fmt(p0)} L{fmt(p1)}")
lamp = [proj((lp[0] + dx, y, lp[2])) for dx, y in ((-0.35, 5.0), (0.35, 5.0), (0.25, 5.9), (-0.25, 5.9))]
tree_paths.append("M" + " L".join(fmt(p) for p in lamp) + " Z")
tree_paths.append(f"M{fmt(proj((lp[0]-0.1, 5.9, lp[2])))} L{fmt(proj((lp[0], 6.15, lp[2])))} L{fmt(proj((lp[0]+0.1, 5.9, lp[2])))}")

# planters either side of the doors
for u in (0.33, 0.67):
    c = corner(u, 0, out=0.8)
    pc = proj(c)
    w = abs(proj((c[0] + 0.45, 0, c[2]))[0] - pc[0])
    h = abs(proj((c[0], 0.8, c[2]))[1] - pc[1])
    tree_paths.append(f"M{pc[0]-w:.1f} {pc[1]-h:.1f} L{pc[0]+w:.1f} {pc[1]-h:.1f} L{pc[0]+w*0.75:.1f} {pc[1]:.1f} L{pc[0]-w*0.75:.1f} {pc[1]:.1f} Z")
    tree_paths.extend(scribble_crown(pc[0], pc[1] - h - w * 0.9, w * 1.1, w * 0.9, 24))

def person(x, y, h, step, flip=1):
    """A walking figure, feet at (x, y), h px tall."""
    s = h / 100
    f = flip
    head = (x + 2 * s * f, y - 92 * s)
    d = [f"M{head[0] + 6*s:.1f} {head[1]:.1f} A{6*s:.1f} {6*s:.1f} 0 1 0 {head[0] - 6*s:.1f} {head[1]:.1f} A{6*s:.1f} {6*s:.1f} 0 1 0 {head[0] + 6*s:.1f} {head[1]:.1f}"]
    # coat
    d.append(f"M{x - 8*s*f:.1f} {y - 80*s:.1f} Q{x:.1f} {y - 86*s:.1f} {x + 10*s*f:.1f} {y - 80*s:.1f} L{x + 12*s*f:.1f} {y - 44*s:.1f} L{x - 10*s*f:.1f} {y - 44*s:.1f} Z")
    # legs mid-stride
    d.append(f"M{x - 4*s*f:.1f} {y - 44*s:.1f} L{x - 14*s*f*step:.1f} {y:.1f} M{x + 4*s*f:.1f} {y - 44*s:.1f} L{x + 16*s*f*step:.1f} {y:.1f}")
    return d

# a guest arriving, wheeling a suitcase towards the door (left pavement)
g = proj(left(4, 0, 2.2))
gh = abs(proj(left(4, 1.75, 2.2))[1] - g[1])
tree_paths.extend(person(g[0], g[1], gh, 1, flip=1))
s = gh / 100
hand = (g[0] + 14 * s, g[1] - 56 * s)
case = (g[0] + 26 * s, g[1] - 30 * s, 22 * s, 30 * s)
tree_paths.append(f"M{g[0] + 8*s:.1f} {g[1] - 70*s:.1f} L{hand[0]:.1f} {hand[1]:.1f} L{case[0] + 2*s:.1f} {case[1]:.1f}")
tree_paths.append(f"M{case[0]:.1f} {case[1]:.1f} h{case[2]:.1f} v{case[3]:.1f} h{-case[2]:.1f} Z")
tree_paths.append(f"M{case[0] + 4*s:.1f} {case[1] + case[3] + 3*s:.1f} m-2 0 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0")

# someone walking a dog (right pavement)
w0 = proj(right(38, 0, 2.4))
wh = abs(proj(right(38, 1.75, 2.4))[1] - w0[1])
tree_paths.extend(person(w0[0], w0[1], wh, 1, flip=-1))
s = wh / 100
dog = (w0[0] - 46 * s, w0[1])
tree_paths.append(f"M{w0[0] - 8*s:.1f} {w0[1] - 62*s:.1f} L{dog[0] + 14*s:.1f} {dog[1] - 22*s:.1f}")
tree_paths.append(
    f"M{dog[0]:.1f} {dog[1]:.1f} L{dog[0] + 2*s:.1f} {dog[1] - 14*s:.1f} L{dog[0] + 20*s:.1f} {dog[1] - 14*s:.1f} L{dog[0] + 22*s:.1f} {dog[1]:.1f}"
    f" M{dog[0] + 2*s:.1f} {dog[1] - 14*s:.1f} L{dog[0] - 6*s:.1f} {dog[1] - 22*s:.1f} L{dog[0] - 10*s:.1f} {dog[1] - 18*s:.1f}"
    f" M{dog[0] + 20*s:.1f} {dog[1] - 14*s:.1f} L{dog[0] + 26*s:.1f} {dog[1] - 20*s:.1f}"
)

# ── Fit to the canvas ─────────────────────────────────────────────────────────
W, H = 1840, 640
all_pts = [proj(q) for q in (left(LEN, PARAPET + 1, 0), right(LEN, PARAPET + 1, 0), corner(0.5, PARAPET + 1.6, out=1.3), corner(0.5, 0))]
xs = [p[0] for p in all_pts]
ys = [p[1] for p in all_pts] + [p[1] for p in kerb]
top = min(ys)
bottom = max(p[1] for p in kerb)
scale = (H - 24) / (bottom - top)
ox = W / 2
oy = 12 - top * scale

def tf(d):
    # transform every "x y" pair in a path string
    out = []
    tokens = d.replace(",", " ").split()
    i = 0
    cmd = None
    while i < len(tokens):
        t = tokens[i]
        if t[0].isalpha():
            cmd = t[0]
            rest = t[1:]
            if rest:
                tokens[i] = rest
            else:
                out.append(cmd)
                i += 1
                continue
            out.append(cmd)
        if cmd in "aA":
            rx, ry, rot, la, sw, x, y = tokens[i:i + 7]
            if cmd == "A":
                out.append(f"{float(rx)*scale:.0f} {float(ry)*scale:.0f} {rot} {la} {sw} {float(x)*scale+ox:.0f} {float(y)*scale+oy:.0f}")
            else:
                out.append(f"{float(rx)*scale:.0f} {float(ry)*scale:.0f} {rot} {la} {sw} {float(x)*scale:.0f} {float(y)*scale:.0f}")
            i += 7
        elif cmd in "hH":
            out.append(f"{float(tokens[i])*scale + (ox if cmd=='H' else 0):.0f}")
            i += 1
        elif cmd in "vV":
            out.append(f"{float(tokens[i])*scale + (oy if cmd=='V' else 0):.0f}")
            i += 1
        elif cmd in "mlqMLQ":
            x, y = float(tokens[i]), float(tokens[i + 1])
            if cmd.isupper():
                out.append(f"{x*scale+ox:.0f} {y*scale+oy:.0f}")
            else:
                out.append(f"{x*scale:.0f} {y*scale:.0f}")
            i += 2
        elif cmd in "zZ":
            i += 1
        else:
            raise ValueError(cmd)
    return " ".join(out)

kerb_t = [(x * scale + ox, y * scale + oy) for x, y in kerb]
# run the kerb off both edges of the canvas
kerb_t = [(-40, kerb_t[0][1] + (kerb_t[0][1] - kerb_t[1][1]) * 0)] + kerb_t + [(W + 40, kerb_t[-1][1])]
kerb_d = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in kerb_t)

building = " ".join(tf(d) for d in paths)
front = " ".join(tf(d) for d in tree_paths)
masks = " ".join(tf(d) for d in fill_paths)

bg = '<rect width="100%" height="100%" fill="#32073e"/>' if len(sys.argv) > 2 and sys.argv[2] == "preview" else ""
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">
{bg}<defs><filter id="w" x="-1%" y="-1%" width="102%" height="102%"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="5"/><feDisplacementMap in="SourceGraphic" scale="2.4"/></filter></defs>
<g filter="url(#w)" fill="none" stroke="#F9E4FF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
<path d="{building}"/>
<path d="{kerb_d}"/>
<path d="{masks}" fill="#32073e" stroke="none"/>
<path d="{front}"/>
</g>
</svg>
'''
with open(sys.argv[1], "w") as fh:
    fh.write(svg)
print(len(svg), "bytes; scale", round(scale, 3))
