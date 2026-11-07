import Link from "next/link";
import { Tag } from "@/components/Tag";

// An inline phrase that names the work it's about only when you look: hover (or focus)
// and a small grape tag springs up off the word, like a sticker peeled half up. The
// phrase links to the case study.
export default function Peek({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group/peek relative inline-block text-heading outline-none">
      <span className="underline decoration-grape/50 decoration-dotted decoration-[1.5px] underline-offset-[4px] transition-colors duration-200 group-focus-visible/peek:decoration-solid [@media(hover:hover)]:group-hover/peek:text-grape [@media(hover:hover)]:group-hover/peek:decoration-solid">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-full left-[8px] mb-[4px] origin-bottom-left translate-y-[8px] -rotate-[8deg] scale-75 opacity-0 transition-[opacity,transform] duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] group-focus-visible/peek:translate-y-0 group-focus-visible/peek:-rotate-[3deg] group-focus-visible/peek:scale-100 group-focus-visible/peek:opacity-100 [@media(hover:hover)]:group-hover/peek:translate-y-0 [@media(hover:hover)]:group-hover/peek:-rotate-[3deg] [@media(hover:hover)]:group-hover/peek:scale-100 [@media(hover:hover)]:group-hover/peek:opacity-100"
      >
        <span className="block shadow-[0_4px_10px_rgba(157,19,106,0.28)] rounded-full">
          <Tag tone="grape" face="geist">
            {label} <span className="text-[12px] leading-[16px]">↗</span>
          </Tag>
        </span>
      </span>
      <span className="sr-only"> ({label})</span>
    </Link>
  );
}
