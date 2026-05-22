"use client";

import { useEffect, useRef } from "react";

/**
 * Make a horizontally-scrollable container draggable with the mouse, with
 * iOS-style momentum/inertia on release. Touch scrolling stays native.
 *
 * Usage:
 *   const railRef = useDraggableScroll<HTMLDivElement>();
 *   <div ref={railRef} className="overflow-x-auto ...">{tiles}</div>
 *
 * Implementation notes:
 *   - Velocity is sampled from the last ~80ms of pointer moves so a quick
 *     flick produces strong inertia and a slow drag produces none.
 *   - Inertia decays exponentially (~0.93 per frame) and stops below 0.4 px/frame.
 *   - A fresh pointerdown cancels any in-flight inertia animation.
 *   - If the drag actually moved >3px, the next click event inside the rail
 *     is swallowed so dragging across a tile doesn't fire its click handler.
 */
export function useDraggableScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    let hasMoved = false;
    // Recent moves used to estimate release velocity.
    let samples: { x: number; t: number }[] = [];
    let inertiaRaf: number | null = null;

    const cancelInertia = () => {
      if (inertiaRaf !== null) {
        cancelAnimationFrame(inertiaRaf);
        inertiaRaf = null;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return; // touch uses native scrolling
      if ((e.target as HTMLElement).closest("a")) return;
      cancelInertia();
      dragging = true;
      hasMoved = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      samples = [{ x: e.clientX, t: performance.now() }];
      el.style.cursor = "grabbing";
      el.style.userSelect = "none";
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) hasMoved = true;
      el.scrollLeft = startScroll - dx;

      const now = performance.now();
      samples.push({ x: e.clientX, t: now });
      // Keep only samples from the last 80ms — anything older is stale data.
      while (samples.length > 1 && now - samples[0].t > 80) {
        samples.shift();
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      el.style.cursor = "grab";
      el.style.userSelect = "";
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }

      if (hasMoved) {
        // Swallow the click that would otherwise fire on the tile under the
        // pointer at release.
        const stopClick = (ev: MouseEvent) => {
          ev.preventDefault();
          ev.stopPropagation();
          el.removeEventListener("click", stopClick, true);
        };
        el.addEventListener("click", stopClick, true);
      }

      // Compute release velocity from the samples and kick off inertia.
      if (samples.length >= 2) {
        const first = samples[0];
        const last = samples[samples.length - 1];
        const dt = last.t - first.t;
        if (dt > 0) {
          // px per ms → px per 16ms frame.
          const vPerFrame = ((last.x - first.x) / dt) * 16;
          if (Math.abs(vPerFrame) > 1) {
            let v = vPerFrame;
            const decay = 0.93;
            const step = () => {
              el.scrollLeft -= v;
              v *= decay;
              if (Math.abs(v) > 0.4) {
                inertiaRaf = requestAnimationFrame(step);
              } else {
                inertiaRaf = null;
              }
            };
            inertiaRaf = requestAnimationFrame(step);
          }
        }
      }
    };

    el.style.cursor = "grab";
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);

    return () => {
      cancelInertia();
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return ref;
}
