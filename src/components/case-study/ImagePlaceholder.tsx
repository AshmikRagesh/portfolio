/**
 * Grey placeholder box shown while real assets are pending.
 * Swap with <Image> when screenshots / videos are ready.
 *
 * Props:
 *   label  — short descriptor shown inside the box (e.g. "v0 prototype")
 *   aspect — Tailwind aspect-ratio class  (default: "aspect-[16/9]")
 *   radius — Tailwind border-radius class (default: "rounded-[4px]")
 */
export default function ImagePlaceholder({
  label,
  aspect = "aspect-[16/9]",
  radius = "rounded-[4px]",
}: {
  label: string;
  aspect?: string;
  radius?: string;
}) {
  return (
    <div
      className={`relative w-full ${aspect} ${radius} border border-line bg-placeholder flex items-center justify-center overflow-hidden`}
    >
      <div className="flex flex-col items-center gap-2 opacity-50">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
        <span className="font-brand text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
          {label}
        </span>
      </div>
    </div>
  );
}
