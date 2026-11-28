import Cta from "@/components/Cta";

/**
 * Case study hero — the case study's image (`image`, cropped to fill; `imagePosition` picks
 * the part to keep) or a grey stand-in until one exists, with the date and optional live
 * link over the title, set left in the reading column over a midnight fade rising from the
 * bottom. On a phone the two stack: the whole image at its own 16:9 (the full window on its
 * stage colour, never cropped into), then the date and title on the midnight below.
 */
export default function Hero({
  title,
  date,
  link,
  image,
  imagePosition = "center",
}: {
  title: string;
  date: string;
  link?: { href: string; label: string };
  image?: string;
  imagePosition?: string;
}) {
  return (
    <header data-cs-hero className="relative isolate overflow-hidden bg-[#1e0525] md:h-[520px] md:bg-placeholder">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="block aspect-[16/9] w-full object-cover md:absolute md:inset-0 md:aspect-auto md:h-full"
          style={{ objectPosition: imagePosition }}
        />
      ) : (
        <>
        <div aria-hidden="true" className="aspect-[16/9] w-full bg-placeholder md:hidden" />
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
        </>
      )}

      {/* Dark behind the date and title, clearing fast above them, so the image still shows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] hidden h-[64%] md:block bg-[linear-gradient(to_top,rgba(30,5,37,0.92)_0%,rgba(30,5,37,0.82)_32%,rgba(30,5,37,0.4)_62%,rgba(30,5,37,0)_100%)]"
      />

      <div className="cs-column pointer-events-none relative z-10 flex flex-col items-start gap-[16px] pb-[32px] pt-[24px] md:absolute md:inset-x-0 md:bottom-0 md:pb-[56px] md:pt-0">
        {/* Date (and live link) above the title — the context you read first */}
        <div className="flex flex-wrap items-center gap-[12px]">
          <span className="whitespace-nowrap rounded-full bg-white px-[18px] py-[10px] font-body text-[16px] leading-[20px] text-heading">
            {date}
          </span>
          {link && (
            <Cta href={link.href} external size="sm" className="pointer-events-auto">
              {link.label}
            </Cta>
          )}
        </div>
        <h1 className="text-balance text-left font-heading text-h1-md font-normal text-white [text-shadow:0_2px_24px_rgba(18,2,15,0.4)] md:text-h1-lg">
          {title}
        </h1>
      </div>
    </header>
  );
}
