import { experience } from "@/content/experience";

// Torn bottom edge — small uneven notches, as if the sheet was ripped off the pad.
const TORN_EDGE =
  "polygon(0 0, 100% 0, 100% 99%, 94% 100%, 88% 99.2%, 81% 100%, 74% 99.4%, 66% 100%, 58% 99%, 50% 99.8%, 42% 99.2%, 34% 100%, 26% 99.4%, 18% 100%, 10% 99.2%, 4% 100%, 0 99.4%)";

// A yellow legal pad listing past roles, tilted, with a pencil resting on the top-right corner.
// Sizes: 288px wide (fits beside the 502px portrait at lg), everything on a 2/4px grid.
export default function ExperiencePad() {
  return (
    <aside
      aria-label="Experience"
      className="group relative w-[288px] shrink-0 -rotate-[4deg] motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out hover:-rotate-[2deg]"
    >
      {/* Sheet underneath — peeks out so the pad reads as a stack */}
      <div
        aria-hidden
        className="absolute inset-0 rotate-[3deg] rounded-sm bg-legal-pad-deep shadow-[0_2px_4px_rgba(30,5,37,0.08)]"
      />

      {/* Top sheet — shadow sits on a wrapper because clip-path would cut a box-shadow off */}
      <div className="relative drop-shadow-[0_12px_16px_rgba(30,5,37,0.14)]">
        <div className="relative rounded-sm bg-legal-pad px-6 pb-8 pt-10" style={{ clipPath: TORN_EDGE }}>
          {/* Glue strip at the top of the pad */}
          <div aria-hidden className="absolute inset-x-0 top-0 h-4 bg-legal-pad-deep" />

          <h2 className="font-geist text-body-lg font-normal text-muted">Experience</h2>

          <ol className="mt-8 flex flex-col gap-5">
            {experience.map((e, i) => (
              <li key={i} className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-col">
                  <span className="font-geist text-body-lg font-medium text-text-base">{e.company}</span>
                  <span className="font-geist text-body text-muted">{e.role}</span>
                </div>
                <span className="shrink-0 font-geist text-body text-muted tabular-nums">{e.years}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <Pencil className="pointer-events-none absolute -right-10 -top-12 w-[200px] rotate-[-52deg] drop-shadow-[0_8px_8px_rgba(30,5,37,0.22)] motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out group-hover:translate-x-1 group-hover:-translate-y-1" />
    </aside>
  );
}

// Hexagonal yellow pencil drawn lying left-to-right: graphite tip → sharpened wood → body → ferrule → eraser.
function Pencil({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 20" className={className}>
      <defs>
        <linearGradient id="pencil-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd75a" />
          <stop offset="0.34" stopColor="#ffd75a" />
          <stop offset="0.34" stopColor="#f5b821" />
          <stop offset="0.66" stopColor="#f5b821" />
          <stop offset="0.66" stopColor="#d9940c" />
          <stop offset="1" stopColor="#d9940c" />
        </linearGradient>
        <linearGradient id="pencil-ferrule" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9e9ea" />
          <stop offset="0.5" stopColor="#a9abaf" />
          <stop offset="1" stopColor="#6d7076" />
        </linearGradient>
        <linearGradient id="pencil-eraser" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4a6a6" />
          <stop offset="1" stopColor="#c96c70" />
        </linearGradient>
      </defs>
      {/* Sharpened wood */}
      <path d="M0 10 L32 0 L32 20 Z" fill="#e8c89a" />
      <path d="M0 10 L32 10 L32 20 Z" fill="#cfa974" />
      {/* Graphite */}
      <path d="M0 10 L10 6.9 L10 13.1 Z" fill="#3a3540" />
      {/* Body */}
      <rect x="32" y="0" width="128" height="20" fill="url(#pencil-body)" />
      {/* Ferrule with grooves */}
      <rect x="160" y="0" width="22" height="20" fill="url(#pencil-ferrule)" />
      <rect x="165" y="0" width="2" height="20" fill="#5c5f65" opacity="0.5" />
      <rect x="175" y="0" width="2" height="20" fill="#5c5f65" opacity="0.5" />
      {/* Eraser */}
      <path d="M182 0 H194 A6 6 0 0 1 200 6 V14 A6 6 0 0 1 194 20 H182 Z" fill="url(#pencil-eraser)" />
    </svg>
  );
}
