"use client";

import Link from "next/link";

/**
 * Button — local mirror of the design-system Button that the Figma design
 * maps to via Code Connect (`packages/button/src/index.tsx`, Figma node
 * 29164:893). The design-system package isn't vendored into this prototype,
 * so this reflects the same prop contract (`text` / `hierarchy` / `size` /
 * `icon` / `state`) for the variants we actually use.
 *
 *   <Button text="See all Rewards" hierarchy="white" size="large" />
 */

type Hierarchy = "white";
type Size = "large";

type ButtonProps = {
  text: string;
  hierarchy?: Hierarchy;
  size?: Size;
  icon?: "none";
  state?: "default";
  /** When set the button renders as a navigating link. */
  href?: string;
  onClick?: () => void;
};

const SIZE_STYLE: Record<Size, React.CSSProperties> = {
  // Button/LG token — Gilroy ExtraBold 18 / 24, tracking -0.2.
  large: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 32,
    paddingRight: 32,
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: -0.2,
    lineHeight: "24px",
  },
};

const HIERARCHY_STYLE: Record<Hierarchy, React.CSSProperties> = {
  white: { backgroundColor: "#ffffff", color: "#0a2ecb" },
};

export function Button({
  text,
  hierarchy = "white",
  size = "large",
  href,
  onClick,
}: ButtonProps) {
  const className =
    "flex w-full items-center justify-center rounded-[12px] active:scale-[0.99] transition-transform";
  const style = { ...SIZE_STYLE[size], ...HIERARCHY_STYLE[hierarchy] };

  if (href) {
    return (
      <Link
        href={href}
        data-component="Button"
        className={className}
        style={style}
      >
        {text}
      </Link>
    );
  }

  return (
    <button
      type="button"
      data-component="Button"
      onClick={onClick}
      className={className}
      style={style}
    >
      {text}
    </button>
  );
}
