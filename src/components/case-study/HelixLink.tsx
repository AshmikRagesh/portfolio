import { featuredWorks } from "@/content/works";
import PreviewLink from "./PreviewLink";

const HELIX = featuredWorks.find((w) => w.href === "/works/helix")!;

/**
 * "Helix on Claude Code", linked to the Helix case study. The hover card shows the case
 * study's own title and cover, straight from the works list, so it never drifts.
 */
export default function HelixLink() {
  return (
    <PreviewLink
      href={HELIX.href}
      preview={{ title: HELIX.title, image: HELIX.image }}
    >
      Helix on Claude Code
    </PreviewLink>
  );
}
