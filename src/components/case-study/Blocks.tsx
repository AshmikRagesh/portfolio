import { Check, X } from "lucide-react";
import PunchHole from "@/components/PunchHole";
import { Tag } from "@/components/Tag";
import AutoplayVideo from "./AutoplayVideo";
import ImagePlaceholder from "./ImagePlaceholder";
import ShippedStamp from "./ShippedStamp";
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
          <dt className="mb-[8px] font-body text-[18px] font-medium leading-[28px] text-heading">{label}</dt>
          <dd className="font-body text-[18px] leading-[28px] text-secondary">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Visual({ narrow, children }: { narrow?: boolean; children: React.ReactNode }) {
  return <div className={`cs-visual ${narrow ? "cs-narrow" : ""}`}>{children}</div>;
}

/**
 * Screenshot or clip with an optional label centred below it, then a caption. `video`
 * plays a muted loop while on screen (with `poster` as its first frame); `src` shows an
 * image; with neither it shows a placeholder named `name` (defaults to the label).
 * `impact` is the green result line some solution screens carry.
 */
export function Figure({
  label,
  name,
  caption,
  impact,
  src,
  alt,
  video,
  poster,
  aspect = "aspect-[16/9]",
}: {
  label?: string;
  name?: string;
  caption?: React.ReactNode;
  impact?: string;
  src?: string;
  alt?: string;
  video?: string;
  poster?: string;
  aspect?: string;
}) {
  const title = name ?? label ?? "Image";
  return (
    <figure className="m-0 min-w-0">
      <div className="overflow-hidden rounded-[4px] bg-grape-light/40 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.03)]">
        {video ? (
          <AutoplayVideo src={video} poster={poster} label={alt ?? title} />
        ) : src ? (
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
                <PunchHole index={i} light />
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

/** Icon cards — research insights, challenges, fronts, reasons. Three sit in one row;
 * five go three over two; the rest pair up. */
export function CardGrid({
  items,
  plain,
}: {
  items: { icon: React.ReactNode; title: string; description: string }[];
  /** No box — icon, title and line sit open on the page, for lists that aren't cards */
  plain?: boolean;
}) {
  const layout =
    items.length === 5
      ? "md:grid-cols-6 md:[&>*:nth-child(-n+3)]:col-span-2 md:[&>*]:col-span-3"
      : items.length === 3
        ? "md:grid-cols-3"
        : "md:grid-cols-2";
  return (
    <div className={`grid grid-cols-1 ${plain ? "gap-[32px] md:gap-[40px]" : "gap-[16px] md:gap-[24px]"} ${layout}`}>
      {items.map(({ icon, title, description }) => (
        <div
          key={title}
          className={`flex flex-col ${plain ? "gap-[12px]" : "gap-[16px] rounded-[16px] border border-line-soft bg-white p-[20px]"}`}
        >
          <div className="shrink-0">{icon}</div>
          <div className={`flex flex-col ${plain ? "gap-[8px]" : "gap-[12px]"}`}>
            <h4
              className={`font-heading tracking-[0px] text-heading ${
                plain ? "text-[20px] leading-[28px]" : "text-[24px] leading-[30px]"
              }`}
            >
              {title}
            </h4>
            <p className="font-body text-[18px] leading-[30px] text-muted">{description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * The problem statement on a guestbook notepad page: ruled cream paper, a punched hole,
 * a slight tilt that straightens as it lifts on hover. The situation reads in grey; the
 * consequence is marked in solid grape with white text. Kept for the problem statement
 * alone; other key statements use PullQuote.
 */
export function ProblemStatement({
  situation,
  consequence,
}: {
  situation: string;
  consequence: string;
}) {
  return (
    <div className="-rotate-[0.35deg] rounded-[4px] border border-line p-[20px] shadow-[0_4px_18px_rgba(30,5,37,0.10)] [background:linear-gradient(rgba(50,7,62,0.05)_1px,transparent_1px)_0_32px/100%_24px,#faf6ef] transition-transform duration-[260ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:-translate-y-[4px] hover:rotate-0 md:p-[32px] motion-reduce:transform-none motion-reduce:transition-none">
      <div className="mb-[20px] flex items-center justify-between border-b border-line/60 pb-[10px]">
        <h3 className="font-brand text-[16px] font-medium uppercase leading-[20px] tracking-[0px] text-heading">
          The Problem Statement
        </h3>
        <PunchHole index={2} light />
      </div>
      <p className="font-heading text-[20px] leading-[32px] text-secondary md:text-[24px] md:leading-[38px]">
        {situation}{" "}
        <mark className="rounded-[2px] bg-grape px-[4px] text-white [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
          {consequence}
        </mark>
      </p>
    </div>
  );
}

/**
 * A key statement that isn't the problem — a hypothesis, a principle. A grape rule on the
 * left, a grey tag, then the line in the heading face with its key half in grape. It's
 * text, not a card, so it sits in the reading column (inside Copy) with its own spacing.
 */
export function PullQuote({
  label,
  text,
  emphasis,
}: {
  label: string;
  text: string;
  emphasis: string;
}) {
  return (
    <div className="my-[40px] border-l-[4px] border-grape pl-[24px] md:my-[48px] md:pl-[32px]">
      <Tag tone="grey">{label}</Tag>
      <p className="mt-[16px] font-heading text-[22px] leading-[32px] text-heading md:text-[26px] md:leading-[38px]">
        {text} <span className="text-grape">{emphasis}</span>
      </p>
    </div>
  );
}

// Stat tile looks: a plain fact, the key fact (light grape, number in grape), and an
// estimate (dashed border, so a guess never passes for data)
const TILE = {
  plain: { box: "border border-line-soft bg-white", tag: "grey", stat: "text-heading" },
  key: { box: "bg-grape-light/60", tag: "grape", stat: "text-grape" },
  estimate: { box: "border border-dashed border-line bg-white", tag: "grey", stat: "text-heading" },
} as const;

const TILE_COLS = { 2: "md:grid-cols-2", 3: "md:grid-cols-3" } as const;

/**
 * Two or three facts as tiles side by side — an optional tag, the number at the shared stat size,
 * a line saying what it counts. Mark the point `key` and any guess `estimate`.
 */
export function StatTiles({
  items,
}: {
  items: { tag?: string; stat: string; label: string; tone?: keyof typeof TILE }[];
}) {
  const cols = TILE_COLS[items.length as keyof typeof TILE_COLS] ?? TILE_COLS[3];
  return (
    <div className={`grid grid-cols-1 gap-[16px] md:gap-[24px] ${cols}`}>
      {items.map(({ tag, stat, label, tone = "plain" }) => {
        const look = TILE[tone];
        return (
          <div key={label} className={`flex flex-col gap-[16px] rounded-[16px] p-[24px] ${look.box}`}>
            {tag && (
              <div>
                <Tag tone={look.tag}>{tag}</Tag>
              </div>
            )}
            <span className={`font-heading text-stat font-medium md:text-stat-md lg:text-stat-lg ${look.stat}`}>
              {stat}
            </span>
            <p className="font-body text-[18px] leading-[28px] text-secondary">{label}</p>
          </div>
        );
      })}
    </div>
  );
}

// Round marks for the notes: solid green tick for what worked, solid red cross for what
// didn't, dark number for the reasons the shipped option won — white symbol on each
function Mark({ tone, children }: { tone: "pro" | "con" | "reason"; children: React.ReactNode }) {
  const tones = {
    pro: "bg-success text-white",
    con: "bg-warning text-white",
    reason: "bg-primary text-white",
  };
  return (
    <span
      className={`mt-[2px] flex size-[22px] shrink-0 items-center justify-center rounded-full font-brand text-[12px] leading-none ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

const NOTE = "flex gap-[12px] font-body text-[18px] leading-[30px] text-secondary";

/** What worked (green tick) and what didn't (red cross) */
export function ProsCons({ pros = [], cons = [] }: { pros?: string[]; cons?: string[] }) {
  return (
    <ul className="flex flex-col gap-[12px]">
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
    <ol className="flex flex-col gap-[12px]">
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
 * An iteration or design option, every one laid out the same: label, title and notes on
 * the left, the preview on the right filling the card's full height (below on phones).
 * A chosen option has a dark border and a stamp — SHIPPED, or `stamp` for another
 * status such as "In test".
 */
export function OptionCard({
  label,
  title,
  shipped,
  stamp = "Shipped",
  image,
  children,
}: {
  label: string;
  title?: string;
  shipped?: boolean;
  stamp?: string;
  image: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`group relative rounded-[16px] bg-white p-[8px] ${
        shipped ? "border-2 border-primary" : "border border-line-soft"
      }`}
    >
      <div className="grid grid-cols-1 gap-[8px] md:grid-cols-2">
        <div className="flex flex-col gap-[16px] p-[12px] md:p-[16px]">
          <div className="flex flex-wrap items-center gap-[8px]">
            <Tag tone="grey">{label}</Tag>
          </div>
          {title && (
            <p className="font-heading text-[22px] font-medium leading-[30px] text-heading md:text-[24px] md:leading-[32px]">
              {title}
            </p>
          )}
          {children}
        </div>
        <div className="flex overflow-hidden rounded-[10px]">
          <ImagePlaceholder
            label={image}
            aspect="aspect-[4/3] md:aspect-auto md:h-full md:min-h-[280px]"
            radius="rounded-[10px]"
          />
        </div>
      </div>
      {shipped && (
        <ShippedStamp
          label={stamp}
          className="absolute right-[16px] top-[20px] h-[52px] w-[136px] md:right-[28px] md:top-[28px] md:h-[64px] md:w-[168px]"
        />
      )}
    </div>
  );
}

/**
 * Points set as open editorial columns instead of cards — no box or rule, just a large
 * grape number, a title and a line. It's text, so it sits in the reading column (inside
 * Copy, 32px under the paragraph like Stats); two or three side by side from tablet up,
 * stacked on phones. `stacked` sets them one per row with the number beside, for three
 * or more in the text column. For reasons and takeaways that follow a run of cards.
 */
export function NumberedPoints({
  items,
  stacked,
}: {
  items: { title: string; description: string }[];
  stacked?: boolean;
}) {
  // Stacked: one per row with the number beside it — for three or more in the text column
  if (stacked) {
    return (
      <ol className="m-0 mt-[32px] flex list-none flex-col gap-[32px] p-0">
        {items.map(({ title, description }, i) => (
          <li key={title} className="grid grid-cols-[48px_1fr] gap-[16px] md:grid-cols-[64px_1fr] md:gap-[24px]">
            <span className="font-heading text-[40px] font-normal leading-none tracking-[-2px] text-grape">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex flex-col gap-[8px]">
              <h4 className="font-heading text-[20px] leading-[28px] tracking-[0px] text-heading">{title}</h4>
              <p className="font-body text-[18px] leading-[30px] text-secondary">{description}</p>
            </div>
          </li>
        ))}
      </ol>
    );
  }
  return (
    <ol
      className={`m-0 mt-[32px] grid list-none grid-cols-1 gap-[32px] p-0 md:gap-[40px] ${
        items.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
      }`}
    >
      {items.map(({ title, description }, i) => (
        <li key={title} className="flex flex-col gap-[12px]">
          <span className="font-heading text-[40px] font-normal leading-none tracking-[-2px] text-grape">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h4 className="mt-[8px] font-heading text-[20px] leading-[28px] tracking-[0px] text-heading">{title}</h4>
          <p className="font-body text-[18px] leading-[30px] text-secondary">{description}</p>
        </li>
      ))}
    </ol>
  );
}

/**
 * Steps that happen in order, on a track — a numbered marker per step joined by a line.
 * The first step, the one up next, is filled blackcurrant; the rest are outlined in grape
 * and wait their turn. Across from tablet up; down the left on phones.
 */
export function Timeline({ items }: { items: { title: string; description: string }[] }) {
  return (
    <ol className="m-0 mt-[32px] grid list-none grid-cols-1 gap-[32px] p-0 md:grid-cols-3 md:gap-[24px]">
      {items.map(({ title, description }, i) => (
        <li key={title} className="relative grid grid-cols-[32px_1fr] gap-x-[16px] md:block">
          {/* The track runs from this marker to the next one */}
          {i < items.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute bottom-[-32px] left-[15px] top-[40px] w-[2px] rounded-full bg-line md:bottom-auto md:left-[44px] md:right-[-12px] md:top-[15px] md:h-[2px] md:w-auto"
            />
          )}
          <span
            aria-hidden="true"
            className={`relative z-[1] flex size-[32px] items-center justify-center rounded-full font-brand text-[14px] leading-none ${
              i === 0 ? "bg-primary text-white" : "border-2 border-grape bg-background text-grape"
            }`}
          >
            {i + 1}
          </span>
          <div className="flex flex-col gap-[8px] md:mt-[20px]">
            <h4 className="font-heading text-[20px] leading-[28px] tracking-[0px] text-heading">{title}</h4>
            <p className="font-body text-[18px] leading-[30px] text-secondary">{description}</p>
          </div>
        </li>
      ))}
    </ol>
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
            <p className="font-body text-[18px] leading-[30px] text-secondary">{label}</p>
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
    <div className={`mt-[32px] grid grid-cols-2 gap-[24px] md:gap-[32px] ${items.length === 2 ? "" : "md:grid-cols-4"}`}>
      {items.map(({ stat, label }) => (
        <div key={label} className="flex flex-col gap-[8px]">
          <span className="font-heading text-stat font-medium leading-none text-heading md:text-stat-md lg:text-stat-lg">
            {stat}
          </span>
          <p className="font-body text-[18px] leading-[30px] text-muted">{label}</p>
        </div>
      ))}
    </div>
  );
}

/** Small muted note under a block — sources, and what's an estimate rather than data */
export function Footnote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-[24px] font-body text-[14px] leading-[22px] text-muted [&_a]:underline [&_a]:underline-offset-[2px]">
      {children}
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
          <li key={i} className="font-body text-[18px] leading-[30px] text-muted">
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
