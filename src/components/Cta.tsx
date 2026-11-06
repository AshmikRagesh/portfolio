import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * The site's one call-to-action: a blackcurrant pill that turns grape on hover while a
 * matching arrow circle slides out beside it (styles: .work-cta in globals.css). Every
 * CTA uses it, so there is only one button type.
 *
 * - `CtaPill` is just the pill, for when the whole card around it is the link (that
 *   parent needs the `group` class, as the hover is driven from it).
 * - `Cta` is the pill as its own link (`href`, opening in a new tab when `external`) or
 *   button (`onClick` / `type="submit"`).
 *
 * `size="sm"` for CTAs inside cards and dialogs. `dark` for midnight surfaces: a white
 * pill with midnight text, still turning grape on hover. `off` greys it out (NDA work).
 */
type Look = { size?: "md" | "sm"; dark?: boolean; off?: boolean };

export function CtaPill({ children, size = "md", dark, off }: Look & { children: React.ReactNode }) {
  const cls = [
    "work-cta font-geist font-medium",
    size === "sm" ? "work-cta--sm text-[14px] leading-[20px]" : "text-[16px] leading-[24px]",
    dark && "work-cta--dark",
    off && "work-cta--off",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={cls} aria-disabled={off || undefined}>
      <span className="work-cta__inner">{children}</span>
      {!off && (
        <span aria-hidden="true" className="work-cta__circle">
          <span>
            <ArrowUpRight size={size === "sm" ? 16 : 18} strokeWidth={2} />
          </span>
        </span>
      )}
    </span>
  );
}

type CtaProps = Look & {
  children: React.ReactNode;
  className?: string;
} & (
    | { href: string; external?: boolean; onClick?: never; type?: never }
    | { href?: never; external?: never; onClick?: () => void; type?: "button" | "submit" }
  );

const FOCUS =
  "group inline-flex self-start rounded-full outline-none focus-visible:ring-2 focus-visible:ring-grape focus-visible:ring-offset-2";

export default function Cta({ children, className = "", href, external, onClick, type = "button", ...look }: CtaProps) {
  const pill = <CtaPill {...look}>{children}</CtaPill>;
  const cls = `${FOCUS} ${className}`;
  if (href && external)
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {pill}
      </a>
    );
  if (href)
    return (
      <Link href={href} className={cls}>
        {pill}
      </Link>
    );
  return (
    <button type={type} onClick={onClick} className={cls}>
      {pill}
    </button>
  );
}
