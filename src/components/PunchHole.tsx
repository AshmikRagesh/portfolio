// A hand-punched hole: slightly wobbly edge, shadow inside the top lip, light rim at the
// bottom and a tiny paper fibre. Filled with whatever sits behind the paper so it shows
// through. Rotated per card so no two holes look identical.
export default function PunchHole({ index, fill = "#32073e" }: { index: number; fill?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style={{ transform: `rotate(${index * 67}deg)` }}>
      <path
        d="M8.2 1.1c2 .1 4.1 1.1 5.3 2.8 1.2 1.6 1.6 3.8 1 5.8-.6 2.2-2.3 3.9-4.5 4.6-2.1.6-4.5.3-6.2-1.1C2.2 11.9 1.1 9.8 1.3 7.6c.2-2.3 1.6-4.3 3.6-5.4 1-.6 2.1-1 3.3-1.1Z"
        fill={fill}
      />
      <path d="M2.4 6.2c.9-2.6 3.3-4.4 6-4.4 1.6 0 3.1.6 4.2 1.6" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3.4 12.6c1.2 1 2.7 1.6 4.4 1.5 2.4-.1 4.4-1.6 5.3-3.7" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M13.9 9.6l1.1.5" stroke="rgba(250,246,239,0.9)" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}
