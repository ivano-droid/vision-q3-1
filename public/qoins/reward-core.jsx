/* global window, document, React */
// ===========================================================================
// reward-core.jsx — RewardScreen harness (a mini MrQ "Claim" moment) + the
// NotesPanel that documents each concept. Exposed on window.
// ===========================================================================
(function () {
  const { useState, useRef, useEffect } = React;
  const fmt = (n) => n.toLocaleString("en-GB");

  // Coin icon helper (crops the qoin.png whitespace like the real app)
  function Coin({ size }) {
    return <span className="rc-coinimg" style={{ width: size, height: size }} />;
  }

  // ---- the mini reward screen ----
  function RewardScreen({ concept, reward = 50, base = 1240, accent = "#f67ad9" }) {
    const [display, setDisplay] = useState(base);
    const [phase, setPhase] = useState("idle"); // idle | playing | done | armed(flip)
    const [flipState, setFlipState] = useState(0); // 0 cta · 1 mystery · 2 revealed
    const fx = useRef(null), btn = useRef(null), card = useRef(null),
      numEl = useRef(null), walletEl = useRef(null), reveal = useRef(null), stage = useRef(null);
    const holdRef = useRef(null);

    const setBoth = (v) => setDisplay(v);
    const baseNow = useRef(base);

    const ctx = () => ({
      fx: fx.current, btn: btn.current, card: card.current, numEl: numEl.current,
      wallet: walletEl.current, reveal: reveal.current, stage: stage.current,
      reward, base: baseNow.current, setDisplay: setBoth,
      finish: (ms) => setTimeout(() => setPhase("done"), ms || 1400),
    });

    function reset() {
      baseNow.current = display; // keep accumulated balance; re-arm
      setPhase("idle"); setFlipState(0);
      if (reveal.current) { reveal.current.className = "rc-reveal"; reveal.current.innerHTML = ""; }
    }

    // --- tap handler (most concepts: single tap) ---
    function onClaim() {
      if (concept === "flip") { handleFlip(); return; }
      if (phase === "playing") return;
      setPhase("playing");
      baseNow.current = display;
      window.RC_ANIMS[concept](ctx());
    }

    // --- mystery flip: tap1 → "?", tap2 → reveal ---
    function handleFlip() {
      if (flipState === 0) { setFlipState(1); }
      else if (flipState === 1) {
        setFlipState(2); setPhase("playing"); baseNow.current = display;
        if (reveal.current) { reveal.current.innerHTML = `<span class='rc-reveal-plus'>+</span>${reward}`; reveal.current.classList.add("show"); }
        setTimeout(() => window.RC_ANIMS.flip(ctx()), 360);
        ctx().finish(1500);
      }
    }

    // --- charge: hold to fill, release to pop ---
    function startCharge(e) {
      if (concept !== "charge" || phase === "playing") return;
      e.preventDefault();
      const b = btn.current; b.classList.add("rc-charging");
      const t0 = performance.now();
      holdRef.current = { t0, fired: false };
      const dur = 850;
      const step = (now) => {
        if (!holdRef.current) return;
        const p = Math.min(1, (now - t0) / dur);
        b.style.setProperty("--charge", (p * 100) + "%");
        b.style.transform = `scale(${1 + p * 0.06})`;
        if (p < 1 && holdRef.current) holdRef.current.raf = requestAnimationFrame(step);
        else if (p >= 1) { b.classList.add("rc-charged"); }
      };
      holdRef.current.raf = requestAnimationFrame(step);
    }
    function endCharge() {
      if (concept !== "charge" || !holdRef.current) return;
      const held = performance.now() - holdRef.current.t0;
      const power = Math.min(1, held / 850);
      cancelAnimationFrame(holdRef.current.raf);
      holdRef.current = null;
      const b = btn.current;
      b.classList.remove("rc-charging", "rc-charged");
      b.style.removeProperty("--charge"); b.style.transform = "";
      if (power < 0.12) return; // tap too short — ignore
      setPhase("playing"); baseNow.current = display;
      window.RC_ANIMS.charge(ctx(), power);
    }

    // claim button label
    const ctaLabel = `Claim ${reward} Qoins`;

    const btnProps = concept === "charge"
      ? { onPointerDown: startCharge, onPointerUp: endCharge, onPointerLeave: endCharge }
      : { onClick: onClaim };

    return (
      <div className="rc-screen" style={{ "--rc-accent": accent }}>
        {/* nav with wallet pill (target for fly-to-wallet) */}
        <div className="rc-nav">
          <span className="rc-brand">Qoins</span>
          <span className="rc-wallet" ref={walletEl}>
            <Coin size={20} /><span className="rc-walletnum">{fmt(display)}</span>
          </span>
        </div>

        {/* blue stage */}
        <div className="rc-stage" ref={stage}>
          <div className="rc-card" ref={card}>
            <Coin size={62} />
            <div className="rc-card-label">Your Qoins Balance</div>
            <div className="rc-balance" ref={numEl}>{fmt(display)}</div>
          </div>

          {/* reveal overlay (slot / flip) */}
          <div className="rc-reveal" ref={reveal}></div>

          {/* claim button / flip tile */}
          {concept === "flip" ? (
            <button className={"rc-claim rc-flip flip" + flipState} onClick={handleFlip}>
              <span className="rc-flip-face rc-flip-front">{ctaLabel}</span>
              <span className="rc-flip-face rc-flip-back">?</span>
            </button>
          ) : (
            <button
              className={"rc-claim" + (concept === "charge" ? " rc-chargebtn" : "")}
              ref={btn}
              {...btnProps}
              disabled={phase === "playing" && concept !== "charge"}
            >
              {phase === "done" ? "Claimed ✓ · tap to replay" : (concept === "charge" ? "Hold to charge" : ctaLabel)}
            </button>
          )}

          {phase === "done" && concept !== "flip" && (
            <button className="rc-replay" onClick={reset}>Replay</button>
          )}
          {concept === "flip" && flipState === 2 && (
            <button className="rc-replay" onClick={reset}>Replay</button>
          )}
        </div>

        <div className="rc-fx" ref={fx}></div>
      </div>
    );
  }

  // ---- notes panel under each artboard ----
  function NotesPanel({ index, title, intensity, complexity, flow, motion, why }) {
    const cx = { Easy: "easy", Medium: "med", Hard: "hard" }[complexity] || "med";
    return (
      <div className="rc-notes">
        <div className="rc-notes-head">
          <span className="rc-num">{String(index).padStart(2, "0")}</span>
          <h3>{title}</h3>
        </div>
        <div className="rc-badges">
          <span className="rc-badge rc-int">{intensity}</span>
          <span className={"rc-badge rc-cx rc-cx-" + cx}>{complexity}</span>
        </div>
        <dl className="rc-meta">
          <dt>Flow</dt><dd>{flow}</dd>
          <dt>Motion</dt><dd>{motion}</dd>
          <dt>Why it works</dt><dd>{why}</dd>
        </dl>
      </div>
    );
  }

  window.RewardScreen = RewardScreen;
  window.NotesPanel = NotesPanel;
})();
