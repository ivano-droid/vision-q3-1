"use client";

/**
 * Hero promo cards — composed in React rather than imported as flat
 * PNGs.
 *
 * The Figma cards (node 160:22811) are dense multi-layer compositions
 * (one BIG WEEKENDER card alone has 130+ vector paths). Extracting a
 * single clean PNG from each isn't possible via the dev-mode MCP, so
 * we recompose the look here: the actual character photo asset from
 * the Figma file lives in `/public/assets/hero/photo-character.png`,
 * and everything else (background, outlined text, crown sticker,
 * flames) is built with CSS / inline SVG.
 *
 * Both cards render at the same 3:2 landscape aspect inside the
 * HeroCarousel snap rail, so they line up cleanly side-by-side.
 */

export function BigWeekenderCard() {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[16px]"
      style={{
        // Deep navy with a soft radial lift in the upper-right — gives
        // the card a subtle "spotlight" feel, matching the Figma art.
        background:
          "radial-gradient(120% 100% at 80% 10%, #1a3eeb 0%, #0a2ecb 40%, #061a8a 100%)",
        boxShadow: "0 8px 24px -10px rgba(10, 46, 203, 0.35)",
      }}
    >
      {/* Faint radial sunburst lines — recreated with conic gradient.
          Low opacity so it sits behind the character + text. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.06) 0deg, rgba(255,255,255,0) 5deg, rgba(255,255,255,0.06) 10deg, rgba(255,255,255,0) 15deg, rgba(255,255,255,0.06) 20deg, rgba(255,255,255,0) 25deg, rgba(255,255,255,0.06) 30deg, rgba(255,255,255,0) 35deg)",
          mixBlendMode: "screen",
          opacity: 0.6,
        }}
        aria-hidden
      />

      {/* Character photo — anchored bottom-left so the figure stands
          on the bottom edge of the card. The Figma source already
          has the character on a transparent cutout. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/hero/photo-character.png"
        alt=""
        className="absolute pointer-events-none select-none"
        style={{
          left: "-4%",
          bottom: "-2%",
          height: "112%",
          width: "auto",
        }}
        draggable={false}
        aria-hidden
      />

      {/* Outlined "BIG WEEKENDER" text — Anton font, yellow fill,
          chunky white stroke, paint-order: stroke fill so the
          stroke sits BEHIND the fill (otherwise the fill is eaten
          by the stroke width). */}
      <div
        className="absolute pointer-events-none"
        style={{ left: "38%", top: "14%", right: "8%" }}
      >
        <p
          className="leading-[0.85]"
          style={{
            fontFamily: "var(--font-headline)",
            fontSize: "30px",
            color: "#ffd400",
            WebkitTextStroke: "2.5px #ffffff",
            paintOrder: "stroke fill",
            letterSpacing: "0.5px",
            textShadow: "0 3px 0 rgba(0, 0, 0, 0.18)",
          }}
        >
          BIG
          <br />
          WEEKENDER
        </p>
        <p
          className="mt-[6px] text-white"
          style={{
            fontFamily: "var(--font-headline)",
            fontSize: "13px",
            letterSpacing: "0.4px",
          }}
        >
          is back again!
        </p>
      </div>

      {/* Yellow crown sticker on the right, tilted. Sourced from the
          Figma asset PNG. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/hero/sticker-crown.png"
        alt=""
        className="absolute pointer-events-none select-none"
        style={{
          right: "4%",
          top: "10%",
          width: "26%",
          transform: "rotate(-6deg)",
        }}
        draggable={false}
        aria-hidden
      />
    </div>
  );
}

export function GetSpicyCard() {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[16px]"
      style={{
        // Blue at top fading to red/orange at the bottom — matches
        // the Figma art's "spicy / heat" gradient.
        background:
          "linear-gradient(180deg, #0a2ecb 0%, #0a2ecb 45%, #ff5a1f 90%, #ff8a3d 100%)",
        boxShadow: "0 8px 24px -10px rgba(10, 46, 203, 0.35)",
      }}
    >
      {/* Stylised flame silhouette across the bottom — pure SVG so it
          scales with the card. */}
      <svg
        className="absolute inset-x-0 bottom-0 w-full pointer-events-none"
        viewBox="0 0 303 60"
        preserveAspectRatio="none"
        aria-hidden
        style={{ height: "55%" }}
      >
        <path
          d="M0 60 L0 38 Q12 18 22 30 Q30 8 42 24 Q52 4 64 22 Q74 12 84 30 Q94 6 108 22 Q118 14 128 28 Q140 8 152 24 Q164 12 176 30 Q186 8 198 22 Q210 14 222 28 Q232 6 244 22 Q256 14 268 30 Q280 18 292 24 L303 38 L303 60 Z"
          fill="#ffb24a"
          opacity="0.85"
        />
        <path
          d="M0 60 L0 48 Q14 28 24 42 Q34 22 46 38 Q58 26 70 42 Q80 22 92 38 Q104 30 116 44 Q128 26 140 40 Q152 30 164 44 Q176 26 188 40 Q200 30 212 44 Q224 26 236 40 Q248 30 260 44 Q272 30 284 42 Q294 36 303 48 L303 60 Z"
          fill="#ff5a1f"
        />
      </svg>

      {/* Slot game tile centre-left — uses an existing slot asset
          since the Figma source is "Spicy Meatballs" branded and we
          don't have that exact tile. The deep red art reads as
          spicy/themed, blending into the bottom flame layer. */}
      <div
        className="absolute overflow-hidden rounded-[10px]"
        style={{
          left: "5%",
          top: "20%",
          width: "32%",
          aspectRatio: "1 / 1",
          boxShadow: "0 4px 12px -4px rgba(0, 0, 0, 0.45)",
          border: "2px solid rgba(255, 255, 255, 0.6)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/games/slot-13.png"
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
          aria-hidden
        />
      </div>

      {/* "PLAY NOW / GET SPICY" outlined text on the right. */}
      <div
        className="absolute pointer-events-none"
        style={{ left: "44%", top: "18%", right: "5%" }}
      >
        <p
          className="text-white"
          style={{
            fontFamily: "var(--font-headline)",
            fontSize: "14px",
            letterSpacing: "0.5px",
            textShadow: "0 2px 0 rgba(0, 0, 0, 0.25)",
          }}
        >
          PLAY NOW
        </p>
        <p
          className="mt-[2px] leading-[0.9]"
          style={{
            fontFamily: "var(--font-headline)",
            fontSize: "28px",
            color: "#ffffff",
            WebkitTextStroke: "1.5px rgba(0, 0, 0, 0.35)",
            paintOrder: "stroke fill",
            letterSpacing: "0.5px",
            textShadow: "0 3px 0 rgba(0, 0, 0, 0.25)",
          }}
        >
          GET SPICY
        </p>
      </div>
    </div>
  );
}
