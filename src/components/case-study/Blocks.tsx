import { Check, X } from "lucide-react";
import PunchHole from "@/components/PunchHole";
import { Tag } from "@/components/Tag";
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
 * shows a placeholder named `name` (defaults to the label). `impact` is the green
 * result line some solution screens carry.
 */
export function Figure({
  label,
  name,
  caption,
  impact,
  src,
  alt,
  aspect = "aspect-[16/9]",
}: {
  label?: string;
  name?: string;
  caption?: React.ReactNode;
  impact?: string;
  src?: string;
  alt?: string;
  aspect?: string;
}) {
  const title = name ?? label ?? "Image";
  return (
    <figure className="m-0 min-w-0">
      <div className="overflow-hidden rounded-[4px] bg-grape-light/40 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.03)]">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt ?? title} className="block h-auto w-full" />
        ) : (
          <ImagePlaceholder label={title} aspect={aspect} />
        )}
      </div>
      {label && (
        <p className="mt-[12px] text-center font-body text-[12px] font-medium leading-[16px] text-muted">{label}</p>
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

// Cards tilt alternately, like loose pages (as in the home page guestbook)
const TILTS = ["-rotate-[0.35deg]", "rotate-[0.4deg]"];

/**
 * Quotes as guestbook notepad cards: ruled cream paper, a punched hole, a slight tilt
 * that straightens on hover. Two sit side by side; one sits centred. `attribution` is
 * written as usual ("— ResCo, Delhi office") and set as name over role.
 */
export function Quotes({ items }: { items: { text: React.ReactNode; attribution: string }[] }) {
  return (
    <ol
      className={`m-0 grid list-none grid-cols-1 gap-[16px] p-0 md:gap-[24px] ${
        items.length > 1 ? "md:grid-cols-2" : "mx-auto w-full max-w-[488px]"
      }`}
    >
      {items.map(({ text, attribution }, i) => {
        const [name, ...role] = attribution.replace(/^—\s*/, "").split(", ");
        return (
          <li key={attribution} className="min-w-0">
            <figure
              className={`relative m-0 flex h-full flex-col rounded-[4px] border border-line p-[20px] text-heading shadow-[0_4px_18px_rgba(30,5,37,0.10)] [background:linear-gradient(rgba(50,7,62,0.05)_1px,transparent_1px)_0_32px/100%_24px,#faf6ef] transition-transform duration-[260ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:!translate-y-[-4px] hover:!rotate-0 md:p-[24px] motion-reduce:!transform-none motion-reduce:transition-none ${
                TILTS[i % TILTS.length]
              }`}
            >
              <div className="mb-[20px] flex items-center justify-between border-b border-line/60 pb-[10px] font-brand text-[10px] uppercase leading-[14px] tracking-[0px] text-muted">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <PunchHole index={i} fill="#f8f9fa" />
              </div>
              <blockquote className="m-0 flex-1 pt-[4px] font-heading text-[20px] leading-[26px] text-heading lg:text-[22px] lg:leading-[30px]">
                <p className="m-0">&ldquo;{text}&rdquo;</p>
              </blockquote>
              <figcaption className="mt-[32px] border-t border-line/60 pt-[14px] font-body text-[12px] leading-[16px] text-secondary">
                <span className="block text-[14px] font-medium leading-[20px] text-heading">{name}</span>
                {role.length > 0 && <span>{role.join(", ")}</span>}
              </figcaption>
            </figure>
          </li>
        );
      })}
    </ol>
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
        <div key={title} className="flex flex-col gap-[16px] rounded-[16px] border border-line-soft bg-white p-[20px]">
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

// Filled alert mark for the problem statement: a solid disc with the "!" cut out
function ProblemIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 19a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-1-13a1 1 0 1 1 2 0v4.5a1 1 0 1 1-2 0V6Zm1 9.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * The problem statement: the situation in grey, the consequence underlined in grape.
 * Lifts on hover like the guestbook cards.
 */
export function ProblemStatement({
  situation,
  consequence,
}: {
  situation: string;
  consequence: string;
}) {
  return (
    <div className="rounded-[16px] border border-line bg-white p-[24px] shadow-[0_4px_18px_rgba(30,5,37,0.08)] transition-transform duration-[260ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:-translate-y-[4px] md:p-[32px] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="mb-[20px] flex items-center gap-[12px]">
        <span className="flex size-[36px] shrink-0 items-center justify-center rounded-[10px] bg-grape-light text-grape">
          <ProblemIcon />
        </span>
        <h3 className="font-heading text-[22px] leading-[28px] text-heading md:text-[24px] md:leading-[30px]">
          The Problem Statement
        </h3>
      </div>
      <p className="font-heading text-[20px] leading-[30px] md:text-[24px] md:leading-[34px]">
        <span className="text-secondary">{situation} </span>
        <span className="text-heading underline decoration-grape/50 decoration-2 underline-offset-[6px] [text-decoration-skip-ink:none]">
          {consequence}
        </span>
      </p>
    </div>
  );
}

// Round marks for the notes: green tick for what worked, red cross for what didn't,
// grape number for the reasons the shipped option won
function Mark({ tone, children }: { tone: "pro" | "con" | "reason"; children: React.ReactNode }) {
  const tones = {
    pro: "bg-success/10 text-success",
    con: "bg-warning/10 text-warning",
    reason: "bg-grape-light text-grape",
  };
  return (
    <span
      className={`mt-[2px] flex size-[22px] shrink-0 items-center justify-center rounded-full font-brand text-[12px] leading-none ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

const NOTE = "flex gap-[12px] font-body text-[16px] leading-[26px] text-secondary";

/** What worked (green tick) and what didn't (red cross) */
export function ProsCons({ pros = [], cons = [] }: { pros?: string[]; cons?: string[] }) {
  return (
    <ul className="flex flex-col gap-[10px]">
      {pros.map((item) => (
        <li key={item} className={NOTE}>
          <Mark tone="pro"><Check size={14} strokeWidth={2.5} /></Mark>
          <span>{item}</span>
        </li>
      ))}
      {cons.map((item) => (
        <li key={item} className={NOTE}>
          <Mark tone="con"><X size={14} strokeWidth={2.5} /></Mark>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Why the shipped option won, numbered */
export function Reasons({ items }: { items: string[] }) {
  return (
    <ol className="flex flex-col gap-[10px]">
      {items.map((r, i) => (
        <li key={r} className={NOTE}>
          <Mark tone="reason">{i + 1}</Mark>
          <span>{r}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * An iteration or design option: its label (+ Shipped) over its title and notes, with
 * the preview image beside them (below on phones). The shipped one has a grape border.
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
      className={`rounded-[16px] bg-white p-[8px] ${
        shipped ? "border-2 border-grape" : "border border-line-soft"
      }`}
    >
      <div className="grid grid-cols-1 gap-[8px] md:grid-cols-2">
        <div className="flex flex-col gap-[16px] p-[12px] md:p-[16px]">
          <div className="flex flex-wrap items-center gap-[8px]">
            <Tag tone="outline">{label}</Tag>
            {shipped && <Tag tone="grape">Shipped</Tag>}
          </div>
          {title && (
            <p className="font-heading text-[22px] font-medium leading-[30px] text-heading">{title}</p>
          )}
          {children}
        </div>
        <div className="overflow-hidden rounded-[10px] bg-surface">
          <ImagePlaceholder label={image} aspect="aspect-[4/3]" radius="rounded-[10px]" />
        </div>
      </div>
    </div>
  );
}

/** Headline results — green cards with an upward arrow; the numbers line up along the bottom */
export function Metrics({ items }: { items: { stat: string; label: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-[16px] md:grid-cols-3 md:gap-[24px]">
      {items.map(({ stat, label }) => (
        <div key={stat} className="group/metric flex flex-col gap-[16px] rounded-[16px] bg-success-bg p-[24px]">
          {/* The arrow rises a touch on hover */}
          <div className="flex justify-end transition-transform duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/metric:-translate-y-[6px] motion-reduce:transition-none motion-reduce:group-hover/metric:translate-y-0">
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
