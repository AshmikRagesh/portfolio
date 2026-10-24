"use client";

import { useEffect, useState } from "react";

/** True on screens with no hover (phones, tablets) — they get tap-to-toggle instead. */
export function useTouchScreen() {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(hover: none)");
    const update = () => setTouch(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return touch;
}
