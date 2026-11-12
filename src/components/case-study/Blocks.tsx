import { ArrowRight, Check, X } from "lucide-react";
import { Quotes as QuoteMark } from "@phosphor-icons/react/dist/ssr";
import PunchHole from "@/components/PunchHole";
import { Tag } from "@/components/Tag";
import ImagePlaceholder from "./ImagePlaceholder";
import Media from "./Media";
import { Circled } from "./Marks";
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
 * Screenshot or clip with an optional label centred below it, then a caption. Both open
 * larger on click (see Media). `video` plays a muted loop while on screen (with `poster` as
 * its first frame) — or, with `narrated`, waits for the reader and plays with sound; either
 * way it has play / pause and speed controls. `src` shows an image; with neither it shows a
 * placeholder named `name` (defaults to the label).
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
  narrated,
  aspect = "aspect-[16/9]",
  card,
  kicker,
}: {
  label?: string;
  name?: string;
  caption?: React.ReactNode;
  impact?: string;
  src?: string;
  alt?: string;
  video?: string;
  poster?: string;
  narrated?: boolean;
  aspect?: string;
  /** Set the media in the white case study card (as in Solution sections): 8px inset, the
   *  media's 4px frame nested inside, caption and impact under it inside the card */
  card?: boolean;
  /** A small label over the media in a card (CardKicker) — only when it adds something the
   *  heading above doesn't say, such as which design a recording shows */
  kicker?: React.ReactNode;
}) {
  const title = name ?? label ?? "Image";
  const media =
    video || src ? (
      <Media src={src} video={video} poster={poster} label={alt ?? title} narrated={narrated} />
    ) : (
      <ImagePlaceholder label={title} aspect={aspect} />
    );
  if (card) {
    return (
      <figure className="cs-pair-card m-0 flex min-w-0 flex-col rounded-md p-[8px]">
        {kicker && (
          <div className="px-[12px] pb-[12px] pt-[8px] md:px-[16px] md:pb-[16px] md:pt-[12px]">
            <CardKicker>{kicker}</CardKicker>
          </div>
        )}
        <div className="cs-pair-media relative overflow-hidden rounded-sm bg-grape-light/40">{media}</div>
        {(label || caption || impact) && (
          <div className="flex flex-col gap-[8px] px-[12px] pb-[8px] pt-[16px] md:px-[16px]">
            {label && <p className="m-0 font-body text-caption-md font-medium text-muted">{label}</p>}
            {caption && (
              <figcaption className="font-body text-body text-secondary md:text-body-md">{caption}</figcaption>
            )}
            {impact && (
              <figcaption className="font-body text-body uppercase text-success">{impact}</figcaption>
            )}
          </div>
        )}
      </figure>
    );
  }
  return (
    <figure className="m-0 min-w-0">
      <div className="overflow-hidden rounded-sm bg-grape-light/40 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.03)]">
        {video || src ? (
          <Media src={src} video={video} poster={poster} label={alt ?? title} narrated={narrated} />
        ) : (
          <ImagePlaceholder label={title} aspect={aspect} />
        )}
      </div>
      {label && (
        <p className="mt-[12px] text-center font-body text-[12px] font-medium leading-[16px] text-muted">{label}</p>
      )}
      {caption && (
        <figcaption className="mt-[14px] text-center font-body text-[14px] leading-[22px] text-muted [text-wrap:balance]">
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
          <li key={`${i}-${attribution}`} className="min-w-0">
            <figure
              className={`relative m-0 flex h-full flex-col rounded-sm border border-line p-[20px] text-heading shadow-[0_4px_18px_rgba(30,5,37,0.10)] [background:linear-gradient(rgba(50,7,62,0.05)_1px,transparent_1px)_0_32px/100%_24px,#faf6ef] transition-transform duration-[260ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:!translate-y-[-4px] hover:!rotate-0 md:p-[24px] motion-reduce:!transform-none motion-reduce:transition-none ${
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
 * five go three over two; the rest pair up. From tablet up each card shares its row's
 * lines (a subgrid), so icons, titles and lines start level across a row even when one
 * title wraps. */
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
      : items.length % 3 === 0
        ? "md:grid-cols-3"
        : "md:grid-cols-2";
  return (
    <div className={`cs-stagger grid grid-cols-1 ${plain ? "gap-[32px] md:gap-[40px]" : "gap-[16px] md:gap-[24px]"} ${layout}`}>
      {items.map(({ icon, title, description }) => (
        <div
          key={title}
          className={`flex flex-col md:row-span-3 md:grid md:grid-rows-subgrid ${
            plain ? "gap-[12px] md:gap-y-[12px]" : "gap-[16px] rounded-xl border border-line-soft bg-white p-[20px] md:gap-y-[16px]"
          }`}
        >
          <div className="shrink-0">{icon}</div>
          <h4
            className={`font-heading tracking-[0px] text-heading ${
              plain ? "text-[20px] leading-[28px]" : "text-[24px] leading-[30px]"
            }`}
          >
            {title}
          </h4>
          {/* Sits a touch closer to its title than the title does to the icon */}
          <p className="-mt-[4px] font-body text-[18px] leading-[30px] text-muted">{description}</p>
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
    <div className="-rotate-[0.35deg] rounded-sm border border-line p-[20px] shadow-[0_4px_18px_rgba(30,5,37,0.10)] [background:linear-gradient(rgba(50,7,62,0.05)_1px,transparent_1px)_0_32px/100%_24px,#faf6ef] transition-transform duration-[260ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:-translate-y-[4px] hover:rotate-0 md:p-[32px] motion-reduce:transform-none motion-reduce:transition-none">
      <div className="mb-[20px] flex items-center justify-between border-b border-line/60 pb-[10px]">
        <h3 className="font-brand text-[16px] font-medium uppercase leading-[20px] tracking-[0px] text-heading">
          The Problem Statement
        </h3>
        <PunchHole index={2} light />
      </div>
      <p className="font-heading text-[20px] leading-[32px] text-secondary md:text-[24px] md:leading-[38px]">
        {situation}{" "}
        <mark className="rounded-xs bg-grape px-[4px] text-white [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
          {consequence}
        </mark>
      </p>
    </div>
  );
}

/**
 * What people said in research, as quote cards: a grape quote mark, the words verbatim in
 * the heading face, and who said it at the foot of the card. Two sit side by side from
 * tablet up and stack on phones; one sits alone at reading width. For a few user quotes;
 * Quotes (the notepad cards) is for a wall of feedback.
 */
export function UserQuotes({ items }: { items: { text: React.ReactNode; attribution: string }[] }) {
  return (
    <div className={`cs-stagger grid grid-cols-1 gap-[16px] md:gap-[24px] ${items.length > 1 ? "md:grid-cols-2" : "mx-auto w-full max-w-[700px]"}`}>
      {items.map(({ text, attribution }, i) => (
        <figure key={i} className="m-0 flex flex-col rounded-xl border border-line-soft bg-white p-[24px] md:p-[32px]">
          <QuoteMark aria-hidden="true" size={32} weight="fill" className="mb-[20px] shrink-0 text-grape" />
          <blockquote className="m-0 flex-1 font-heading text-h3 text-heading md:text-h3-md">{text}</blockquote>
          <figcaption className="mt-[24px] border-t border-line-soft pt-[16px] font-body text-body text-muted md:text-body-md">
            {attribution}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/**
 * A few counted findings as rows: what was counted on the left, the number on the right, and
 * a bar under each showing how much of the whole it is (`of`). A count with no `of` fills the
 * bar unless it's zero. `circled` loops a pen mark around the number that matters most.
 */
export function BarRows({
  heads,
  items,
}: {
  heads?: [string, string];
  items: { label: string; value: number; of?: number; circled?: boolean }[];
}) {
  return (
    <div className="mt-[32px]">
      {heads && (
        <div className="mb-[16px] flex justify-between border-b border-line pb-[12px] font-brand text-caption uppercase text-muted">
          <span>{heads[0]}</span>
          <span>{heads[1]}</span>
        </div>
      )}
      <ul className="m-0 flex list-none flex-col gap-[24px] p-0">
        {items.map(({ label, value, of, circled }) => {
          const share = of ? value / of : value > 0 ? 1 : 0;
          const shown = of ? `${value} of ${of}` : String(value);
          return (
            <li key={label}>
              <div className="flex items-baseline justify-between gap-[16px]">
                <span className="font-body text-body text-secondary md:text-body-md">{label}</span>
                <span className="shrink-0 font-heading text-h4 tabular-nums text-heading md:text-h4-md">
                  {circled ? <Circled>{shown}</Circled> : shown}
                </span>
              </div>
              <div aria-hidden="true" className="mt-[10px] h-[8px] overflow-hidden rounded-full bg-grape-light/70">
                <div className="cs-bar h-full rounded-full bg-grape" style={{ width: `${share * 100}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
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
  label?: string;
  text: string;
  emphasis: string;
}) {
  return (
    <div className="my-[40px] border-l-[4px] border-grape pl-[24px] md:my-[48px] md:pl-[32px]">
      {label && <Tag face="geist" tone="grey">{label}</Tag>}
      <p className={`${label ? "mt-[16px]" : ""} font-heading text-[22px] leading-[32px] text-heading md:text-[26px] md:leading-[38px]`}>
        {text} <span className="text-grape">{emphasis}</span>
      </p>
    </div>
  );
}

// Stat tile looks: a plain fact, the key fact (light grape, number in grape), and an
// estimate (dashed border, so a guess never passes for data)
const TILE = {
  plain: { box: "border border-line-soft bg-white", tag: "grey", stat: "text-heading" },
  key: { box: "border border-transparent bg-grape-light/45", tag: "grape", stat: "text-grape" },
  estimate: { box: "border border-dashed border-line bg-white", tag: "grey", stat: "text-heading" },
} as const;

const TILE_COLS = { 2: "md:grid-cols-2", 3: "md:grid-cols-3" } as const;

/**
 * Two or three facts as tiles side by side — an optional tag, the number at the shared stat size,
 * a line saying what it counts. Mark the point `key` and any guess `estimate`. A share (0–100)
 * can carry a `meter`: a thin bar under the line, filled to that share, so the size reads at a glance. From tablet up
 * the tiles share their row's lines (a subgrid), so tags, numbers and lines start level
 * across tiles even when one number or line runs longer; a tile without a tag keeps the slot.
 */
export function StatTiles({
  items,
}: {
  items: { tag?: string; stat: string; label: string; tone?: keyof typeof TILE; meter?: number }[];
}) {
  const metered = items.some((item) => item.meter !== undefined);
  const cols = TILE_COLS[items.length as keyof typeof TILE_COLS] ?? TILE_COLS[3];
  const tagged = items.some((item) => item.tag);
  return (
    <div className={`grid grid-cols-1 gap-[16px] md:gap-[24px] ${cols}`}>
      {items.map(({ tag, stat, label, tone = "plain", meter }) => {
        const look = TILE[tone];
        const rows = (tagged ? 3 : 2) + (metered ? 1 : 0);
        return (
          <div
            key={label}
            className={`flex flex-col gap-[16px] rounded-xl p-[24px] md:grid md:grid-rows-subgrid md:gap-y-[16px] ${
              { 2: "md:row-span-2", 3: "md:row-span-3", 4: "md:row-span-4" }[rows]
            } ${look.box}`}
          >
            {tagged && <div>{tag && <Tag face="geist" tone={look.tag}>{tag}</Tag>}</div>}
            <span className={`font-heading text-stat font-medium md:text-stat-md lg:text-stat-lg ${look.stat}`}>
              {stat}
            </span>
            <p className="font-body text-[18px] leading-[28px] text-secondary">{label}</p>
            {metered && (
              <div className="mt-auto w-full">
                {meter !== undefined && (
                  <div
                    role="img"
                    aria-label={`${meter} out of 100`}
                    className="h-[8px] w-full overflow-hidden rounded-full bg-primary/[0.08]"
                  >
                    <div className="h-full rounded-full bg-grape" style={{ width: `${meter}%` }} />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Round marks for the notes, soft so the media stays the hero: a green tick on pale green
// for what worked, a red cross on pale red for what didn't, a dark number on pale grape for
// the reasons the shipped option won
function Mark({ tone, children }: { tone: "pro" | "con" | "reason"; children: React.ReactNode }) {
  const tones = {
    pro: "bg-success/[0.16] text-success",
    con: "bg-warning/[0.16] text-warning",
    reason: "bg-grape-light text-primary",
  };
  return (
    <span
      className={`mt-[2px] flex size-[22px] shrink-0 items-center justify-center rounded-full font-brand text-[12px] leading-none ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

const NOTE = "flex gap-[12px] font-body text-[16px] leading-[26px] text-secondary md:text-[18px] md:leading-[30px]";

const NOTE_HEAD = "font-brand text-[12px] uppercase leading-[16px] tracking-[0.5px] text-muted";

// One column of notes under the option card's media, headed in the body face
function NotePanel({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[16px] px-[12px] pb-[12px] pt-[20px] md:px-[16px] md:pb-[16px]">
      <p className="font-body text-[16px] font-semibold leading-[24px] text-heading">{heading}</p>
      {children}
    </div>
  );
}

/**
 * What worked (green tick) and what didn't (red cross), side by side from tablet up so the
 * two read as a comparison, split by a hairline (stacked, with a rule between, on phones)
 */
export function ProsCons({ pros = [], cons = [] }: { pros?: string[]; cons?: string[] }) {
  const list = (items: string[], tone: "pro" | "con") => (
    <ul className="flex flex-col gap-[12px]">
      {items.map((item) => (
        <li key={item} className={NOTE}>
          <Mark tone={tone}>{tone === "pro" ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}</Mark>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className={`grid grid-cols-1 divide-y divide-line-soft ${pros.length && cons.length ? "md:grid-cols-2 md:divide-x md:divide-y-0" : ""}`}>
      {pros.length > 0 && <NotePanel heading="What worked">{list(pros, "pro")}</NotePanel>}
      {cons.length > 0 && <NotePanel heading="What didn’t">{list(cons, "con")}</NotePanel>}
    </div>
  );
}

/** Why the shipped option won, numbered */
export function Reasons({ items }: { items: string[] }) {
  return (
    <NotePanel heading="Why it won">
      <ol className="flex flex-col gap-[12px]">
        {items.map((r, i) => (
          <li key={r} className={NOTE}>
            <Mark tone="reason">{i + 1}</Mark>
            <span>{r}</span>
          </li>
        ))}
      </ol>
    </NotePanel>
  );
}

/**
 * The small label over a card's title ("Variant 2", "Option C"): Geist capitals in the grape
 * accent with a 6px grape dot before it. Plain text, not a tag. Shared by OptionCard and
 * VariantPair so every option and variant is named the same way.
 */
export function CardKicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-0 flex items-center gap-[8px] font-geist text-caption-md font-medium uppercase tracking-[1px] text-grape">
      <span aria-hidden="true" className="size-[6px] shrink-0 rounded-full bg-grape" />
      {children}
    </p>
  );
}

/**
 * An iteration or design option, every one laid out the same, top to bottom: label, title
 * and an optional note; the preview across the full width at one 16:9 size (a clip plays
 * in the case study player); then the notes. Stacking keeps every card's preview the same
 * size, whatever the length of its notes. It shares the VariantPair card (white, 8px corners,
 * soft low shadow, the media's 4px frame nested in an 8px inset); the label (CardKicker) sits
 * over the title, not a tag. A chosen option has a dark outline and a
 * stamp pressed onto the media's corner — SHIPPED, or `stamp` for another status such as
 * "Selected" or "In test".
 */
export function OptionCard({
  label,
  title,
  shipped,
  stamp = "Shipped",
  image,
  src,
  video,
  poster,
  note,
  children,
}: {
  label: string;
  title?: string;
  shipped?: boolean;
  stamp?: string;
  image: string;
  /** An illustration to show in place of the grey stand-in, set whole on the surface colour */
  src?: string;
  /** A clip of the option, played in the case study player */
  video?: string;
  poster?: string;
  /** A short line under the title, e.g. how the option scored */
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`cs-pair-card group relative rounded-md p-[8px] ${shipped ? "cs-pair-card--chosen" : ""}`}>
      <div className={`flex min-h-[64px] flex-col gap-[8px] px-[12px] pb-[16px] pt-[12px] md:px-[16px] md:pb-[20px] md:pt-[16px] ${shipped ? "pb-[28px] md:pr-[248px]" : ""}`}>
        <CardKicker>{label}</CardKicker>
        {title && <p className="m-0 font-heading text-h3 text-heading md:text-h3-md lg:text-h3-lg">{title}</p>}
        {note && <p className={NOTE_HEAD}>{note}</p>}
      </div>
      {/* The stamp is pressed onto the media's top-right corner, half on the work and half
          above it, and the frame takes a small thud as it lands */}
      <div className="relative">
        <div className={`cs-pair-media relative overflow-hidden rounded-sm ${shipped ? "stamp-thud" : ""}`}>
          {video ? (
            <Media video={video} poster={poster} label={image} />
          ) : src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={image} className="aspect-[16/9] w-full bg-surface object-contain p-[32px]" />
          ) : (
            <ImagePlaceholder label={image} aspect="aspect-[16/9]" radius="rounded-sm" />
          )}
        </div>
        {shipped && (
          <ShippedStamp
            label={stamp}
            className="absolute -top-[24px] right-[12px] z-[2] h-[48px] w-auto md:-top-[40px] md:right-[24px] md:h-[80px]"
          />
        )}
      </div>
      <div className="mt-[4px]">{children}</div>
    </div>
  );
}

/**
 * Points set as open editorial columns instead of cards — no box or rule, just a large
 * grape number, a title and a line. It's text, so it sits in the reading column (inside
 * Copy, 32px under the paragraph like Stats); two sit side by side from tablet up, three
 * from desktop up (they break to rows on tablets and phones). `stacked` sets them one per row with the number beside, for three
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
              <h4 className="font-heading text-[24px] leading-[30px] tracking-[0px] text-heading">{title}</h4>
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
        items.length === 2 ? "md:grid-cols-2" : "lg:grid-cols-3"
      }`}
    >
      {items.map(({ title, description }, i) => (
        <li key={title} className="flex flex-col gap-[12px]">
          <span className="font-heading text-[40px] font-normal leading-none tracking-[-2px] text-grape">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h4 className="mt-[8px] font-heading text-[24px] leading-[30px] tracking-[0px] text-heading">{title}</h4>
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

/**
 * A short process as a strip of steps — white pills with a hairline border joined by
 * arrows, so the order reads at a glance. Wraps on narrow screens.
 */
export function ProcessStrip({ steps }: { steps: string[] }) {
  return (
    <ol className="m-0 mt-[32px] flex list-none flex-wrap items-center gap-x-[8px] gap-y-[12px] p-0">
      {steps.map((step, i) => (
        <li key={step} className="flex items-center gap-[8px]">
          <span className="inline-flex h-[40px] items-center rounded-full border border-line bg-white px-[14px] font-body text-[16px] leading-[24px] text-heading">
            {step}
          </span>
          {i < steps.length - 1 && <ArrowRight size={16} aria-hidden="true" className="shrink-0 text-muted" />}
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
        <div key={stat} className="group/metric flex flex-col gap-[16px] rounded-xl bg-success-bg p-[24px]">
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
