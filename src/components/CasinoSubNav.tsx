"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { key: "home",     label: "Home",     href: "/casino" },
  { key: "new",      label: "New",      href: "/casino/new" },
  { key: "jackpot",  label: "Jackpot",  href: "/casino/jackpot" },
  { key: "megaways", label: "Megaways", href: "/casino/megaways" },
  { key: "slingo",   label: "Slingo",   href: "/casino/slingo" },
  { key: "tables",   label: "Tables",   href: "/casino/tables" },
  { key: "live",     label: "Live",     href: "/casino/live" },
];

function activeKeyFor(pathname: string): string {
  if (pathname === "/casino") return "home";
  for (const tab of TABS) {
    if (tab.key !== "home" && pathname.startsWith(tab.href)) return tab.key;
  }
  return "home";
}

export function CasinoSubNav() {
  const pathname = usePathname();
  const active = activeKeyFor(pathname);

  return (
    <div
      className="sticky z-20 bg-white"
      style={{
        top: "calc(env(safe-area-inset-top) + 68px)",
        borderBottom: "1px solid var(--mrq-divider)",
      }}
    >
      <div className="flex overflow-x-auto no-scrollbar px-[4px]">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className="relative shrink-0 px-[14px] py-[13px] whitespace-nowrap font-bold"
              style={{
                fontSize: "15px",
                color: isActive ? "var(--mrq-blue)" : "#8896b3",
              }}
            >
              {tab.label}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute bottom-0 left-[10px] right-[10px] h-[2.5px] rounded-full"
                  style={{ backgroundColor: "var(--mrq-blue)" }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
