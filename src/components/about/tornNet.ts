// Torn net — a fruit net stretched over a framed picture. Grab it and pull: the strands
// stretch thin, snap and spring back, and pieces that come loose fall away.
//
// World units: the frame's opening is OPEN_W wide (the sizes below were tuned to it).
// x runs right, y runs down, z comes up off the picture towards the viewer.

export const OPEN_W = 0.962;
export const EYE = 3; // how far the eye is, for the slight perspective on lifted strands
export const Z0 = 0.0016; // the net's resting height on the picture
export const FACE = 0.02; // the frame's face — above this, a strand shows over the frame
export const SHADOW = [0.682, 0.909] as const; // light from the top left

const GRAB_R = 0.034; // how much of the net one grab takes hold of
const SUBSTEPS = 12;
const PRESTRETCH = 1.16; // the net is stretched taut over the frame

const enum S {
  Free = 0,
  Pinned = 1, // tucked under the frame
  Held = 2,
  Falling = 3,
  Gone = 4,
}
const enum E {
  Dead = 0,
  Alive = 1,
  Snapped = 2,
}

function rng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rect = readonly [number, number, number, number]; // x0, y0, x1, y1

export type Net = ReturnType<typeof createNet>;

/** open: the frame's opening; onFrame: whether a point lies over the frame itself */
export function createNet(open: Rect, onFrame: (x: number, y: number) => boolean, seed = 7) {
  const rand = rng(seed);
  const [ox0, oy0, ox1, oy1] = open;
  const a = (ox1 - ox0) / 46;
  const rowH = PRESTRETCH * a;
  const x0 = ox0 - 0.75 * a;
  const y0 = oy0 - 0.6 * rowH;
  const cols = Math.ceil((ox1 + 0.75 * a - x0) / a) + 1;
  const rows = Math.ceil((oy1 + 0.6 * rowH - y0) / (rowH / 2)) + 1;
  const n = cols * rows;

  const pos = new Float32Array(n * 3);
  const prev = new Float32Array(n * 3);
  const inv = new Float32Array(n); // inverse mass
  const state = new Uint8Array(n);
  const degree = new Uint8Array(n);
  const alpha = new Float32Array(n).fill(1);
  const fadeRate = new Float32Array(n);

  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const x = x0 + (c + (r & 1) * 0.5) * a;
      const y = y0 + (r * rowH) / 2;
      pos[3 * i] = prev[3 * i] = x;
      pos[3 * i + 1] = prev[3 * i + 1] = y;
      pos[3 * i + 2] = prev[3 * i + 2] = Z0;
      const outside = x < ox0 || x > ox1 || y < oy0 || y > oy1;
      state[i] = outside ? S.Pinned : S.Free;
      inv[i] = outside ? 0 : 1;
    }

  // Strands run diagonally down-left (0) and down-right (1) from every knot
  const out = [new Int32Array(n).fill(-1), new Int32Array(n).fill(-1)];
  const inc = [new Int32Array(n).fill(-1), new Int32Array(n).fill(-1)];
  const ea: number[] = [];
  const eb: number[] = [];
  for (let r = 0; r + 1 < rows; r++)
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const odd = r & 1;
      const next = [odd ? c : c - 1, odd ? c + 1 : c];
      for (let d = 0; d < 2; d++) {
        if (next[d] < 0 || next[d] >= cols) continue;
        const j = (r + 1) * cols + next[d];
        if (state[i] === S.Pinned && state[j] === S.Pinned) continue;
        out[d][i] = ea.length;
        inc[d][j] = ea.length;
        ea.push(i);
        eb.push(j);
      }
    }
  const m = ea.length;
  const A = Int32Array.from(ea);
  const B = Int32Array.from(eb);
  const rest = new Float32Array(m);
  const breakAt = new Float32Array(m);
  const stubLen = new Float32Array(2 * m);
  const lineA = new Int32Array(m).fill(-1); // the strand before A in the same line
  const lineB = new Int32Array(m).fill(-1); // the strand after B in the same line
  const edge = new Uint8Array(m).fill(E.Alive);
  const snapTime = new Float32Array(m);
  const snapLen = new Float32Array(m);

  for (let e = 0; e < m; e++) {
    const i = A[e];
    const j = B[e];
    const len = Math.hypot(pos[3 * j] - pos[3 * i], pos[3 * j + 1] - pos[3 * i + 1]);
    rest[e] = (len / PRESTRETCH) * (1 + (rand() - 0.5) * 0.06);
    breakAt[e] = 1.85 + 0.45 * rand() + (rand() < 0.04 ? -0.2 : 0);
    stubLen[2 * e] = 0.12 + 0.3 * rand();
    stubLen[2 * e + 1] = 0.12 + 0.3 * rand();
    const d = out[0][i] === e ? 0 : 1;
    lineA[e] = inc[d][i];
    lineB[e] = out[d][j];
    degree[i]++;
    degree[j]++;
  }

  let time = 0;
  let snapped = 0;
  let falling = 0;
  let topoDirty = false;
  let killY = 10;

  const hook = {
    on: false,
    nodes: [] as number[],
    off: [] as number[],
    x: 0,
    y: 0,
    z: Z0,
    fx: 0,
    fy: 0,
    px: 0,
    py: 0,
    pz: Z0,
    held: 0,
  };

  function fall(i: number, pop: number, rate: number) {
    if (state[i] === S.Falling || state[i] === S.Gone) return;
    state[i] = S.Falling;
    inv[i] = 1;
    fadeRate[i] = rate;
    prev[3 * i + 2] -= pop; // a little kick up off the picture
    falling++;
  }

  function release() {
    if (!hook.on) return;
    for (const i of hook.nodes)
      if (state[i] === S.Held) {
        state[i] = S.Free;
        inv[i] = 1;
      }
    hook.on = false;
    hook.nodes = [];
    topoDirty = true;
  }

  function grab(x: number, y: number) {
    release();
    hook.nodes = [];
    hook.off = [];
    for (let i = 0; i < n; i++) {
      if (state[i] !== S.Free || degree[i] === 0) continue;
      const dx = pos[3 * i] - x;
      const dy = pos[3 * i + 1] - y;
      if (dx * dx + dy * dy < GRAB_R * GRAB_R) {
        hook.nodes.push(i);
        hook.off.push(dx, dy);
      }
    }
    if (!hook.nodes.length) return false;
    for (const i of hook.nodes) {
      state[i] = S.Held;
      inv[i] = 0;
    }
    hook.on = true;
    hook.held = 0;
    hook.fx = hook.px = hook.x = x;
    hook.fy = hook.py = hook.y = y;
    hook.z = hook.pz = Z0;
    return true;
  }

  function substep(h: number, k: number, forward: boolean) {
    const dampFree = Math.exp(-2.4 * h);
    const dampFall = Math.exp(-1.2 * h);
    const g = 7 * h * h;
    const comp = 1e-5 / (h * h);

    if (hook.on) {
      const f = (k + 1) / SUBSTEPS;
      const hx = hook.px + (hook.fx - hook.px) * f;
      const hy = hook.py + (hook.fy - hook.py) * f;
      const hz = hook.pz + (hook.z - hook.pz) * f;
      const t = Math.min(1, hook.held / 0.28);
      const gather = 1 - 0.6 * t * t * (3 - 2 * t); // the fabric bunches up in the fingers
      for (let q = 0; q < hook.nodes.length; q++) {
        const i = hook.nodes[q];
        if (state[i] !== S.Held) continue;
        prev[3 * i] = pos[3 * i];
        prev[3 * i + 1] = pos[3 * i + 1];
        prev[3 * i + 2] = pos[3 * i + 2];
        const dx = hook.off[2 * q] * gather;
        const dy = hook.off[2 * q + 1] * gather;
        pos[3 * i] = hx + dx;
        pos[3 * i + 1] = hy + dy;
        pos[3 * i + 2] = Z0 + (hz - Z0) * (1 - ((dx * dx + dy * dy) / (GRAB_R * GRAB_R)) * 0.5);
      }
    }

    for (let i = 0; i < n; i++) {
      const s = state[i];
      if (s !== S.Free && s !== S.Falling) continue;
      const d = s === S.Falling ? dampFall : dampFree;
      const x = pos[3 * i];
      const y = pos[3 * i + 1];
      const z = pos[3 * i + 2];
      pos[3 * i] = x + (x - prev[3 * i]) * d;
      pos[3 * i + 1] = y + (y - prev[3 * i + 1]) * d + g;
      pos[3 * i + 2] = z + (z - prev[3 * i + 2]) * d;
      prev[3 * i] = x;
      prev[3 * i + 1] = y;
      prev[3 * i + 2] = z;
    }

    // Strands only pull (a net has no stiffness when slack), and snap when pulled too far
    for (let q = 0; q < m; q++) {
      const e = forward ? q : m - 1 - q;
      if (edge[e] !== E.Alive) continue;
      const i = A[e];
      const j = B[e];
      const dx = pos[3 * j] - pos[3 * i];
      const dy = pos[3 * j + 1] - pos[3 * i + 1];
      const dz = pos[3 * j + 2] - pos[3 * i + 2];
      const r = rest[e];
      const l2 = dx * dx + dy * dy + dz * dz;
      if (l2 <= r * r) continue;
      const l = Math.sqrt(l2);
      if (l > breakAt[e] * r && state[i] !== S.Falling) {
        edge[e] = E.Snapped;
        snapTime[e] = time;
        snapLen[e] = l;
        degree[i]--;
        degree[j]--;
        snapped++;
        topoDirty = true;
        continue;
      }
      const wi = inv[i];
      const wj = inv[j];
      const w = wi + wj;
      if (w === 0) continue;
      const c = (l - r) / (l * (w + comp));
      pos[3 * i] += dx * c * wi;
      pos[3 * i + 1] += dy * c * wi;
      pos[3 * i + 2] += dz * c * wi;
      pos[3 * j] -= dx * c * wj;
      pos[3 * j + 1] -= dy * c * wj;
      pos[3 * j + 2] -= dz * c * wj;
    }

    // The picture underneath, and the frame around it
    for (let i = 0; i < n; i++) {
      const s = state[i];
      if (s !== S.Free && s !== S.Falling) continue;
      let z = pos[3 * i + 2];
      if (s === S.Free && z < Z0) {
        z = pos[3 * i + 2] = prev[3 * i + 2] = Z0;
        prev[3 * i] += (pos[3 * i] - prev[3 * i]) * 0.006; // a touch of friction
        prev[3 * i + 1] += (pos[3 * i + 1] - prev[3 * i + 1]) * 0.006;
      }
      const x = pos[3 * i];
      const y = pos[3 * i + 1];
      if ((x >= ox0 && x <= ox1 && y >= oy0 && y <= oy1) || (s === S.Falling && z < 0.012)) continue;
      const px = prev[3 * i];
      const py = prev[3 * i + 1];
      const wasIn = px >= ox0 - 0.004 && px <= ox1 + 0.004 && py >= oy0 - 0.004 && py <= oy1 + 0.004;
      if (z < 0.012 && wasIn) {
        // lying flat, it can't slide in under the frame's edge
        pos[3 * i] = Math.min(ox1, Math.max(ox0, x));
        pos[3 * i + 1] = Math.min(oy1, Math.max(oy0, y));
        prev[3 * i] = Math.min(ox1, Math.max(ox0, px));
        prev[3 * i + 1] = Math.min(oy1, Math.max(oy0, py));
      } else if (z < 0.0216 && onFrame(x, y)) {
        pos[3 * i + 2] = prev[3 * i + 2] = 0.0216; // it rests on the frame's face
      }
    }
  }

  // After a snap: whatever is no longer joined to the frame (or the hand) falls away
  const seen = new Uint8Array(n);
  const stack = new Int32Array(n);
  const island = new Int32Array(n);
  const nb = new Int32Array(4);
  function neighbours(i: number) {
    let c = 0;
    for (let d = 0; d < 2; d++) {
      const o = out[d][i];
      const p = inc[d][i];
      if (o >= 0 && edge[o] === E.Alive) nb[c++] = B[o];
      if (p >= 0 && edge[p] === E.Alive) nb[c++] = A[p];
    }
    return c;
  }
  function settleIslands() {
    topoDirty = false;
    seen.fill(0);
    let top = 0;
    for (let i = 0; i < n; i++)
      if (state[i] === S.Pinned || state[i] === S.Held) {
        seen[i] = 1;
        stack[top++] = i;
      }
    while (top) {
      const c = neighbours(stack[--top]);
      for (let q = 0; q < c; q++) {
        const j = nb[q];
        if (seen[j] || state[j] === S.Falling || state[j] === S.Gone) continue;
        seen[j] = 1;
        stack[top++] = j;
      }
    }
    for (let i = 0; i < n; i++) {
      if (seen[i] || state[i] !== S.Free || degree[i] === 0) continue;
      let size = 0;
      top = 0;
      stack[top++] = i;
      seen[i] = 1;
      while (top) {
        const k = stack[--top];
        island[size++] = k;
        const c = neighbours(k);
        for (let q = 0; q < c; q++)
          if (!seen[nb[q]]) {
            seen[nb[q]] = 1;
            stack[top++] = nb[q];
          }
      }
      const crumb = size < 4;
      for (let q = 0; q < size; q++) fall(island[q], crumb ? 0 : 0.35 / 720, crumb ? 5 : 0);
    }
    for (let i = 0; i < n; i++) if (state[i] === S.Free && degree[i] === 0) fall(i, 0, 6);
  }

  return {
    n,
    m,
    pos,
    state,
    alpha,
    degree,
    A,
    B,
    rest,
    edge,
    stubLen,
    lineA,
    lineB,
    snapTime,
    snapLen,
    grab,
    release,
    moveTo(x: number, y: number) {
      hook.x = x;
      hook.y = y;
    },
    step(dt: number) {
      time += dt;
      if (hook.on) {
        hook.held += dt;
        hook.px = hook.fx;
        hook.py = hook.fy;
        hook.pz = hook.z;
        hook.fx = hook.x;
        hook.fy = hook.y;
        const t = Math.min(1, hook.held / 0.22);
        hook.z = Z0 + 0.0534 * (1 - (1 - t) * (1 - t)); // lifts off the picture as it's taken
      }
      const h = dt / SUBSTEPS;
      for (let k = 0; k < SUBSTEPS; k++) substep(h, k, k % 2 === 0);
      if (topoDirty) settleIslands();
      if (falling)
        for (let i = 0; i < n; i++) {
          if (state[i] !== S.Falling) continue;
          let a = alpha[i] - fadeRate[i] * dt;
          if (pos[3 * i + 1] > killY) a = 0;
          if (a <= 0) {
            a = 0;
            state[i] = S.Gone;
            falling--;
          }
          alpha[i] = a;
        }
    },
    nearest(x: number, y: number, r: number) {
      let best = -1;
      let b2 = r * r;
      for (let i = 0; i < n; i++) {
        if (state[i] !== S.Free || degree[i] === 0) continue;
        const dx = pos[3 * i] - x;
        const dy = pos[3 * i + 1] - y;
        const d2 = dx * dx + dy * dy;
        if (d2 < b2) {
          b2 = d2;
          best = i;
        }
      }
      return best;
    },
    /** Mend: the whole net comes away and falls */
    dropAll() {
      release();
      for (let i = 0; i < n; i++) {
        if (degree[i] === 0 && state[i] !== S.Falling) {
          state[i] = S.Gone;
          alpha[i] = 0;
          continue;
        }
        if (state[i] === S.Pinned) {
          state[i] = S.Free;
          inv[i] = 1;
        }
        fall(i, (0.2 + 0.1 * rand()) / 720, 0.9);
      }
    },
    get time() {
      return time;
    },
    get holding() {
      return hook.on;
    },
    get hookZ() {
      return hook.z;
    },
    get snapped() {
      return snapped;
    },
    get falling() {
      return falling;
    },
    get gone() {
      for (let i = 0; i < n; i++) if (state[i] !== S.Gone) return false;
      return true;
    },
    set killY(y: number) {
      killY = y;
    },
  };
}

export const NODE_GONE = S.Gone;
export const NODE_FALLING = S.Falling;
export const EDGE_ALIVE = E.Alive;
export const EDGE_SNAPPED = E.Snapped;
