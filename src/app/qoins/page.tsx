"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

/**
 * Qoins route — native port of the standalone Qoins prototype
 * (originally /public/qoins). Ported into the app so it shares the
 * global chrome and a single scroll context:
 *
 *   • The blue "Your Qoins" hero lives in the normal document flow, so
 *     it scrolls away under the sticky BrandBar (the BrandBar is the
 *     bar that stays fixed at the top — request 3) and animates in on
 *     mount as if the nav is expanding to make room (request 2).
 *   • The page fades in (request 1).
 *   • The BrandBar shows the Qoins balance next to the coin (request 4).
 *
 * The prototype's own (generically-named) CSS is fetched from
 * /qoins/styles.css and injected into a <style> only while this route
 * is mounted, so it can't leak into the rest of the app. url(...) refs
 * are rewritten to absolute /qoins/... paths, and the standalone body
 * background / font globals are neutralised.
 */

type SpinItem = {
  id: number;
  type: "spins";
  count: number;
  title: string;
  game: string;
  img: string;
};
type AvatarItem = {
  id: number;
  type: "avatar";
  title: string;
  img: string;
  active: boolean;
};
type CollectionEntry = SpinItem | AvatarItem;

type Offer = {
  img: string;
  hoverImg?: string;
  avatar?: boolean;
  type: "spins" | "avatar";
  count?: number;
  game?: string;
  title: string;
  desc: string;
  cost: number;
  /** Card image-area background — set to the item art's own bg colour
   *  so the contained avatar blends into the card. */
  bg?: string;
};

type Toast = { title: string; msg?: string };

// Fixed look/values (the standalone prototype exposed these via a dev
// "Tweaks" panel; we bake in its defaults here).
const ACCENT = "#f67ad9";
const CLAIM_AMOUNT = 5;
const START_BALANCE = 87;

const A = (p: string) => `/qoins/assets/${p}`;

/* Play icon — same white triangle used by the Rewards page play
   button. */
function PlayIcon() {
  return (
    <svg
      aria-hidden
      width={12}
      height={13}
      viewBox="0 0 12 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ marginLeft: 1 }}
    >
      <path
        d="M8.9961 3.58413C9.5137 3.89467 9.9551 4.15949 10.2865 4.40205C10.6234 4.64864 10.9659 4.95424 11.1568 5.39073C11.4207 5.99436 11.4207 6.68075 11.1568 7.28438C10.9659 7.72087 10.6234 8.02647 10.2865 8.27306C9.9551 8.51562 9.51369 8.78045 8.99609 9.09099L4.86462 11.5699C4.31924 11.8971 3.85669 12.1747 3.47109 12.3604C3.08209 12.5478 2.63415 12.7131 2.14427 12.6674C1.47176 12.6048 0.858204 12.2574 0.458451 11.7129C0.167254 11.3164 0.0785189 10.8472 0.0390693 10.4172C-3.44493e-05 9.99104 -1.86407e-05 9.45162 0 8.8156V8.81556V3.85956V3.85951C-1.86407e-05 3.2235 -3.44478e-05 2.68408 0.0390693 2.25787C0.0785189 1.82789 0.167254 1.35874 0.458451 0.962164C0.858204 0.41775 1.47176 0.0703587 2.14427 0.00767219C2.63415 -0.0379914 3.08209 0.127295 3.47109 0.314689C3.85669 0.500444 4.31924 0.777994 4.86462 1.10525L8.9961 3.58413Z"
        fill="white"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="check"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12.5l4.5 4.5L19 6.5" />
    </svg>
  );
}

/* ---------- celebration fx — coins arc from the claim button up to
   the Qoins pill in the BrandBar (.qoins-pill, rendered by BrandBar on
   this route) ---------- */
function celebrate(layer: HTMLElement | null, btnRect: DOMRect | null) {
  if (!layer || !btnRect) return;
  const f = layer.getBoundingClientRect();
  const o = {
    x: btnRect.left + btnRect.width / 2 - f.left,
    y: btnRect.top + btnRect.height / 2 - f.top,
  };
  // The fly-to-wallet target is the Qoins coin pill in the BrandBar.
  // It's tagged with data-qoins-pill (not the .qoins-pill class) so the
  // prototype's own styles don't restyle the app's BrandBar pill.
  const pill = document.querySelector<HTMLElement>("[data-qoins-pill]");
  let w = { x: o.x, y: o.y - 200 };
  if (pill) {
    const pr = pill.getBoundingClientRect();
    w = { x: pr.left + pr.width / 2 - f.left, y: pr.top + pr.height / 2 - f.top };
  }
  const popPill = () =>
    pill &&
    pill.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.22)" }, { transform: "scale(1)" }],
      { duration: 340, easing: "cubic-bezier(.34,1.56,.64,1)" },
    );

  const heroCoin = document.querySelector<HTMLElement>(".hero-coin");
  if (heroCoin)
    heroCoin.animate(
      [
        { transform: "rotate(0deg) scale(1)" },
        { transform: "rotate(-7deg) scale(1.04)" },
        { transform: "rotate(6deg) scale(1.04)" },
        { transform: "rotate(-5deg) scale(1.02)" },
        { transform: "rotate(4deg) scale(1.02)" },
        { transform: "rotate(0deg) scale(1)" },
      ],
      { duration: 560, iterations: 2, easing: "ease-in-out" },
    );

  const N = 16;
  for (let i = 0; i < N; i++) {
    const el = document.createElement("img");
    el.className = "fx-coin";
    el.src = A("qoin.png");
    const size = 24 + Math.random() * 12;
    el.style.width = el.style.height = size + "px";
    el.style.left = o.x + "px";
    el.style.top = o.y + "px";
    layer.appendChild(el);
    const liftX = (Math.random() - 0.5) * 100;
    const liftY = -50 - Math.random() * 70;
    const delay = 60 + i * 45;
    el.animate(
      [
        { transform: "translate(-50%,-50%) translate(0,0) scale(.4)", opacity: 0, offset: 0 },
        { transform: `translate(-50%,-50%) translate(${liftX}px,${liftY}px) scale(1)`, opacity: 1, offset: 0.34 },
        { transform: `translate(-50%,-50%) translate(${w.x - o.x}px,${w.y - o.y}px) scale(.4)`, opacity: 1, offset: 1 },
      ],
      { duration: 640, delay, easing: "cubic-bezier(.5,0,.4,1)", fill: "backwards" },
    ).onfinish = () => {
      el.remove();
      popPill();
    };
  }
  setTimeout(() => {
    if (pill) {
      pill.classList.add("pill-glow");
      setTimeout(() => pill.classList.remove("pill-glow"), 700);
    }
  }, 60 + N * 45 + 640);
}

/* ---------- offer card ---------- */
function OfferCard({
  img,
  hoverImg,
  avatar,
  title,
  desc,
  cost,
  bg,
  affordable = true,
  bestValue = false,
  purchased = false,
  removed = false,
  onRedeem,
  onRemove,
  onAdd,
}: {
  img: string;
  hoverImg?: string;
  avatar?: boolean;
  title: string;
  desc: string;
  cost: number;
  bg?: string;
  affordable?: boolean;
  bestValue?: boolean;
  purchased?: boolean;
  removed?: boolean;
  onRedeem?: () => void;
  onRemove?: () => void;
  onAdd?: () => void;
}) {
  return (
    <div className={"offer" + (bestValue ? " is-best" : "")}>
      {bestValue && <span className="offer-flag">Best value</span>}
      {hoverImg ? (
        <div className="offer-img avatar-bg offer-img-swap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="oi oi-base" src={img} alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={"oi oi-top" + (purchased ? " on" : "")} src={hoverImg} alt="" />
        </div>
      ) : (
        <div
          className={"offer-img" + (avatar ? " avatar-bg" : "")}
          style={{ backgroundImage: `url(${img})`, backgroundColor: bg }}
        />
      )}
      <div className="offer-body">
        <div className="offer-title">{title}</div>
        {purchased || removed ? (
          <p className="offer-desc owned-text">
            <CheckIcon />
            Purchased
          </p>
        ) : (
          <p className="offer-desc">{desc}</p>
        )}
        {purchased ? (
          <button className="cost-btn remove-btn" onClick={onRemove}>
            Remove
          </button>
        ) : removed ? (
          <button className="cost-btn" onClick={onAdd}>
            Add
          </button>
        ) : (
          <button className="cost-btn" onClick={onRedeem} disabled={!affordable} aria-disabled={!affordable}>
            <span className="coin" />
            {cost}
          </button>
        )}
      </div>
    </div>
  );
}

/* Gift icon (Figma 27531:207390) — filled glyph, inherits the icon
   container's colour via currentColor. */
function GiftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <g clipPath="url(#qgift)">
        <path d="M1.83341 13V8.33334C1.83341 7.87311 2.20651 7.50001 2.66675 7.50001C3.12699 7.50001 3.50008 7.87311 3.50008 8.33334V13C3.50008 13.2762 3.72394 13.5 4.00008 13.5H12.0001C12.2762 13.5 12.5001 13.2762 12.5001 13V8.33334C12.5001 7.87311 12.8732 7.50001 13.3334 7.50001C13.7937 7.50001 14.1667 7.87311 14.1667 8.33334V13C14.1667 14.1966 13.1967 15.1667 12.0001 15.1667H4.00008C2.80346 15.1667 1.83341 14.1966 1.83341 13Z" />
        <path d="M13.8333 6.33333C13.8333 6.05719 13.6094 5.83333 13.3333 5.83333H2.66659C2.39044 5.83333 2.16659 6.05719 2.16659 6.33333V7C2.16659 7.27614 2.39061 7.50001 2.66675 7.50001H13.3334C13.6096 7.50001 13.8333 7.27614 13.8333 7V6.33333ZM15.4999 7C15.4999 8.19662 14.5299 9.16667 13.3333 9.16667H2.66659C1.46997 9.16667 0.499919 8.19662 0.499919 7V6.33333C0.499919 5.13672 1.46997 4.16667 2.66659 4.16667H13.3333C14.5299 4.16667 15.4999 5.13672 15.4999 6.33333V7Z" />
        <path d="M7.16667 14.3333V5C7.16667 4.53976 7.53976 4.16667 8 4.16667C8.46024 4.16667 8.83333 4.53976 8.83333 5V14.3333C8.83333 14.7936 8.46024 15.1667 8 15.1667C7.53976 15.1667 7.16667 14.7936 7.16667 14.3333Z" />
        <path d="M4.99992 0.833323C6.63 0.833323 7.59828 2.00961 8.10539 2.93163C8.36858 3.41017 8.54385 3.88137 8.65356 4.22785C8.70887 4.40251 8.74896 4.54955 8.77531 4.65494C8.78847 4.7076 8.79839 4.75048 8.80526 4.78124C8.80867 4.79651 8.81111 4.80908 8.81307 4.81835C8.81404 4.82295 8.81505 4.82702 8.81567 4.83007C8.81597 4.83149 8.81611 4.83291 8.81633 4.83397L8.81698 4.83528C8.81704 4.83557 8.81707 4.83656 7.99992 4.99999L8.81698 4.83658C8.86594 5.08139 8.80273 5.33556 8.64445 5.52864C8.48617 5.72162 8.24951 5.83332 7.99992 5.83332H4.99992C4.33688 5.83332 3.70118 5.56974 3.23234 5.1009C2.79274 4.6613 2.53377 4.07502 2.50317 3.45702L2.49992 3.33332C2.49992 2.67028 2.7635 2.03459 3.23234 1.56575C3.70118 1.0969 4.33688 0.833323 4.99992 0.833323ZM4.17049 3.41601C4.18949 3.60666 4.27405 3.78584 4.41073 3.92252C4.56701 4.0788 4.77891 4.16666 4.99992 4.16666H6.85343C6.79266 4.02579 6.72392 3.87952 6.64445 3.73502C6.2349 2.9904 5.70315 2.49999 4.99992 2.49999C4.77891 2.49999 4.56701 2.58785 4.41073 2.74413C4.25445 2.90041 4.16659 3.11231 4.16659 3.33332L4.17049 3.41601Z" />
        <path d="M11.8333 3.33332C11.8333 3.11231 11.7455 2.90041 11.5892 2.74413C11.4329 2.58785 11.221 2.49999 11 2.49999C10.2968 2.49999 9.76502 2.9904 9.35547 3.73502C9.27599 3.87952 9.20726 4.02579 9.14648 4.16666H11C11.221 4.16666 11.4329 4.0788 11.5892 3.92252C11.7455 3.76624 11.8333 3.55434 11.8333 3.33332ZM13.5 3.33332C13.5 3.99636 13.2364 4.63206 12.7676 5.1009C12.328 5.5405 11.7417 5.79947 11.1237 5.83007L11 5.83332H7.99992C7.75032 5.83332 7.51375 5.72162 7.35547 5.52864C7.19719 5.33556 7.13398 5.08139 7.18294 4.83658L7.99992 4.99999C7.18277 4.83656 7.18288 4.83687 7.18294 4.83658V4.83528L7.18359 4.83397C7.18381 4.83291 7.18395 4.83149 7.18425 4.83007C7.18487 4.82702 7.18588 4.82295 7.18685 4.81835C7.18881 4.80908 7.19125 4.79651 7.19466 4.78124C7.20153 4.75048 7.21145 4.7076 7.22461 4.65494C7.25096 4.54955 7.29105 4.40251 7.34635 4.22785C7.45607 3.88137 7.63134 3.41017 7.89453 2.93163C8.40164 2.00961 9.36992 0.833323 11 0.833323C11.663 0.833323 12.2987 1.0969 12.7676 1.56575C13.2364 2.03459 13.5 2.67028 13.5 3.33332Z" />
      </g>
      <defs>
        <clipPath id="qgift">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

/* ---------- how Qoins works — swipeable carousel ---------- */
type HowItem = { title: string; text: string; icon?: React.ReactNode; el?: React.ReactNode };
const HOW_ITEMS: HowItem[] = [
  {
    title: "Claim daily",
    text: "Tap claim every day and watch your Qoins stack up fast.",
    el: <GiftIcon />,
  },
  {
    title: "Spend in the Q Shop",
    text: "Swap your Qoins for free spins, games and avatar gear.",
    icon: <path d="M3 9l1.5-4.5h15L21 9M3 9v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9M3 9h18M9 13h6" />,
  },
  {
    title: "No wagering, ever",
    text: "Spend Qoins, keep what you win. No fine-print gotchas.",
    icon: <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3zM9 12l2 2 4-4" />,
  },
  {
    title: "Play to earn more",
    text: "Free-to-play games like Heads or Tails grow your pot.",
    icon: <path d="M5 5l14 7-14 7V5z" />,
  },
];

function HowQoinsWorks({ onClose, closing }: { onClose: () => void; closing: boolean }) {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };
  const goTo = (i: number) => {
    const el = ref.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };
  return (
    <div className={"how how-lead" + (closing ? " how-closing" : "")}>
      <div className="how-top">
        <h2 className="section-title">How Qoins works</h2>
        <button className="how-close" aria-label="Dismiss" onClick={onClose}>
          Dismiss
        </button>
      </div>
      <div className="how-rail" ref={ref} onScroll={onScroll}>
        {HOW_ITEMS.map((it, i) => (
          <div className="how-card" key={i}>
            <div className="how-inner">
              <div className="how-head">
                <span className="how-icon">
                  {it.el ?? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      {it.icon}
                    </svg>
                  )}
                </span>
                <div className="how-h">{it.title}</div>
              </div>
              <p className="how-p">{it.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="dots">
        {HOW_ITEMS.map((_, i) => (
          <span
            key={i}
            className={"dot" + (i === active ? " active" : "")}
            onClick={() => goTo(i)}
            role="button"
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function QoinsPage() {
  // Inject the prototype's stylesheet (mount-only so it never leaks).
  const [styled, setStyled] = useState(false);
  useEffect(() => {
    let styleEl: HTMLStyleElement | null = null;
    let cancelled = false;
    fetch("/qoins/styles.css", { cache: "no-cache" })
      .then((r) => r.text())
      .then((css) => {
        if (cancelled) return;
        const fixed = css
          // url('./x') / url("./x") / url(./x) → absolute /qoins/x
          .replace(/url\((['"]?)\.\//g, "url($1/qoins/")
          // neutralise the standalone grey body/stage background
          .replace(/background:#d8dadf;/g, "background:transparent;")
          // keep the Gilroy font scoped to the Qoins root, not <body>
          .replace(/\nbody\{/g, "\n.qoins-root{");
        styleEl = document.createElement("style");
        styleEl.setAttribute("data-qoins", "");
        styleEl.textContent = fixed;
        document.head.appendChild(styleEl);
        setStyled(true);
      })
      .catch(() => setStyled(true));
    return () => {
      cancelled = true;
      if (styleEl) styleEl.remove();
    };
  }, []);

  const [balance, setBalance] = useState(START_BALANCE);
  const [display, setDisplay] = useState(START_BALANCE);
  const [claimed, setClaimed] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [collection, setCollection] = useState<CollectionEntry[]>([]);
  const [newSpin, setNewSpin] = useState<number | null>(null);
  const [howOpen, setHowOpen] = useState(true);
  const [howClosing, setHowClosing] = useState(false);
  const [intro, setIntro] = useState(true);

  const dismissHow = () => {
    setHowClosing(true);
    setTimeout(() => {
      setHowOpen(false);
      setHowClosing(false);
    }, 420);
  };

  useEffect(() => {
    const tm = setTimeout(() => setIntro(false), 1000);
    return () => clearTimeout(tm);
  }, []);

  // Lottie confetti — load lottie-web once, play the confetti file a
  // single time on demand.
  const confettiHostRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const w = window as unknown as { lottie?: unknown };
    if (w.lottie) return;
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js";
    s.async = true;
    document.body.appendChild(s);
  }, []);
  const fireConfetti = useCallback(() => {
    const w = window as unknown as {
      lottie?: { loadAnimation: (o: Record<string, unknown>) => { addEventListener: (e: string, cb: () => void) => void; destroy: () => void } };
    };
    const host = confettiHostRef.current;
    if (!w.lottie || !host) return;
    host.innerHTML = "";
    const anim = w.lottie.loadAnimation({
      container: host,
      renderer: "svg",
      loop: false,
      autoplay: true,
      path: "/qoins/assets/confetti.json",
    });
    anim.addEventListener("complete", () => {
      anim.destroy();
      if (host) host.innerHTML = "";
    });
  }, []);

  // Sentinel at the very top of the scrollable content — scrolled into
  // view on redeem. scrollIntoView walks up to whatever the real scroll
  // container is, so it's robust regardless of which element scrolls.
  const topRef = useRef<HTMLDivElement | null>(null);
  const scrollToTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const claimRef = useRef<HTMLButtonElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const fxRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const joyRef = useRef<HTMLAudioElement | null>(null);
  const collectedRef = useRef<HTMLAudioElement | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const countTo = useCallback((from: number, to: number, delay?: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const dur = 900;
    const start = performance.now() + (delay || 0);
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - start) / dur));
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const handleClaim = () => {
    if (claimed) return;
    if (joyRef.current && joyRef.current.paused) joyRef.current.play().catch(() => {});
    const next = balance + CLAIM_AMOUNT;
    setBalance(next);
    countTo(display, next, 500);
    setClaimed(true);
    if (heroRef.current) {
      heroRef.current.classList.remove("pop", "glow");
      void heroRef.current.offsetWidth;
      heroRef.current.classList.add("pop", "glow");
    }
    if (claimRef.current && fxRef.current) {
      celebrate(fxRef.current, claimRef.current.getBoundingClientRect());
    }
  };

  const showToast = (input: string | Toast) => {
    const data = typeof input === "string" ? { title: input } : input;
    setToast(data);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };

  const offers: Offer[] = [
    { img: "/assets/games/slot-01.png", type: "spins", count: 25, game: "Buffalo Bills", title: "25 Free Spins", desc: "Get 25 free Spins on Buffalo Bills", cost: 75 },
    { img: "/assets/games/thumb-04.png", type: "spins", count: 50, game: "The Dog House", title: "50 Free Spins", desc: "Get 50 free Spins on The Dog House", cost: 130 },
    { img: "/assets/games/thumb-03.png", type: "spins", count: 100, game: "Gates of Olympus", title: "100 Free Spins", desc: "Get 100 free Spins on Gates of Olympus", cost: 230 },
    { img: "/assets/games/wild-swarm.png", type: "spins", count: 200, game: "Wild Swarm", title: "200 Free Spins", desc: "Get 200 free Spins on Wild Swarm", cost: 440 },
    { img: "/assets/games/slot-03.png", type: "spins", count: 400, game: "Big Bass Splash", title: "400 Free Spins", desc: "Get 400 free Spins on Big Bass Splash", cost: 850 },
  ];
  const merch: Offer[] = [
    { img: A("hat-crown.png"), bg: "#f07ecc", avatar: true, type: "avatar", title: "Royal Crown", desc: "Rule the lobby with a sparkling crown for your avatar", cost: 50 },
    { img: A("hat-witch.png"), bg: "#9c66f6", avatar: true, type: "avatar", title: "Witch Hat", desc: "Cast a little magic with a spooky witch hat", cost: 30 },
    { img: A("hat-straw.png"), bg: "#84b4fc", avatar: true, type: "avatar", title: "Straw Hat", desc: "Beach-ready vibes with a breezy straw sun hat", cost: 25 },
    { img: A("hat-cowboy.png"), bg: "#fcd248", avatar: true, type: "avatar", title: "Cowboy Hat", desc: "Yeehaw! A pink cowboy hat for your avatar", cost: 35 },
    { img: A("hat-bucket.png"), bg: "#a2d8b4", avatar: true, type: "avatar", title: "Daisy Bucket Hat", desc: "Fresh and floral — a daisy-covered bucket hat", cost: 40 },
    { img: A("hat-cap.png"), bg: "#fc8a3c", avatar: true, type: "avatar", title: "Backwards Cap", desc: "Keep it casual with a backwards baseball cap", cost: 20 },
  ];

  const redeem = (offer: Offer) => {
    if (display < offer.cost) {
      showToast(`Need ${offer.cost - display} more Qoins for that`);
      return;
    }
    const next = balance - offer.cost;
    setBalance(next);
    countTo(display, next);

    // Avatar (merch) — added to the collection, no hero card. Keep the
    // simple toast confirmation.
    if (offer.type === "avatar") {
      const item: AvatarItem = { id: Date.now() + Math.random(), type: "avatar", title: offer.title, img: offer.img, active: true };
      setCollection((c) => [item, ...c]);
      if (collectedRef.current) {
        collectedRef.current.currentTime = 0;
        collectedRef.current.play().catch(() => {});
      }
      showToast({ title: "It's yours!", msg: `${offer.title} added to your avatar` });
      return;
    }

    // Free spins — the redeemed reward pops into the blue hero at the
    // very top, which is usually out of view. So scroll all the way up
    // first, THEN insert the card (so its pop animation is on screen)
    // and fire the confetti once.
    const item: SpinItem = {
      id: Date.now() + Math.random(),
      type: "spins",
      count: offer.count ?? 0,
      title: offer.title,
      game: offer.game ?? "",
      img: offer.img,
    };
    showToast({ title: "You've got free spins!", msg: `${offer.title} on ${offer.game}` });

    // Reveal the reward in the hero. Inserting it reflows the top of
    // the page, so do it ONLY once the scroll has finished — otherwise
    // the browser's scroll-anchoring cancels the in-flight scroll
    // partway (the "goes up a bit then stops" bug).
    const reveal = () => {
      setCollection((c) => [item, ...c]);
      setNewSpin(item.id);
      setTimeout(() => setNewSpin(null), 800);
      if (collectedRef.current) {
        collectedRef.current.currentTime = 0;
        collectedRef.current.play().catch(() => {});
      }
      fireConfetti();
    };

    scrollToTop();
    setTimeout(() => {
      reveal();
      // Re-assert the scroll after the card inserts so it still ends up
      // at the very top.
      scrollToTop();
    }, 480);
  };

  const playSpins = (item: SpinItem) => {
    showToast(`Loading ${item.game} — your ${item.count} spins are ready`);
  };
  const setMerchActive = (title: string, active: boolean) => {
    setCollection((c) =>
      c.map((it) => (it.type === "avatar" && it.title === title ? { ...it, active } : it)),
    );
    showToast(active ? `${title} added back` : `${title} removed`);
  };

  const spinsItems = collection.filter((c): c is SpinItem => c.type === "spins");

  return (
    <div
      className="qoins-root"
      style={{ opacity: styled ? 1 : 0, transition: "opacity 0.18s ease" }}
    >
      <div className="stage" style={{ "--accent": ACCENT } as React.CSSProperties}>
        <div className={"screen" + (intro ? " intro" : "")}>
          <div className="scroll">
            {/* scroll-to-top sentinel */}
            <div ref={topRef} aria-hidden style={{ position: "absolute", top: 0, height: 1, width: 1 }} />
            {/* ---------------- HEADER (blue) ----------------
                The prototype's own status bar + nav were dropped — the
                app's BrandBar provides that chrome. The blue header
                stays in normal flow so it scrolls away under the
                sticky BrandBar. */}
            <div className="header">
              <div className="hero-stack">
                <div className="hero-card">
                  <div className="hero-top">
                    <span className="coin hero-coin" />
                    <div className="hero-info">
                      <div className="hero-label">Your Qoins Balance</div>
                      <div className="hero-amount" ref={heroRef}>
                        {display}
                      </div>
                    </div>
                  </div>
                  <button
                    className="claim-btn"
                    ref={claimRef}
                    onPointerDown={() => {
                      if (!claimed && joyRef.current) joyRef.current.play().catch(() => {});
                    }}
                    onClick={handleClaim}
                    disabled={claimed}
                  >
                    {claimed ? (
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        <CheckIcon />
                        Claimed today
                      </span>
                    ) : (
                      `Claim Today's Qoins (+${CLAIM_AMOUNT})`
                    )}
                  </button>
                </div>

                {spinsItems.map((s) => (
                  <div className={"spins-card" + (s.id === newSpin ? " spins-enter" : "")} key={s.id}>
                    <div className="spins-thumb" style={{ backgroundImage: `url(${s.img})` }} />
                    <div className="spins-info">
                      <div className="spins-title">{s.count} Free Spins</div>
                      <div className="spins-sub">on {s.game}</div>
                    </div>
                    <button
                      type="button"
                      aria-label={`Play ${s.game}`}
                      onClick={() => playSpins(s)}
                      className="active:scale-[0.95] transition-transform"
                      style={{
                        flex: "none",
                        width: 32,
                        height: 32,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 9999,
                        border: 0,
                        cursor: "pointer",
                        backgroundColor: "var(--brand500)",
                      }}
                    >
                      <PlayIcon />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ---------------- BODY ---------------- */}
            <div className="body">
              {howOpen && <HowQoinsWorks closing={howClosing} onClose={dismissHow} />}

              <div className={"section" + (howOpen ? "" : " section-first")}>
                <h2 className="section-title">Free Spins</h2>
                <div className="rail">
                  {offers.map((o, i) => (
                    <OfferCard key={i} {...o} affordable={display >= o.cost} onRedeem={() => redeem(o)} />
                  ))}
                </div>
              </div>

              <div className="section">
                <h2 className="section-title">Q Free to Play Games</h2>
                <div className="bigcard">
                  <div className="bigcard-img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={A("heads-or-tails.png")} alt="Heads or Tails" />
                  </div>
                  <div className="bigcard-body">
                    <div className="offer-title">Heads or Tails</div>
                    <p className="offer-desc">
                      Play Heads or Tails game to be in with a chance to double your pot of Qoins!
                    </p>
                    <button
                      className="play-btn"
                      onClick={() => display >= 10 && showToast("Loading Heads or Tails — good luck!")}
                      disabled={display < 10}
                      aria-disabled={display < 10}
                    >
                      <span className="play-label">Play Now</span>
                      <span className="play-cost">
                        <span className="coin" />
                        10
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="section">
                <h2 className="section-title">MrQ Digital Merch</h2>
                <div className="rail">
                  {merch.map((o) => {
                    const item = collection.find(
                      (c): c is AvatarItem => c.type === "avatar" && c.title === o.title,
                    );
                    return (
                      <OfferCard
                        key={o.title}
                        {...o}
                        affordable={display >= o.cost}
                        purchased={!!item && item.active}
                        removed={!!item && !item.active}
                        onRedeem={() => redeem(o)}
                        onRemove={() => setMerchActive(o.title, false)}
                        onAdd={() => setMerchActive(o.title, true)}
                      />
                    );
                  })}
                </div>
              </div>

              <p className="legal">
                Qoins have no cash value and can&apos;t be withdrawn. Rewards subject to availability. 18+.{" "}
                <span className="legal-link">Full T&amp;Cs</span>.
              </p>
            </div>
          </div>

          {toast && (
            <div className="qtoast" role="status">
              <span className="qtoast-avatar">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={A("avatar-nav.png")} alt="" />
              </span>
              <span className="qtoast-text">
                <span className="qtoast-title">{toast.title}</span>
                {toast.msg && <span className="qtoast-sub">{toast.msg}</span>}
              </span>
            </div>
          )}
        </div>

        {/* fx layer (fixed, viewport) */}
        <div className="fx-layer" ref={fxRef} />

        {/* Confetti overlay — Lottie plays once on a free-spins redeem.
            Clamped to the mobile-frame column and non-interactive. */}
        <div
          ref={confettiHostRef}
          aria-hidden
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: "var(--frame-right-offset)",
            right: "var(--frame-right-offset)",
            pointerEvents: "none",
            zIndex: 60,
          }}
        />

        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio ref={joyRef} src={A("joy.mp3")} preload="auto" />
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio ref={collectedRef} src={A("collected.mp3")} preload="auto" />
      </div>
    </div>
  );
}
