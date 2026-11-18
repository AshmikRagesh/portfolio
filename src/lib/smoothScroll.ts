// One eased, time-based scroll for every device. Native `behavior: "smooth"` is left to
// each browser: on phones it's short, uneven or ignored over long pages. This runs the
// same curve and duration everywhere, and gives way the moment the visitor touches or wheels.

let frame = 0;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function smoothScrollToElement(el: HTMLElement | null, reduce = false) {
  if (!el) return;
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const target = Math.max(0, Math.min(max, el.getBoundingClientRect().top + window.scrollY - margin));
  const from = window.scrollY;
  const distance = target - from;
  cancelAnimationFrame(frame);
  if (reduce || Math.abs(distance) < 2) {
    window.scrollTo(0, target);
    return;
  }

  const duration = Math.min(1100, Math.max(450, Math.abs(distance) * 0.35));
  const root = document.documentElement;
  const prev = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto"; // no native smoothing fighting each frame
  const stop = () => {
    cancelAnimationFrame(frame);
    root.style.scrollBehavior = prev;
    window.removeEventListener("touchstart", stop);
    window.removeEventListener("wheel", stop);
    window.removeEventListener("keydown", stop);
  };
  window.addEventListener("touchstart", stop, { passive: true });
  window.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("keydown", stop);

  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    window.scrollTo(0, from + distance * ease(t));
    if (t < 1) frame = requestAnimationFrame(step);
    else stop();
  };
  frame = requestAnimationFrame(step);
}
