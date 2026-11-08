"use client";

// Paper tooth for the blackcurrant bands (the guestbook and the footer), as on the
// taste-note mailers: a small tile of per-pixel grain made once and repeated. Here it's
// pale specks over the dark, so the band reads as a surface. Fills its nearest positioned
// parent; put the content above it.

import { useEffect, useState } from "react";

let toothTile: string | null = null;
function tooth() {
  if (toothTile) return toothTile;
  const size = 160;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    img.data[i] = 249;
    img.data[i + 1] = 228;
    img.data[i + 2] = 255;
    img.data[i + 3] = Math.random() < 0.5 ? Math.random() * 22 : 0;
  }
  ctx.putImageData(img, 0, 0);
  toothTile = c.toDataURL();
  return toothTile;
}

export default function PaperTooth() {
  const [grain, setGrain] = useState("");
  useEffect(() => setGrain(tooth()), []);
  if (!grain) return null;
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ backgroundImage: `url(${grain})` }} />;
}
