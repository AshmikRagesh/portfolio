import { featuredWorks } from "@/content/works";
import PreviewLink from "./PreviewLink";

const HELIX = featuredWorks.find((w) => w.href === "/works/helix")!;

/**
 * "Helix on Claude Code", linked to the Helix case study. The hover card shows the case
 * study's own title, line and cover, straight from the works list, so it never drifts.
 */
export default function HelixLink() {
  return (
    <PreviewLink
      href={HELIX.href}
      preview={{ tag: HELIX.discipline, title: HELIX.title, description: HELIX.description, image: HELIX.image }}
    >
      Helix on Claude Code
    </PreviewLink>
  );
}
