/**
 * Light haptic feedback.
 *
 * Thin wrapper over the Web Vibration API (`navigator.vibrate`). It is
 * deliberately tiny and "fire-and-forget" — call `haptics.selection()`
 * on a tap and forget about it.
 *
 * Support reality:
 *   • Android Chrome / installed PWAs  → real vibration.
 *   • iOS Safari                       → no Vibration API, silently
 *                                        no-ops (Apple gates haptics to
 *                                        native + a few input hacks we
 *                                        intentionally don't ship).
 *   • Desktop                          → usually no-ops.
 *
 * Guards built in: SSR-safe, feature-detects, respects the user's
 * "reduce motion" preference, and never throws.
 *
 * Intents (keep these semantic, not duration-named, so call sites read
 * well and we can retune the feel in one place):
 *   selection — tiniest tick: toggles, tab switches, chip taps, list picks
 *   tap       — light press: opening a sheet/menu, confirming a choice
 *   success   — celebratory double-pulse: wins, reward claims, deposits
 *   warn      — soft buzz: invalid action / error
 */

type Pattern = number | number[];

let enabled = true;

function canVibrate(): boolean {
  if (typeof window === "undefined") return false;
  if (!enabled) return false;
  if (typeof navigator === "undefined" || !("vibrate" in navigator))
    return false;
  // Treat "reduce motion" as "minimise non-essential feedback".
  const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  if (mq?.matches) return false;
  return true;
}

function fire(pattern: Pattern) {
  if (!canVibrate()) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* never let a haptic break a tap */
  }
}

export const haptics = {
  /** Tiniest tick — selection / toggle / tab switch / chip tap. */
  selection: () => fire(8),
  /** Light press — opening a sheet or menu, confirming a choice. */
  tap: () => fire(15),
  /** Celebratory double-pulse — reserve for wins / claims / deposits. */
  success: () => fire([12, 40, 18]),
  /** Soft buzz — invalid action or error. */
  warn: () => fire([20, 60, 20]),
  /** Global kill-switch (e.g. wire to a Settings toggle later). */
  setEnabled: (v: boolean) => {
    enabled = v;
  },
};
