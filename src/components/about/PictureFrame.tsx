import Image from "next/image";

// A carved rococo frame in worn gilt over a grape patina — "Im Feld Kunst Rahmen" from
// Pixabay (illustration 9701647, free under the Pixabay Content License), trimmed, its
// teal patina recoloured to grape, and saved as WebP. Its middle is already transparent;
// FRAME.open is that window, in the image's own pixels.

export const FRAME = {
  w: 853,
  h: 1236,
  open: [123, 134, 729, 1097] as const, // x0, y0, x1, y1
  edge: 24, // the carving's solid face starts about this far in from the image's edge
};

export default function PictureFrame({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/images/about/frame-gilt-grape.webp"
      alt=""
      aria-hidden="true"
      width={FRAME.w}
      height={FRAME.h}
      priority
      unoptimized // already a compressed WebP, and the optimizer must not drop its transparency
      draggable={false}
      sizes="(min-width: 1024px) 440px, 400px"
      className={className}
    />
  );
}
