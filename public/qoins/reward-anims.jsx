/* global window, document, performance, requestAnimationFrame */
// ===========================================================================
// reward-anims.jsx — the 8 "Claim Coins" reward-moment animations.
// Each is a function (ctx) => void where ctx provides the live DOM refs.
// Exposed on window.RC_ANIMS. Coin art = assets/qoin.png.
// ===========================================================================
(function () {
  const COIN = "assets/qoin.png";
  const easeOutBack = "cubic-bezier(.34,1.56,.64,1)";
  const easeOut = "cubic-bezier(.22,.7,.24,1)";

  // ---- helpers ----
  function coin(fx, x, y, size) {
    const el = document.createElement("div");
    el.className = "rc-coin";
    el.style.width = el.style.height = size + "px";
    el.style.left = x + "px";
    el.style.top = y + "px";
    fx.appendChild(el);
    return el;
  }
  function spark(fx, x, y, size, color) {
    const el = document.createElement("div");
    el.className = "rc-spark";
    el.style.width = el.style.height = size + "px";
    el.style.left = x + "px";
    el.style.top = y + "px";
    if (color) el.style.background = color;
    fx.appendChild(el);
    return el;
  }
  function ring(fx, x, y, color, max, dur) {
    const el = document.createElement("div");
    el.className = "rc-ring";
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.borderColor = color || "#fff";
    fx.appendChild(el);
    el.animate(
      [{ transform: "translate(-50%,-50%) scale(.2)", opacity: .8 },
       { transform: `translate(-50%,-50%) scale(${max || 3})`, opacity: 0 }],
      { duration: dur || 700, easing: easeOut, fill: "forwards" }
    ).onfinish = () => el.remove();
  }
  function countUp(set, from, to, dur, delay) {
    const start = performance.now() + (delay || 0);
    (function tick(now) {
      const p = Math.max(0, Math.min(1, (now - start) / (dur || 900)));
      const e = 1 - Math.pow(1 - p, 3);
      set(Math.round(from + (to - from) * e));
      if (p < 1) requestAnimationFrame(tick);
    })(performance.now());
  }
  function pressBtn(btn) {
    if (!btn) return;
    btn.animate(
      [{ transform: "scale(1)" }, { transform: "scale(.92)" }, { transform: "scale(1.04)" }, { transform: "scale(1)" }],
      { duration: 420, easing: easeOutBack }
    );
  }
  const rectIn = (el, fx) => {
    const r = el.getBoundingClientRect(), f = fx.getBoundingClientRect();
    return { x: r.left - f.left + r.width / 2, y: r.top - f.top + r.height / 2, w: r.width, h: r.height };
  };
  const pop = (el) => el && el.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.28)" }, { transform: "scale(1)" }],
    { duration: 360, easing: easeOutBack });

  // =========================================================================
  // 1 · COIN RAIN — generous downpour from the top
  // =========================================================================
  function rain(ctx) {
    const { fx, btn, base, reward, setDisplay } = ctx;
    pressBtn(btn);
    const W = fx.clientWidth, H = fx.clientHeight;
    countUp(setDisplay, base, base + reward, 950, 200);
    for (let i = 0; i < 90; i++) {
      const size = 16 + Math.random() * 24;
      const x = Math.random() * W;
      const startY = -30 - Math.random() * 260;
      const el = coin(fx, x, startY, size);
      const fall = H + 40 - startY;
      const drift = (Math.random() - .5) * 50;
      const rot = (Math.random() - .5) * 680;
      el.animate(
        [{ transform: "translate(-50%,-50%) rotate(0)", opacity: 0, offset: 0 },
         { opacity: 1, offset: .06 }, { opacity: 1, offset: .85 },
         { transform: `translate(-50%,-50%) translate(${drift}px,${fall}px) rotate(${rot}deg)`, opacity: 0, offset: 1 }],
        { duration: 1100 + Math.random() * 1300, delay: Math.random() * 750, easing: "cubic-bezier(.34,.06,.5,1)", fill: "backwards" }
      ).onfinish = () => el.remove();
    }
    ctx.finish(1600);
  }

  // =========================================================================
  // 2 · CANNON BURST — coins explode outward from the button (physics)
  // =========================================================================
  function burst(ctx) {
    const { fx, btn, base, reward, setDisplay } = ctx;
    btn && btn.animate([{ transform: "scale(1)" }, { transform: "scale(.86)" }, { transform: "scale(1.06)" }, { transform: "scale(1)" }],
      { duration: 460, easing: easeOutBack });
    const o = rectIn(btn, fx);
    ring(fx, o.x, o.y, "#ffdf00", 3.2, 620);
    ring(fx, o.x, o.y, "#fff", 2.4, 520);
    countUp(setDisplay, base, base + reward, 800, 150);
    for (let i = 0; i < 64; i++) {
      const size = 16 + Math.random() * 26;
      const el = coin(fx, o.x, o.y, size);
      const ang = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 190;
      const dx = Math.cos(ang) * dist;
      const peak = Math.sin(ang) * dist - (40 + Math.random() * 70);
      const rot = (Math.random() - .5) * 900;
      el.animate(
        [{ transform: "translate(-50%,-50%) translate(0,0) rotate(0) scale(.5)", opacity: 1, offset: 0 },
         { transform: `translate(-50%,-50%) translate(${dx}px,${peak}px) rotate(${rot * .6}deg) scale(1)`, opacity: 1, offset: .5 },
         { transform: `translate(-50%,-50%) translate(${dx * 1.1}px,${peak + 320}px) rotate(${rot}deg) scale(.85)`, opacity: 0, offset: 1 }],
        { duration: 900 + Math.random() * 700, easing: "cubic-bezier(.2,.6,.3,1)", fill: "forwards" }
      ).onfinish = () => el.remove();
    }
    ctx.finish(1500);
  }

  // =========================================================================
  // 3 · FLY TO WALLET — coins arc into the balance pill, ticking it up
  // =========================================================================
  function wallet(ctx) {
    const { fx, btn, wallet, base, reward, setDisplay } = ctx;
    pressBtn(btn);
    const o = rectIn(btn, fx), w = rectIn(wallet, fx);
    const N = 14;
    for (let i = 0; i < N; i++) {
      const el = coin(fx, o.x, o.y, 30);
      const liftX = o.x + (Math.random() - .5) * 80;
      const liftY = o.y - 40 - Math.random() * 50;
      const delay = 80 + i * 55;
      el.animate(
        [{ transform: "translate(-50%,-50%) translate(0,0) scale(.4)", opacity: 0, offset: 0 },
         { transform: `translate(-50%,-50%) translate(${liftX - o.x}px,${liftY - o.y}px) scale(1)`, opacity: 1, offset: .35 },
         { transform: `translate(-50%,-50%) translate(${w.x - o.x}px,${w.y - o.y}px) scale(.45)`, opacity: 1, offset: 1 }],
        { duration: 620, delay, easing: "cubic-bezier(.5,0,.4,1)", fill: "backwards" }
      ).onfinish = () => {
        el.remove();
        pop(wallet);
        setDisplay(base + Math.round(reward * (i + 1) / N));
      };
    }
    setTimeout(() => { wallet && wallet.classList.add("rc-glow"); setTimeout(() => wallet && wallet.classList.remove("rc-glow"), 700); }, 80 + N * 55 + 600);
    ctx.finish(80 + N * 55 + 900);
  }

  // =========================================================================
  // 4 · SLOT REEL — the reward spins up like a fruit machine, then locks
  // =========================================================================
  function slot(ctx) {
    const { fx, btn, reveal, base, reward, setDisplay } = ctx;
    pressBtn(btn);
    const digits = String(reward).split("");
    reveal.innerHTML = "<span class='rc-reveal-plus'>+</span>" +
      digits.map(() => "<span class='rc-reel'><span class='rc-reelcol'>" +
        "0123456789".split("").concat("0").map(d => `<span>${d}</span>`).join("") + "</span></span>").join("");
    reveal.classList.add("show");
    const cols = reveal.querySelectorAll(".rc-reelcol");
    const unit = 1.05; // em per digit
    cols.forEach((col, i) => {
      const target = parseInt(digits[i], 10);
      const spins = 4 + i; // each reel spins a bit longer
      const end = -(spins * 10 + target) * unit;
      col.animate(
        [{ transform: "translateY(0em)" }, { transform: `translateY(${end}em)` }],
        { duration: 900 + i * 350, easing: "cubic-bezier(.15,.85,.25,1)", fill: "forwards" }
      ).onfinish = () => {
        col.style.transform = `translateY(${-target * unit}em)`;
        const reel = col.parentElement;
        reel.animate([{ transform: "scale(1)" }, { transform: "scale(1.18)" }, { transform: "scale(1)" }], { duration: 260, easing: easeOutBack });
        if (i === cols.length - 1) {
          const o = rectIn(reveal, fx);
          ring(fx, o.x, o.y, "#ffdf00", 2.6, 600);
          for (let k = 0; k < 22; k++) {
            const el = coin(fx, o.x, o.y, 16 + Math.random() * 18);
            const ang = -Math.PI / 2 + (Math.random() - .5) * 2.4, d = 50 + Math.random() * 150;
            el.animate([{ transform: "translate(-50%,-50%)", opacity: 1 },
              { transform: `translate(-50%,-50%) translate(${Math.cos(ang) * d}px,${Math.sin(ang) * d + 260}px) rotate(${(Math.random() - .5) * 600}deg)`, opacity: 0 }],
              { duration: 1000 + Math.random() * 500, easing: "cubic-bezier(.2,.6,.3,1)", fill: "forwards" }).onfinish = () => el.remove();
          }
          countUp(setDisplay, base, base + reward, 700, 0);
          setTimeout(() => reveal.classList.remove("show"), 1300);
        }
      };
    });
    ctx.finish(900 + cols.length * 350 + 1400);
  }

  // =========================================================================
  // 5 · TREASURE CHEST — loot-box reveal with anticipation shake + eruption
  // =========================================================================
  function chest(ctx) {
    const { fx, stage, base, reward, setDisplay } = ctx;
    const box = document.createElement("div");
    box.className = "rc-chest";
    box.innerHTML = `
      <div class="rc-chest-rays"></div>
      <div class="rc-chest-lid"><span class="rc-chest-band"></span><span class="rc-chest-lock"></span></div>
      <div class="rc-chest-base"><span class="rc-chest-band"></span></div>`;
    stage.appendChild(box);
    box.animate([{ transform: "translateY(-40px) scale(.6)", opacity: 0 }, { transform: "translateY(0) scale(1)", opacity: 1 }],
      { duration: 420, easing: easeOutBack, fill: "backwards" });
    // anticipation shake
    setTimeout(() => box.animate(
      [{ transform: "rotate(0)" }, { transform: "rotate(-4deg)" }, { transform: "rotate(4deg)" }, { transform: "rotate(-3deg)" }, { transform: "rotate(3deg)" }, { transform: "rotate(0)" }],
      { duration: 520, easing: "ease-in-out" }), 420);
    // burst open
    setTimeout(() => {
      box.querySelector(".rc-chest-lid").animate([{ transform: "rotateX(0)" }, { transform: "rotateX(-118deg)" }], { duration: 360, easing: easeOutBack, fill: "forwards" });
      box.querySelector(".rc-chest-rays").animate([{ opacity: 0, transform: "translateX(-50%) scale(.4)" }, { opacity: .9, transform: "translateX(-50%) scale(1)" }, { opacity: 0, transform: "translateX(-50%) scale(1.1)" }], { duration: 1100, easing: "ease-out", fill: "forwards" });
      const o = rectIn(box, fx); o.y -= 10;
      ring(fx, o.x, o.y, "#ffdf00", 3, 700);
      for (let i = 0; i < 56; i++) {
        const el = coin(fx, o.x, o.y, 16 + Math.random() * 26);
        const ang = -Math.PI / 2 + (Math.random() - .5) * 2.2, d = 40 + Math.random() * 180;
        const dx = Math.cos(ang) * d, peak = Math.sin(ang) * d - (20 + Math.random() * 50);
        el.animate([{ transform: "translate(-50%,-50%) scale(.4)", opacity: 1, offset: 0 },
          { transform: `translate(-50%,-50%) translate(${dx}px,${peak}px) scale(1)`, opacity: 1, offset: .5 },
          { transform: `translate(-50%,-50%) translate(${dx * 1.1}px,${peak + 340}px) rotate(${(Math.random() - .5) * 700}deg) scale(.85)`, opacity: 0, offset: 1 }],
          { duration: 1100 + Math.random() * 700, easing: "cubic-bezier(.2,.6,.3,1)", fill: "forwards" }).onfinish = () => el.remove();
      }
      countUp(setDisplay, base, base + reward, 900, 200);
      box.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: 1100, easing: "ease", fill: "forwards" }).onfinish = () => box.remove();
    }, 1040);
    ctx.finish(2900);
  }

  // =========================================================================
  // 6 · MYSTERY FLIP — tap reveals "?" tile, tap again flips to the prize
  // =========================================================================
  function flip(ctx) {
    // handled as a two-step interaction in core; here we run the reveal burst
    const { fx, reveal, base, reward, setDisplay } = ctx;
    const o = rectIn(reveal, fx);
    ring(fx, o.x, o.y, "#d000ca", 2.4, 600);
    for (let k = 0; k < 26; k++) {
      const el = coin(fx, o.x, o.y, 15 + Math.random() * 20);
      const ang = Math.random() * Math.PI * 2, d = 50 + Math.random() * 150;
      el.animate([{ transform: "translate(-50%,-50%) scale(.5)", opacity: 1 },
        { transform: `translate(-50%,-50%) translate(${Math.cos(ang) * d}px,${Math.sin(ang) * d + 240}px) rotate(${(Math.random() - .5) * 600}deg)`, opacity: 0 }],
        { duration: 1000 + Math.random() * 500, easing: "cubic-bezier(.2,.6,.3,1)", fill: "forwards" }).onfinish = () => el.remove();
    }
    countUp(setDisplay, base, base + reward, 800, 100);
  }

  // =========================================================================
  // 7 · CHARGE & RELEASE — hold to charge, release to pop (handled in core)
  // =========================================================================
  function charge(ctx, power) {
    const { fx, btn, base, reward, setDisplay } = ctx;
    const o = rectIn(btn, fx);
    const p = Math.max(.25, power == null ? 1 : power);
    ring(fx, o.x, o.y, "#ffdf00", 2 + p * 2, 600);
    btn && btn.animate([{ transform: "scale(1.06)" }, { transform: "scale(1)" }], { duration: 360, easing: easeOutBack });
    const n = Math.round(28 + p * 56);
    for (let i = 0; i < n; i++) {
      const el = coin(fx, o.x, o.y, 16 + Math.random() * 24);
      const ang = -Math.PI / 2 + (Math.random() - .5) * (1.6 + p);
      const d = (60 + Math.random() * 180) * (.6 + p * .6);
      const dx = Math.cos(ang) * d, peak = Math.sin(ang) * d - (30 + Math.random() * 70);
      el.animate([{ transform: "translate(-50%,-50%) scale(.5)", opacity: 1, offset: 0 },
        { transform: `translate(-50%,-50%) translate(${dx}px,${peak}px) scale(1)`, opacity: 1, offset: .5 },
        { transform: `translate(-50%,-50%) translate(${dx * 1.1}px,${peak + 330}px) rotate(${(Math.random() - .5) * 800}deg) scale(.85)`, opacity: 0, offset: 1 }],
        { duration: 950 + Math.random() * 650, easing: "cubic-bezier(.2,.6,.3,1)", fill: "forwards" }).onfinish = () => el.remove();
    }
    countUp(setDisplay, base, base + Math.round(reward * (.5 + p * .5)), 800, 100);
    ctx.finish(1500);
  }

  // =========================================================================
  // 8 · ELEGANT SHIMMER — restrained, premium: light sweep + gold shimmer
  // =========================================================================
  function shimmer(ctx) {
    const { fx, btn, numEl, base, reward, setDisplay } = ctx;
    if (btn) { btn.classList.remove("rc-sweep"); void btn.offsetWidth; btn.classList.add("rc-sweep"); }
    const o = rectIn(numEl, fx);
    ring(fx, o.x, o.y, "#ffdf00", 2.2, 720);
    if (numEl) { numEl.classList.remove("rc-shine"); void numEl.offsetWidth; numEl.classList.add("rc-shine"); }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2, d = 36 + Math.random() * 26;
      const s = spark(fx, o.x + Math.cos(a) * 10, o.y + Math.sin(a) * 10, 7 + Math.random() * 5, "#ffdf00");
      s.animate([{ transform: `translate(-50%,-50%) translate(0,0) scale(0)`, opacity: 1 },
        { transform: `translate(-50%,-50%) translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) scale(1)`, opacity: 1, offset: .6 },
        { transform: `translate(-50%,-50%) translate(${Math.cos(a) * d * 1.3}px,${Math.sin(a) * d * 1.3}px) scale(0)`, opacity: 0 }],
        { duration: 800 + Math.random() * 300, easing: "ease-out", fill: "forwards" }).onfinish = () => s.remove();
    }
    countUp(setDisplay, base, base + reward, 1000, 150);
    ctx.finish(1300);
  }

  window.RC_ANIMS = { rain, burst, wallet, slot, chest, flip, charge, shimmer };
})();
