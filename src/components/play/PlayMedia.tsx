import type { PlayItem } from "@/content/play";

/** The image or video for a piece; nothing for a grey placeholder. */
export default function PlayMedia({ item, eager = false }: { item: PlayItem; eager?: boolean }) {
  if (item.video)
    return <video className="play-media" src={item.video} autoPlay muted loop playsInline preload={eager ? "auto" : "metadata"} aria-hidden="true" />;
  if (item.src)
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="play-media" src={item.src} alt="" loading={eager ? "eager" : "lazy"} draggable={false} />;
  return null;
}
