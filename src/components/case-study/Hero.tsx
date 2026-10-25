import { ArrowRight } from "lucide-react";

/**
 * Case study hero — a coloured band with the case study's title, its date, and an
 * optional live link, flanked by two screens (left only on phones).
 * Pass `left` / `right` image paths once real screenshots exist.
 */
export default function Hero({
  title,
  date,
  color,
  link,
  left,
  right,
}: {
  title: string;
  date: string;
  color: string;
  link?: { href: string; label: string };
  left?: string;
  right?: string;
}) {
  return (
    <header
      data-cs-hero
      className="relative isolate h-[520px] overflow-hidden"
      style={{ backgroundColor: color }}
    >
      <HeroScreen
        src={left}
        alt={`${title} — screen`}
        className="left-[calc(50%-150px)] top-[300px] md:left-auto md:right-[calc(50%+310px)] md:top-[112px]"
      />
      <HeroScreen
        src={right}
        alt={`${title} — screen`}
        className="hidden md:block md:left-[calc(50%+310px)] md:top-[112px]"
      />

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-start gap-[14px] pt-[88px] md:justify-center md:pt-0">
        <h1 className="max-w-[640px] text-balance px-[20px] text-center font-heading text-[32px] font-normal leading-[36px] tracking-[-2px] text-heading md:text-[44px] md:leading-[48px] lg:text-[50px] lg:leading-[54px]">
          {title}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-[12px] px-[20px]">
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

function HeroScreen({ src, alt, className }: { src?: string; alt: string; className: string }) {
  const frame =
    "absolute w-[300px] rounded-[8px] shadow-[0_10px_40px_rgba(0,0,0,0.07)] md:w-[650px] md:rounded-[12px] max-lg:md:opacity-60";
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={`${frame} ${className}`} />
  ) : (
    <div aria-hidden="true" className={`${frame} aspect-[16/10] bg-white/70 ${className}`} />
  );
}
