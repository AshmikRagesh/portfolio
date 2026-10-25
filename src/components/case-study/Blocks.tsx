import ImagePlaceholder from "./ImagePlaceholder";

// ─────────────────────────────────────────────────────────────────────────────
// Case study building blocks — used inside <Chapter>. Copy is the 560px reading
// column (plain <p>, <h3>, <ul> are styled by .cs-copy); Visual breaks out to
// 1000px for figures.
// ─────────────────────────────────────────────────────────────────────────────

export function Copy({ children }: { children: React.ReactNode }) {
  return <div className="cs-column cs-copy">{children}</div>;
}

/** Large opening line for a chapter or a key statement */
export function Lead({ children }: { children: React.ReactNode }) {
  return <p className="cs-lead">{children}</p>;
}

/** Role / Team / Timeline grid at the top of the Context chapter */
export function Meta({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  // Three or fewer sit in one row; four go two by two
  const cols = items.length === 4 ? 2 : items.length;
  return (
    <dl
      className="mb-[28px] mt-[48px] grid grid-cols-1 gap-[20px] md:grid-cols-[repeat(var(--cols),minmax(0,1fr))] md:gap-[28px]"
      style={{ "--cols": cols } as React.CSSProperties}
    >
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

/** Figures side by side; they stack on phones */
export function Pair({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 items-start gap-[28px] md:flex md:gap-[24px] md:[&>*]:flex-1">
      {children}
    </div>
  );
}

/**
 * Screenshot with an optional label above and caption below. Without `src` it
 * shows a placeholder named after the label.
 */
export function Figure({
  label,
  caption,
  src,
  alt,
  aspect = "aspect-[16/10]",
}: {
  label?: string;
  caption?: React.ReactNode;
  src?: string;
  alt?: string;
  aspect?: string;
}) {
  return (
    <figure className="m-0 min-w-0">
      {label && (
        <p className="mb-[12px] font-body text-[12px] font-medium leading-[16px] text-heading">{label}</p>
      )}
      <div className="overflow-hidden rounded-[4px] bg-grape-light/40 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.03)]">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt ?? label ?? ""} className="block h-auto w-full" />
        ) : (
          <ImagePlaceholder label={label ?? "Image"} aspect={aspect} />
        )}
      </div>
      {caption && (
        <figcaption className="mt-[14px] font-body text-[14px] leading-[22px] text-muted [text-wrap:pretty]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export function Quote({
  children,
  name,
  role,
}: {
  children: React.ReactNode;
  name: string;
  role?: string;
}) {
  return (
    <blockquote className="mx-0 mb-0 mt-[36px] border-l-2 border-grape/40 pl-[24px]">
      <p className="font-heading text-[20px] leading-[30px] text-heading md:text-[24px] md:leading-[34px]">
        &ldquo;{children}&rdquo;
      </p>
      <footer className="mt-[20px] font-body text-[14px] font-medium leading-[20px] text-heading">
        {name}
        {role && <span className="mt-[4px] block font-normal text-muted">{role}</span>}
      </footer>
    </blockquote>
  );
}

/**
 * Headline result: a big number, what it measures, and optional supporting
 * stats in two columns underneath.
 */
export function Outcome({
  metric,
  title,
  children,
  stats,
}: {
  metric: string;
  title: string;
  children?: React.ReactNode;
  stats?: { value: string; label: string }[];
}) {
  return (
    <div className="mb-[28px] mt-[44px] rounded-[8px] bg-grape-light p-[24px] md:p-[32px]">
      <p className="font-heading text-[64px] leading-[64px] tracking-[-4px] text-heading md:text-[80px] md:leading-[80px]">
        {metric}
      </p>
      <h3 className="my-[14px] font-body text-[18px] font-medium leading-[26px] text-heading">{title}</h3>
      {children && <div className="cs-copy">{children}</div>}
      {stats && (
        <div className="mt-[24px] grid grid-cols-1 gap-[24px] border-t border-grape/20 pt-[24px] md:grid-cols-2">
          {stats.map(({ value, label }) => (
            <div key={value}>
              <span className="whitespace-nowrap font-heading text-[28px] leading-[34px] text-heading">{value}</span>
              <p className="mt-[8px] font-body text-[14px] leading-[22px] text-secondary">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
