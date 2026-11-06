// ── Hover tip ─────────────────────────────────────────────────────────────────
// The small dark label under each desk object that says what a click does. Put it
// inside the object's button and give the button `group/tip relative`. It shows on
// hover (pointers that can hover only, so a tap doesn't leave it stuck) and on
// keyboard focus.

export default function HoverTip({ children }: { children: string }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 -translate-y-1 whitespace-nowrap rounded-md bg-midnight px-2 py-1 font-geist text-caption text-background opacity-0 shadow-[0_4px_12px_rgba(30,5,37,0.2)] transition-all duration-200 group-focus-visible/tip:translate-y-0 group-focus-visible/tip:opacity-100 [@media(hover:hover)]:group-hover/tip:translate-y-0 [@media(hover:hover)]:group-hover/tip:opacity-100"
    >
      {children}
    </span>
  );
}
