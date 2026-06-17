/* global React, ReactDOM, useTweaks, TweaksPanel, TweakSection, TweakSlider, TweakColor, TweakRadio */
const { useState, useRef, useEffect, useCallback } = React;

/* ---------- icons ---------- */
const BackArrow = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 5l-7 7 7 7" />
  </svg>
);
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
const CheckIcon = () => (
  <svg className="check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.5 4.5L19 6.5" />
  </svg>
);

/* ---------- status bar ---------- */
function StatusBar() {
  return (
    <div className="statusbar">
      <span className="time">9:41</span>
      <span className="sysicons">
        {/* cellular */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="#fff">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        {/* wifi */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="#fff">
          <path d="M8.5 2.2c2.6 0 5 1 6.8 2.6l1.5-1.6A12 12 0 0 0 8.5 0 12 12 0 0 0 .2 3.2l1.5 1.6A9.6 9.6 0 0 1 8.5 2.2z"/>
          <path d="M8.5 6c1.4 0 2.7.5 3.7 1.4l1.5-1.6A9 9 0 0 0 8.5 3.5 9 9 0 0 0 2.8 5.8l1.5 1.6A6.2 6.2 0 0 1 8.5 6z"/>
          <path d="M8.5 9.2 11 6.9a4 4 0 0 0-5 0z"/>
        </svg>
        {/* battery */}
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
          <rect x="0.5" y="0.5" width="22" height="12" rx="3.5" stroke="#fff" opacity="0.5"/>
          <rect x="2" y="2" width="19" height="9" rx="2" fill="#fff"/>
          <rect x="24" y="4" width="1.6" height="5" rx="0.8" fill="#fff" opacity="0.6"/>
        </svg>
      </span>
    </div>
  );
}

/* ---------- offer card ---------- */
function OfferCard({ img, hoverImg, avatar, title, desc, cost, affordable = true, bestValue = false, purchased = false, removed = false, onRedeem, onRemove, onAdd }) {
  return (
    <div className={"offer" + (bestValue ? " is-best" : "")}>
      {bestValue && <span className="offer-flag">Best value</span>}
      {hoverImg ? (
        <div className="offer-img avatar-bg offer-img-swap">
          <img className="oi oi-base" src={img} alt="" />
          <img className={"oi oi-top" + (purchased ? " on" : "")} src={hoverImg} alt="" />
        </div>
      ) : (
        <div
          className={"offer-img" + (avatar ? " avatar-bg" : "")}
          style={{ backgroundImage: `url(${img})` }}
        />
      )}
      <div className="offer-body">
        <div className="offer-title">{title}</div>
        {(purchased || removed)
          ? <p className="offer-desc owned-text"><CheckIcon />Purchased</p>
          : <p className="offer-desc">{desc}</p>}
        {purchased ? (
          <button className="cost-btn remove-btn" onClick={onRemove}>Remove</button>
        ) : removed ? (
          <button className="cost-btn" onClick={onAdd}>Add</button>
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

/* ---------- collection item (My Collection) ---------- */
function CollectionItem({ item, onPlay, onEquip }) {
  if (item.type === "avatar") {
    return (
      <div className="col-item">
        <div className="col-thumb avatar" style={{ backgroundImage: `url(${item.img})` }} />
        <div className="col-body">
          <div className="col-title">{item.title}</div>
          <div className="col-sub">Avatar item</div>
        </div>
        <button
          className={"col-btn" + (item.equipped ? " is-equipped" : "")}
          onClick={onEquip}
        >
          {item.equipped ? "Equipped" : "Equip"}
        </button>
      </div>
    );
  }
  return (
    <div className="col-item">
      <div className="col-thumb" style={{ backgroundImage: `url(${item.img})` }} />
      <div className="col-body">
        <div className="col-title">{item.title}</div>
        <div className="col-sub">on {item.game}</div>
      </div>
      <button className="col-btn play" onClick={onPlay}>Play now</button>
    </div>
  );
}

/* ---------- celebration fx ---------- */
const FX_COLORS = (accent) => [accent, "#0a2ecb", "#ffdf00", "#00b3ff", "#ffffff", "#d000ca"];

function spawn(layer, x, y, kind, accent) {
  let el;
  const colors = FX_COLORS(accent);
  if (kind === "coin") {
    el = document.createElement("img");
    el.className = "fx-coin";
    el.src = "assets/qoin.png";
    const s = 22 + Math.random() * 26;
    el.style.width = el.style.height = s + "px";
  } else if (kind === "star") {
    el = document.createElement("div");
    el.className = "fx-star";
    el.style.background = colors[(Math.random() * colors.length) | 0];
    const s = 10 + Math.random() * 12;
    el.style.width = el.style.height = s + "px";
  } else {
    el = document.createElement("div");
    el.className = "fx-confetti";
    el.style.background = colors[(Math.random() * colors.length) | 0];
    if (Math.random() < 0.3) el.style.borderRadius = "50%";
    if (Math.random() < 0.25) { el.style.width = "7px"; el.style.height = "18px"; }
  }
  el.style.left = x + "px";
  el.style.top = y + "px";
  layer.appendChild(el);
  return el;
}

function fling(el, angle, dist, gravity, dur) {
  const dx = Math.cos(angle) * dist;
  const dy = Math.sin(angle) * dist;
  const rot = (Math.random() - 0.5) * 900;
  const anim = el.animate(
    [
      { transform: "translate(-50%,-50%) translate(0,0) rotate(0deg) scale(.5)", opacity: 1 },
      { transform: `translate(-50%,-50%) translate(${dx}px,${dy}px) rotate(${rot * 0.6}deg) scale(1)`, opacity: 1, offset: 0.5 },
      { transform: `translate(-50%,-50%) translate(${dx * 1.12}px,${dy + gravity}px) rotate(${rot}deg) scale(.82)`, opacity: 0 }
    ],
    { duration: dur, easing: "cubic-bezier(.15,.7,.3,1)" }
  );
  anim.onfinish = () => el.remove();
}

function ringPulse(layer, x, y, accent, delay, max) {
  const ring = document.createElement("div");
  ring.className = "fx-ring";
  ring.style.left = x + "px";
  ring.style.top = y + "px";
  ring.style.borderColor = accent;
  layer.appendChild(ring);
  ring.animate(
    [
      { transform: "translate(-50%,-50%) scale(.15)", opacity: 0.75 },
      { transform: `translate(-50%,-50%) scale(${max})`, opacity: 0 }
    ],
    { duration: 720, delay, easing: "cubic-bezier(.2,.6,.3,1)", fill: "forwards" }
  ).onfinish = () => ring.remove();
}

function celebrate(layer, btnRect, style, accent) {
  if (!layer || !btnRect) return;
  const f = layer.getBoundingClientRect();
  const o = { x: btnRect.left + btnRect.width / 2 - f.left, y: btnRect.top + btnRect.height / 2 - f.top };
  const pill = document.querySelector(".qoins-pill");
  let w = { x: o.x, y: o.y - 200 };
  if (pill) { const pr = pill.getBoundingClientRect(); w = { x: pr.left + pr.width / 2 - f.left, y: pr.top + pr.height / 2 - f.top }; }
  const popPill = () => pill && pill.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.22)" }, { transform: "scale(1)" }],
    { duration: 340, easing: "cubic-bezier(.34,1.56,.64,1)" });

  // subtle mode: just a pop + glow on the wallet pill
  if (style === "glow") {
    popPill();
    if (pill) { pill.classList.add("pill-glow"); setTimeout(() => pill.classList.remove("pill-glow"), 700); }
    return;
  }

  // ===== FLY TO WALLET — coins arc from the button into the Qoins pill =====
  // the big balance coin gives a little shake as the coins pour out
  const heroCoin = document.querySelector(".hero-coin");
  if (heroCoin) heroCoin.animate(
    [{ transform: "rotate(0deg) scale(1)" }, { transform: "rotate(-7deg) scale(1.04)" }, { transform: "rotate(6deg) scale(1.04)" },
     { transform: "rotate(-5deg) scale(1.02)" }, { transform: "rotate(4deg) scale(1.02)" }, { transform: "rotate(0deg) scale(1)" }],
    { duration: 560, iterations: 2, easing: "ease-in-out" });
  const N = 16;
  for (let i = 0; i < N; i++) {
    const el = document.createElement("img");
    el.className = "fx-coin";
    el.src = "assets/qoin.png";
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
        { transform: `translate(-50%,-50%) translate(${liftX}px,${liftY}px) scale(1)`, opacity: 1, offset: .34 },
        { transform: `translate(-50%,-50%) translate(${w.x - o.x}px,${w.y - o.y}px) scale(.4)`, opacity: 1, offset: 1 }
      ],
      { duration: 640, delay, easing: "cubic-bezier(.5,0,.4,1)", fill: "backwards" }
    ).onfinish = () => { el.remove(); popPill(); };
  }
  setTimeout(() => {
    if (pill) { pill.classList.add("pill-glow"); setTimeout(() => pill.classList.remove("pill-glow"), 700); }
  }, 60 + N * 45 + 640);
}

/* ---------- how Qoins works — swipeable carousel ---------- */
const HOW_ITEMS = [
  { title: "Claim daily", text: "Tap claim every day and watch your Qoins stack up fast.",
    icon: <path d="M3 10h18M6 10V7a3 3 0 0 1 3-3c1.5 0 2.5 1 3 2.5C15.5 5 16.5 4 18 4a3 3 0 0 1 3 3v3M5 10v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8M12 6v14" /> },
  { title: "Spend in the Q Shop", text: "Swap your Qoins for free spins, games and avatar gear.",
    icon: <path d="M3 9l1.5-4.5h15L21 9M3 9v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9M3 9h18M9 13h6" /> },
  { title: "No wagering, ever", text: "Spend Qoins, keep what you win. No fine-print gotchas.",
    icon: <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3zM9 12l2 2 4-4" /> },
  { title: "Play to earn more", text: "Free-to-play games like Heads or Tails grow your pot.",
    icon: <path d="M5 5l14 7-14 7V5z" /> }
];
function HowQoinsWorks({ onClose, closing }) {
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const onScroll = () => {
    const el = ref.current; if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };
  const goTo = (i) => { const el = ref.current; if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" }); };
  return (
    <div className={"how how-lead" + (closing ? " how-closing" : "")}>
      <div className="how-top">
        <h2 className="section-title">How Qoins works</h2>
        <button className="how-close" aria-label="Dismiss" onClick={onClose}>Dismiss</button>
      </div>
      <div className="how-rail" ref={ref} onScroll={onScroll}>
        {HOW_ITEMS.map((it, i) => (
          <div className="how-card" key={i}>
            <div className="how-inner">
              <div className="how-head">
                <span className="how-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{it.icon}</svg>
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
          <span key={i} className={"dot" + (i === active ? " active" : "")} onClick={() => goTo(i)} role="button" aria-label={`Slide ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}

/* ---------- main screen ---------- */
const ACCENTS = ["#f67ad9", "#00b3ff", "#ffdf00"];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "balance": 87,
  "accent": "#f67ad9",
  "claimAmount": 5,
  "celebration": "coins"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [balance, setBalance] = useState(t.balance);
  const [display, setDisplay] = useState(t.balance);
  const [claimed, setClaimed] = useState(false);
  const [toast, setToast] = useState(null);
  const [collection, setCollection] = useState([]);
  const [newSpin, setNewSpin] = useState(null);
  const [howOpen, setHowOpen] = useState(true);
  const [howClosing, setHowClosing] = useState(false);
  const dismissHow = () => {
    setHowClosing(true);
    setTimeout(() => { setHowOpen(false); setHowClosing(false); }, 420);
  };
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    const tm = setTimeout(() => setIntro(false), 1700);
    return () => clearTimeout(tm);
  }, []);

  const claimRef = useRef(null);
  const heroRef = useRef(null);
  const fxRef = useRef(null);
  const rafRef = useRef(null);
  const joyRef = useRef(null);
  const collectedRef = useRef(null);

  // keep balance in sync if the tweak changes (and not yet claimed)
  useEffect(() => {
    if (!claimed) { setBalance(t.balance); setDisplay(t.balance); }
  }, [t.balance]); // eslint-disable-line

  const countTo = useCallback((from, to, delay) => {
    cancelAnimationFrame(rafRef.current);
    const dur = 900, start = performance.now() + (delay || 0);
    const tick = (now) => {
      const p = Math.min(1, Math.max(0, (now - start) / dur));
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const accent = t.accent;

  const handleClaim = () => {
    if (claimed) return;

    // ensure sound is playing (pointerdown already kicked it off)
    if (joyRef.current && joyRef.current.paused) { joyRef.current.play().catch(() => {}); }

    const next = balance + t.claimAmount;
    setBalance(next);
    countTo(display, next, 500);
    setClaimed(true);

    // celebration
    if (heroRef.current) {
      heroRef.current.classList.remove("pop", "glow");
      void heroRef.current.offsetWidth;
      heroRef.current.classList.add("pop", "glow");
    }
    if (claimRef.current && fxRef.current) {
      const r = claimRef.current.getBoundingClientRect();
      celebrate(fxRef.current, r, t.celebration, accent);
    }
  };

  const showToast = (input) => {
    const data = typeof input === "string" ? { title: input } : input;
    setToast(data);
    clearTimeout(showToast._tid);
    showToast._tid = setTimeout(() => setToast(null), 2400);
  };

  const offers = [
    { img: "assets/western-gold.jpg", type: "spins", count: 25, game: "Western Gold 2", title: "25 Free Spins", desc: "Get 25 free Spins on Western Gold 2", cost: 75 },
    { img: "assets/western-gold.jpg", type: "spins", count: 50, game: "Western Gold 2", title: "50 Free Spins", desc: "Get 50 free Spins on Western Gold 2", cost: 130 },
    { img: "assets/western-gold.jpg", type: "spins", count: 100, game: "Western Gold 2", title: "100 Free Spins", desc: "Get 100 free Spins on Western Gold 2", cost: 230 },
    { img: "assets/western-gold.jpg", type: "spins", count: 200, game: "Western Gold 2", title: "200 Free Spins", desc: "Get 200 free Spins on Western Gold 2", cost: 440 },
    { img: "assets/western-gold.jpg", type: "spins", count: 400, game: "Western Gold 2", title: "400 Free Spins", desc: "Get 400 free Spins on Western Gold 2", cost: 850 }
  ];
  const merch = [
    { img: "assets/glasses1.png", hoverImg: "assets/glasses2.png", avatar: true, type: "avatar", title: "Buy sunglasses", desc: "Grab some fresh shades for your avatar", cost: 25 },
    { img: "assets/circle1.png", hoverImg: "assets/circle2.png", avatar: true, type: "avatar", title: "Golden line", desc: "Ever wanted a fancy gold avatar ring? Now's your chance", cost: 40 }
  ];

  const redeem = (offer) => {
    if (display < offer.cost) { showToast(`Need ${offer.cost - display} more Qoins for that`); return; }
    const next = balance - offer.cost;
    setBalance(next);
    countTo(display, next);
    const item = offer.type === "avatar"
      ? { id: Date.now() + Math.random(), type: "avatar", title: offer.title, img: offer.img, active: true }
      : { id: Date.now() + Math.random(), type: "spins", count: offer.count, title: offer.title, game: offer.game, img: offer.img };
    setCollection((c) => [item, ...c]);
    if (offer.type !== "avatar") { setNewSpin(item.id); setTimeout(() => setNewSpin(null), 800); }
    if (collectedRef.current) {
      collectedRef.current.currentTime = 0;
      collectedRef.current.play().catch(() => {});
    }
    showToast({
      title: offer.type === "avatar" ? "It's yours!" : "You've got free spins!",
      msg: offer.type === "avatar" ? `${offer.title} added to your avatar` : `${offer.title} on ${offer.game}`
    });
  };

  // launch a game to actually use the spins
  const playSpins = (item) => {
    showToast(`Loading ${item.game} — your ${item.count} spins are ready`);
  };
  const toggleEquip = (id) => {
    setCollection((c) => c.map((it) => it.id === id ? { ...it, equipped: !it.equipped } : it));
  };
  // add/remove an owned merch item without re-buying it
  const setMerchActive = (title, active) => {
    setCollection((c) => c.map((it) => (it.type === "avatar" && it.title === title) ? { ...it, active } : it));
    showToast(active ? `${title} added back` : `${title} removed`);
  };

  // soonest-to-expire first; cosmetics after playable rewards
  const sortedCollection = [...collection].sort((a, b) => {
    if (a.type !== b.type) return a.type === "spins" ? -1 : 1;
    return (a.expiresInDays ?? 99) - (b.expiresInDays ?? 99);
  });

  // all free-spins rewards owned (newest first) — shown in the blue area
  const spinsItems = collection.filter((c) => c.type === "spins");

  return (
    <div className="stage" style={{ "--accent": accent }}>
      <div className={"screen" + (intro ? " intro" : "")}>
        <div className="scroll">

          {/* ---------------- HEADER ----------------
              NOTE: the prototype's own status bar + nav (back / Qoins
              pill / balance / avatar) were removed when this page was
              embedded inside the main MrQ app — the global BrandBar +
              BottomNav provide that chrome now. */}
          <div className="header">

            {/* balance card + your free spins all live in the blue */}
            <div className="hero-stack">
              <div className="hero-card">
                <div className="hero-top">
                  <span className="coin hero-coin" />
                  <div className="hero-info">
                    <div className="hero-label">Your Qoins Balance</div>
                    <div className="hero-amount" ref={heroRef}>{display}</div>
                  </div>
                </div>
                <button className="claim-btn" ref={claimRef} onPointerDown={() => { if (!claimed && joyRef.current) joyRef.current.play().catch(() => {}); }} onClick={handleClaim} disabled={claimed}>
                  {claimed
                    ? <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}><CheckIcon />Claimed today</span>
                    : `Claim Today's Qoins (+${t.claimAmount})`}
                </button>
              </div>

              {spinsItems.map((s) => (
                <div className={"spins-card" + (s.id === newSpin ? " spins-enter" : "")} key={s.id}>
                  <div className="spins-thumb" style={{ backgroundImage: `url(${s.img})` }} />
                  <div className="spins-info">
                    <div className="spins-title">{s.count} Free Spins</div>
                    <div className="spins-sub">on {s.game}</div>
                  </div>
                  <button className="spins-play" onClick={() => playSpins(s)}>Play now</button>
                </div>
              ))}
            </div>
          </div>

          {/* ---------------- BODY ---------------- */}
          <div className="body">
            {/* how Qoins works — swipeable carousel (leads the page) */}
            {howOpen && <HowQoinsWorks closing={howClosing} onClose={dismissHow} />}

            {/* free spins */}
            <div className={"section" + (howOpen ? "" : " section-first")}>
              <h2 className="section-title">Free Spins</h2>
              <div className="rail">
                {offers.map((o, i) => (
                  <OfferCard key={i} {...o} affordable={display >= o.cost} onRedeem={() => redeem(o)} />
                ))}
              </div>
            </div>

            {/* free to play */}
            <div className="section">
              <h2 className="section-title">Q Free to Play Games</h2>
              <div className="bigcard">
                <div className="bigcard-img"><img src="assets/heads-or-tails.png" alt="Heads or Tails" /></div>
                <div className="bigcard-body">
                  <div className="offer-title">Heads or Tails</div>
                  <p className="offer-desc">Play Heads or Tails game to be in with a chance to double your pot of Qoins!</p>
                  <button
                    className="play-btn"
                    onClick={() => display >= 10 && showToast("Loading Heads or Tails — good luck!")}
                    disabled={display < 10}
                    aria-disabled={display < 10}
                  >
                    <span className="play-label">Play Now</span>
                    <span className="play-cost"><span className="coin" />10</span>
                  </button>
                </div>
              </div>
            </div>

            {/* merch */}
            <div className="section">
              <h2 className="section-title">MrQ Digital Merch</h2>
              <div className="rail">
                {merch.map((o) => {
                  const item = collection.find((c) => c.type === "avatar" && c.title === o.title);
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

            {/* legal */}
            <p className="legal">Qoins have no cash value and can't be withdrawn. Rewards subject to availability. 18+. <a className="legal-link" href="#">Full T&amp;Cs</a>.</p>
          </div>
        </div>

        {/* toast */}
        {toast && (
          <div className="qtoast" role="status">
            <span className="qtoast-avatar"><img src="assets/avatar-nav.png" alt="" /></span>
            <span className="qtoast-text">
              <span className="qtoast-title">{toast.title}</span>
              {toast.msg && <span className="qtoast-sub">{toast.msg}</span>}
            </span>
          </div>
        )}
      </div>

      {/* fx layer (fixed, viewport) */}
      <div className="fx-layer" ref={fxRef} />

      <audio ref={joyRef} src="assets/joy.mp3" preload="auto" />
      <audio ref={collectedRef} src="assets/collected.mp3" preload="auto" />

      {/* ---------------- TWEAKS ---------------- */}
      <TweaksPanel>
        <TweakSection label="Balance" />
        <TweakSlider label="Qoins balance" value={t.balance} min={0} max={200} step={1}
          onChange={(v) => setTweak("balance", v)} />
        <TweakSlider label="Daily claim" value={t.claimAmount} min={1} max={50} step={1} unit=" Q"
          onChange={(v) => setTweak("claimAmount", v)} />
        <TweakSection label="Look" />
        <TweakColor label="Hero accent" value={t.accent} options={ACCENTS}
          onChange={(v) => setTweak("accent", v)} />
        <TweakRadio label="Celebration" value={t.celebration}
          options={["coins", "glow"]}
          onChange={(v) => setTweak("celebration", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
