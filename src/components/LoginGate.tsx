"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useShell } from "@/lib/filter-context";

/**
 * Login gate — Figma 253:31919.
 *
 *   ┌─────────────────────────────┐
 *   │                             │
 *   │             MrQ             │  ← brand logo
 *   │       Welcome back          │
 *   │    New to MrQ? Sign up here │
 *   │                             │
 *   │   ┌─────────────────────┐   │
 *   │   │ Email               │   │
 *   │   └─────────────────────┘   │
 *   │   ┌─────────────────────┐   │
 *   │   │ Password         👁 │   │
 *   │   └─────────────────────┘   │
 *   │   ┌─────────────────────┐   │
 *   │   │       Log in         │   │  ← brand-blue primary CTA
 *   │   └─────────────────────┘   │
 *   │   ──────── or ───────────   │
 *   │   ┌─────────────────────┐   │
 *   │   │ G  Log in with Google│   │  ← Social card
 *   │   └─────────────────────┘   │
 *   │         Forgot password     │
 *   │                             │
 *   └─────────────────────────────┘
 *
 * Overlay pattern — fixed inset, z-[55] so the LoadingSplash (z-[60])
 * dissolves first and reveals this gate underneath. Gate dismissal
 * is sessionStorage-gated so logging in once stays in effect for the
 * rest of the browser session; reloads after that skip the gate.
 *
 * Tapping "Log in" sets the session flag and fades the gate out —
 * the My Q lobby is already mounted behind, so the user lands on it
 * with no route change required.
 */

// Legacy sessionStorage key from earlier "show login once per
// session" builds — actively cleared on mount so stale flags
// don't suppress the gate on a return visit.
const LEGACY_SESSION_KEY = "mrq.logged-in";

// localStorage key persisted on successful login. Returning users
// (this flag set) skip the welcome + login flow entirely and get
// the SimpleSplashGate instead.
const PERSIST_KEY = "hasLoggedIn";

export function LoginGate() {
  // bootDone flips true once the LoadingSplash finishes its exit
  // animation (or is skipped because it already played this
  // session). Gating the login gate on bootDone gives us the
  // splash → login → My Q sequence the design calls for — the
  // gate stays mounted but invisible (visible=false) until the
  // splash has fully cleared the screen.
  const { bootDone } = useShell();

  // Default `visible=false` for SSR/CSR parity (we can't read
  // sessionStorage on the server). The effect below decides whether
  // to flip it true once bootDone is in, based on the session flag.
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Mark mounted on first paint + proactively clear any stale
  // session flag from older builds (the gate used to only show
  // once per session and persist the dismissal).
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(LEGACY_SESSION_KEY);
    }
  }, []);

  // Show the gate once the welcome/splash phase is done. The
  // gate stays hidden if the user has already logged in this
  // device (localStorage flag) — returning users skip straight
  // to the app after the SimpleSplashGate.
  useEffect(() => {
    if (!mounted || !bootDone) return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(PERSIST_KEY) === "1") return;
    setVisible(true);
  }, [mounted, bootDone]);

  // Lock body scroll while the gate is up so the page underneath
  // doesn't move when the form is interacted with.
  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  const dismiss = () => {
    // Persist hasLoggedIn=true so subsequent app opens skip the
    // welcome + login and go straight from SimpleSplashGate into
    // the app. The "Reset onboarding" button in SideNav clears
    // this flag for testing.
    if (typeof window !== "undefined") {
      localStorage.setItem(PERSIST_KEY, "1");
    }
    setExiting(true);
    setTimeout(() => setVisible(false), 280);
  };

  // Render nothing on SSR — the gate only exists client-side.
  if (!mounted) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          // z-[55] — below LoadingSplash (z-[60]) so the splash
          // dissolves first and the gate is revealed beneath.
          // --frame-right-offset clamps to the mobile-frame column.
          className="fixed top-0 bottom-0 z-[55] overflow-y-auto"
          style={{
            left: "var(--frame-right-offset)",
            right: "var(--frame-right-offset)",
            // Figma surface: #f2f3f3 light grey.
            backgroundColor: "#f2f3f3",
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: exiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.55, 0, 0.45, 1] }}
          role="dialog"
          aria-label="Log in"
        >
          {/* Outer column — flex centred vertically so the form sits
              in the middle of the viewport with the safe-area still
              accounted for at the top + bottom. */}
          <div
            className="flex flex-col items-center justify-center w-full"
            style={{
              minHeight: "100dvh",
              paddingTop: "calc(env(safe-area-inset-top) + 24px)",
              paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)",
              paddingLeft: 16,
              paddingRight: 16,
              gap: 32,
            }}
          >
            {/* Logo + welcome heading */}
            <div className="flex flex-col items-center gap-[12px] w-full">
              {/* Mr Q character head — circular brand-blue badge
                  with the Mr Q personality inside (top hat, yellow
                  shirt, pointing). Replaces the previous flat
                  wordmark so the gate feels personal rather than
                  utilitarian. 170-px width anchors the top of the
                  screen without dominating the welcome heading
                  below. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/logo_head.png"
                alt="Mr Q"
                draggable={false}
                style={{
                  display: "block",
                  width: 170,
                  height: "auto",
                  objectFit: "contain",
                }}
              />
              <div className="flex flex-col items-center gap-[4px] w-full">
                <h1
                  className="text-center text-[var(--mrq-blue)]"
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    lineHeight: 1.3,
                    letterSpacing: -0.24,
                  }}
                >
                  Welcome back
                </h1>
                <p
                  className="text-center"
                  style={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    letterSpacing: 0.1,
                  }}
                >
                  <span style={{ color: "#0e1120", fontWeight: 500 }}>
                    New to MrQ?{" "}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      // Sign-up flow isn't wired yet — keep the link
                      // here for the design and stub the action.
                      if (typeof window !== "undefined") {
                        // eslint-disable-next-line no-console
                        console.log("[Login] sign up");
                      }
                    }}
                    style={{
                      color: "var(--mrq-blue)",
                      fontWeight: 800,
                    }}
                    className="active:opacity-70 transition-opacity"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </div>

            {/* Form */}
            <form
              className="w-full flex flex-col items-stretch px-[8px]"
              style={{ gap: 8 }}
              onSubmit={(e) => {
                e.preventDefault();
                dismiss();
              }}
            >
              <div className="flex flex-col gap-[8px]">
                {/* Email field */}
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white outline-none"
                  style={{
                    height: 42,
                    paddingLeft: 16,
                    paddingRight: 16,
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 500,
                    lineHeight: 1.6,
                    color: "var(--mrq-blue-dark)",
                  }}
                />

                {/* Password field with eye toggle */}
                <div
                  className="w-full bg-white flex items-center"
                  style={{
                    height: 42,
                    paddingLeft: 16,
                    paddingRight: 16,
                    borderRadius: 8,
                    gap: 8,
                  }}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 bg-transparent outline-none"
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      lineHeight: 1.6,
                      color: "var(--mrq-blue-dark)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="grid place-items-center active:scale-[0.95] transition-transform"
                    style={{ width: 24, height: 24 }}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              {/* CTA stack — tighter 12-px gap pulls 'Log in' and
                  'Log in with Google' close to each other with
                  the 'or' divider as a small visual breather
                  rather than a hard separator. */}
              <div
                className="flex flex-col items-stretch w-full"
                style={{ gap: 12, paddingTop: 12 }}
              >
                <button
                  type="submit"
                  className="w-full active:scale-[0.99] transition-transform"
                  style={{
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: "var(--mrq-blue)",
                    color: "white",
                    fontSize: 18,
                    fontWeight: 800,
                    lineHeight: "24px",
                    letterSpacing: -0.2,
                  }}
                >
                  Log in
                </button>

                {/* Divider with "or" */}
                <div className="flex items-center justify-center w-full gap-[10px]">
                  <span
                    className="flex-1 h-px"
                    style={{ backgroundColor: "#cccdd0" }}
                    aria-hidden
                  />
                  <span
                    className="text-center text-black"
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      lineHeight: 1.6,
                      letterSpacing: 0.1,
                    }}
                  >
                    or
                  </span>
                  <span
                    className="flex-1 h-px"
                    style={{ backgroundColor: "#cccdd0" }}
                    aria-hidden
                  />
                </div>

                {/* Social login */}
                <button
                  type="button"
                  onClick={dismiss}
                  className="w-full flex items-center justify-center bg-white active:scale-[0.99] transition-transform"
                  style={{
                    paddingTop: 12,
                    paddingBottom: 12,
                    paddingLeft: 16,
                    paddingRight: 16,
                    borderRadius: 12,
                    gap: 12,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/google-icon.svg"
                    alt=""
                    width={20}
                    height={20}
                    style={{ width: 20, height: 20 }}
                  />
                  <span
                    style={{
                      color: "var(--mrq-blue)",
                      fontSize: 14,
                      fontWeight: 700,
                      lineHeight: 1.6,
                      letterSpacing: 0.1,
                    }}
                  >
                    Log in with Google
                  </span>
                </button>

                {/* Forgot password */}
                <div
                  className="flex items-center justify-center w-full"
                  style={{ paddingTop: 0 }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        // eslint-disable-next-line no-console
                        console.log("[Login] forgot password");
                      }
                    }}
                    style={{
                      color: "var(--mrq-blue)",
                      fontSize: 12,
                      fontWeight: 800,
                      lineHeight: 1.6,
                      letterSpacing: 0.2,
                    }}
                    className="active:opacity-70 transition-opacity"
                  >
                    Forgot password
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* Simple eye / eye-off icon — matches the Figma "eye" toggle inside
   the password field. The Figma asset is a single eye shape; we
   inline a stroke version here so we can flip it to a strike-
   through state when the password is revealed. */
function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      stroke="var(--mrq-blue)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable={false}
    >
      <path d="M2 11s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
      <circle cx="11" cy="11" r="2.5" fill="var(--mrq-blue)" stroke="none" />
      {!open && (
        <path
          d="M4 4l14 14"
          stroke="var(--mrq-blue)"
          strokeWidth="1.8"
        />
      )}
    </svg>
  );
}
