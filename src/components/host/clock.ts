// ── Clock formatting ──────────────────────────────────────────────────────────
// Active seconds as a clock: MM:SS, with hours in front once there are some.

export function formatClock(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** Active seconds in words-ish units, as the board shows them: 4m 16s, or 1h 02m once there are hours. */
export function formatDuration(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 ? `${h}h ${m.toString().padStart(2, "0")}m` : `${m}m ${s.toString().padStart(2, "0")}s`;
}
