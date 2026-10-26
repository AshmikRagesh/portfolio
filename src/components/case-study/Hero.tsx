import { ArrowRight } from "lucide-react";

/**
 * Case study hero — a grey stand-in image for now (a video later), with the title, date
 * and optional live link set left in the reading column over a midnight fade rising
 * from the bottom.
 */
export default function Hero({
  title,
  date,
  link,
}: {
  title: string;
  date: string;
  link?: { href: string; label: string };
}) {
  return (
    <header data-cs-hero className="relative isolate h-[520px] overflow-hidden bg-placeholder">
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="absolute left-1/2 top-[112px] -translate-x-1/2 text-muted opacity-50"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>

      {/* The same fade the expanded reel uses on phones */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[80%] bg-gradient-to-t from-midnight/90 via-midnight/60 to-transparent"
      />

      <div className="cs-column pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-start gap-[16px] pb-[40px] md:pb-[56px]">
        <h1 className="text-balance text-left font-heading text-[40px] font-normal leading-[44px] tracking-[-2px] text-white md:text-[44px] md:leading-[48px] lg:text-[50px] lg:leading-[54px]">
          {title}
        </h1>
        <div className="flex flex-wrap items-center gap-[12px]">
          <span className="whitespace-nowrap rounded-full bg-white px-[18px] py-[10px] font-body text-[16px] leading-[20px] text-heading">
            {date}
          </span>
          {link && (
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="group/visit pointer-events-auto inline-flex items-center gap-[6px] whitespace-nowrap rounded-full bg-primary px-[18px] py-[10px] font-body text-[16px] leading-[20px] text-white"
            >
              <span className="transition-opacity duration-200 group-hover/visit:opacity-80">{link.label}</span>
              <ArrowRight
                size={16}
                strokeWidth={2}
                className="-mr-[2px] transition-[transform,opacity] duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/visit:-rotate-45 group-hover/visit:opacity-80"
              />
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
