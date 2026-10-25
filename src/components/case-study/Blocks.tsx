import { Check } from "lucide-react";
import SparkleAiIcon from "@/components/icons/SparkleAiIcon";
import ImagePlaceholder from "./ImagePlaceholder";
import TrendUpArrow from "./TrendUpArrow";

// ─────────────────────────────────────────────────────────────────────────────
// Case study building blocks — used inside <Chapter>. Copy is the 700px reading
// column (plain <p>, <h3>, <h4>, <ul> are styled by .cs-copy); Visual breaks out
// to 1000px and stacks what's in it one below the other. Images and cards go in a
// Visual; running text stays in Copy.
// Green marks what worked or improved, red what didn't — keep that meaning.
// ─────────────────────────────────────────────────────────────────────────────

export function Copy({ children }: { children: React.ReactNode }) {
  return <div className="cs-column cs-copy">{children}</div>;
}

/** Large opening line for a chapter or a key statement */
export function Lead({ children }: { children: React.ReactNode }) {
  return <p className="cs-lead">{children}</p>;
}

/** Role / Team / Timeline in one row under the Overview intro */
export function Meta({
  role,
  team,
  timeline,
}: {
  role: React.ReactNode;
  team: React.ReactNode;
  timeline: React.ReactNode;
}) {
  const items = [
    { label: "Role", value: role },
    { label: "Team", value: team },
    { label: "Timeline", value: timeline },
  ];
  return (
    <dl className="mb-[28px] mt-[48px] grid grid-cols-1 gap-[20px] md:grid-cols-[1fr_1.5fr_1.4fr] md:gap-[28px]">
      {items.map(({ label, value }) => (
        <div key={label}>
          <dt className="mb-[8px] font-body text-[16px] font-medium leading-[24px] text-heading">{label}</dt>
          <dd className="font-body text-[16px] leading-[24px] text-secondary">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Visual({ narrow, children }: { narrow?: boolean; children: React.ReactNode }) {
  return <div className={`cs-visual ${narrow ? "cs-narrow" : ""}`}>{children}</div>;
}

/**
 * Screenshot with an optional label centred below it, then a caption. Without `src` it
 * shows a placeholder named after the label. `impact` is the green result line
 * some solution screens carry.
 */
export function Figure({
  label,
  caption,
  impact,
  src,
  alt,
  aspect = "aspect-[16/9]",
}: {
  label?: string;
  caption?: React.ReactNode;
  impact?: string;
  src?: string;
  alt?: string;
  aspect?: string;
}) {
  return (
    <figure className="m-0 min-w-0">
      <div className="overflow-hidden rounded-[4px] bg-grape-light/40 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.03)]">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt ?? label ?? ""} className="block h-auto w-full" />
        ) : (
          <ImagePlaceholder label={label ?? "Image"} aspect={aspect} />
        )}
      </div>
      {label && (
        <p className="mt-[12px] text-center font-body text-[12px] font-medium leading-[16px] text-heading">{label}</p>
      )}
      {caption && (
        <figcaption className="mt-[14px] font-body text-[14px] leading-[22px] text-muted [text-wrap:pretty]">
          {caption}
        </figcaption>
      )}
      {impact && (
        <figcaption className="mt-[20px] text-center font-body text-[14px] uppercase leading-[20px] text-success">
          {impact}
        </figcaption>
      )}
    </figure>
  );
}

/** Pull quote; `attribution` is shown exactly as written (e.g. "— ResCo, Delhi office") */
export function Quote({
  children,
  attribution,
  italic,
}: {
  children: React.ReactNode;
  attribution: string;
  italic?: boolean;
}) {
  return (
    <blockquote className="mx-0 mb-0 mt-[32px] border-l-2 border-grape pl-[24px]">
      <p
        className={`font-heading text-[20px] leading-[30px] text-heading md:text-[24px] md:leading-[34px] ${italic ? "italic" : ""}`}
      >
        &ldquo;{children}&rdquo;
      </p>
      <footer className="mt-[16px] font-body text-[14px] leading-[20px] text-muted">{attribution}</footer>
    </blockquote>
  );
}

/** Icon cards — research insights, challenges, fronts. Five go three over two. */
export function CardGrid({
  items,
}: {
  items: { icon: React.ReactNode; title: string; description: string }[];
}) {
  const threeOverTwo = items.length === 5;
  return (
    <div
      className={`grid grid-cols-1 gap-[16px] md:gap-[24px] ${
        threeOverTwo ? "md:grid-cols-6 md:[&>*:nth-child(-n+3)]:col-span-2 md:[&>*]:col-span-3" : "md:grid-cols-2"
      }`}
    >
      {items.map(({ icon, title, description }) => (
        <div key={title} className="flex flex-col gap-[16px] rounded-[16px] bg-white p-[20px]">
          <div className="shrink-0">{icon}</div>
          <div className="flex flex-col gap-[12px]">
            <h4 className="font-heading text-[20px] leading-[26px] tracking-[0px] text-heading">{title}</h4>
            <p className="font-body text-[16px] leading-[26px] text-muted">{description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** The problem statement: the situation in grey, the consequence underlined */
export function ProblemStatement({
  situation,
  consequence,
}: {
  situation: string;
  consequence: string;
}) {
  return (
    <div className="flex flex-col gap-[20px] rounded-[8px] border-2 border-heading bg-[rgba(137,91,231,0.05)] p-[24px]">
      <div className="flex items-center gap-[8px]">
        <SparkleAiIcon size={26} className="shrink-0 text-heading" />
        <h3 className="font-body text-[18px] font-medium leading-[26px] text-heading">The Problem Statement</h3>
      </div>
      <p className="font-body text-[18px] leading-[28px]">
        <span className="text-secondary">{situation} </span>
        <span className="text-heading underline decoration-solid [text-decoration-skip-ink:none]">
          {consequence}
        </span>
      </p>
    </div>
  );
}

/** What worked (green +) and what didn't (red −) */
export function ProsCons({ pros = [], cons = [] }: { pros?: string[]; cons?: string[] }) {
  const row = "flex gap-[8px] font-body text-[16px] leading-[26px] text-muted";
  return (
    <ul className="flex flex-col gap-[6px]">
      {pros.map((item) => (
        <li key={item} className={row}>
          <span className="shrink-0 font-medium text-success">+</span>
          <span>{item}</span>
        </li>
      ))}
      {cons.map((item) => (
        <li key={item} className={row}>
          <span className="shrink-0 font-medium text-warning">−</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * An iteration or design option: eyebrow (+ Shipped badge) over its title and notes,
 * with the preview image beside them (below on phones). The shipped one is outlined.
 */
export function OptionCard({
  label,
  title,
  shipped,
  image,
  children,
}: {
  label: string;
  title?: string;
  shipped?: boolean;
  image: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col gap-[20px] rounded-[16px] p-[20px] md:p-[24px] ${
        shipped ? "border-2 border-heading bg-[rgba(137,91,231,0.05)]" : "bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-[8px]">
        <span className="font-brand text-[12px] font-medium uppercase tracking-[1px] text-muted">{label}</span>
        {shipped && (
          <span className="inline-flex items-center gap-[4px] rounded-[4px] bg-primary px-[10px] py-[4px] font-brand text-[10px] font-medium uppercase tracking-[1px] text-white">
            <Check size={10} strokeWidth={2.5} />
            Shipped
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[24px]">
        <div className="flex flex-col gap-[16px]">
          {title && <p className="font-body text-[18px] font-medium leading-[28px] text-heading">{title}</p>}
          {children}
        </div>
        <ImagePlaceholder label={image} aspect="aspect-[4/3]" radius="rounded-[8px]" />
      </div>
    </div>
  );
}

/** Headline results — green cards with an upward arrow; the numbers line up along the bottom */
export function Metrics({ items }: { items: { stat: string; label: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-[16px] md:grid-cols-3 md:gap-[24px]">
      {items.map(({ stat, label }) => (
        <div key={stat} className="flex flex-col gap-[16px] rounded-[16px] bg-success-bg p-[24px]">
          <div className="flex justify-end">
            <TrendUpArrow />
          </div>
          <div className="flex flex-1 flex-col gap-[12px]">
            <p className="font-body text-[16px] leading-[26px] text-secondary">{label}</p>
            <span className="mt-auto font-heading text-stat font-medium text-heading md:text-stat-md lg:text-stat-lg">
              {stat}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Plain numbers with no card — matter-of-fact counts, not results */
export function Stats({ items }: { items: { stat: string; label: string }[] }) {
  return (
    <div className="mt-[32px] grid grid-cols-2 gap-[24px] md:grid-cols-4 md:gap-[32px]">
      {items.map(({ stat, label }) => (
        <div key={label} className="flex flex-col gap-[8px]">
          <span className="font-heading text-stat font-medium leading-none text-heading md:text-stat-md lg:text-stat-lg">
            {stat}
          </span>
          <p className="font-body text-[16px] leading-[26px] text-muted">{label}</p>
        </div>
      ))}
    </div>
  );
}

/** Green "Impact" eyebrow over a list of results */
export function ImpactList({ items }: { items: string[] }) {
  return (
    <div className="mt-[28px] flex flex-col gap-[12px]">
      <p className="font-brand text-[12px] font-medium uppercase tracking-[1px] text-success">Impact</p>
      <ul className="flex list-disc flex-col gap-[8px] pl-[20px]">
        {items.map((i) => (
          <li key={i} className="font-body text-[16px] leading-[26px] text-muted">
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Centred italic closing line */
export function Punchline({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-[40px]">
      <p className="mx-auto max-w-[640px] text-center font-body text-[18px] italic leading-[28px] text-heading">
        {children}
      </p>
    </div>
  );
}
