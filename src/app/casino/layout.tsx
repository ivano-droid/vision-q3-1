"use client";

import { useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CasinoSubNav } from "@/components/CasinoSubNav";
import { getSectionBySlug } from "@/lib/casino-sections";

const TAB_PATHS = [
  "/casino",
  "/casino/new",
  "/casino/jackpot",
  "/casino/megaways",
  "/casino/slingo",
  "/casino/tables",
  "/casino/live",
];

function tabIndexFor(pathname: string): number {
  if (pathname === "/casino") return 0;
  // Section detail pages sit "deeper" than all tabs.
  if (pathname.startsWith("/casino/section/")) return 99;
  const i = TAB_PATHS.findIndex((t, idx) => idx > 0 && pathname.startsWith(t));
  return i >= 0 ? i : 0;
}

function titleFor(pathname: string): string {
  if (pathname.startsWith("/casino/section/")) {
    const slug = pathname.split("/casino/section/")[1]?.split("/")[0] ?? "";
    return getSectionBySlug(slug)?.title ?? "Casino";
  }
  return "Casino";
}

const slideVariants = {
  initial: (dir: number) => ({ x: dir > 0 ? "100%" : dir < 0 ? "-100%" : 0 }),
  animate: { x: 0 },
  exit:    (dir: number) => ({ x: dir > 0 ? "-100%" : dir < 0 ? "100%" : 0 }),
};

const spring = { type: "spring", stiffness: 380, damping: 36, mass: 0.8 } as const;

export default function CasinoLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prevRef = useRef({ path: pathname, dir: 0 });

  if (prevRef.current.path !== pathname) {
    const from = tabIndexFor(prevRef.current.path);
    const to   = tabIndexFor(pathname);
    prevRef.current = { path: pathname, dir: to > from ? 1 : to < from ? -1 : 0 };
  }

  const dir = prevRef.current.dir;
  const isSection = pathname.startsWith("/casino/section/");
  const title = titleFor(pathname);

  return (
    <>
      <div className="bg-white px-[16px] pt-[16px] pb-[0]">
        <h1 className="text-[28px] font-extrabold leading-none text-[var(--mrq-blue-dark)]">
          {title}
        </h1>
      </div>

      {!isSection && <CasinoSubNav />}

      <div className="overflow-x-hidden">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={pathname}
            custom={dir}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={spring}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
