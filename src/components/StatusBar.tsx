/**
 * Faux iOS status bar — 54px tall, white text/icons on transparent bg.
 * Pulled from Figma node 43:13044.
 */
export function StatusBar() {
  return (
    <div className="flex h-[54px] items-center justify-between pl-[23px] pr-[18px] pb-[19px] pt-[21px]">
      {/* Time */}
      <span
        className="text-white text-[17px] leading-[22px] font-semibold tracking-tight"
        style={{ fontFamily: "var(--font-system)", fontVariationSettings: "'wdth' 100" }}
      >
        9:41
      </span>

      {/* Signal / Wifi / Battery — plain <img> for SVGs (no optimization needed) */}
      <div className="flex items-center gap-[7px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/cellular.svg" alt="" className="h-[12.226px] w-[19.2px]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/wifi.svg" alt="" className="h-[12.328px] w-[17.142px]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/battery.svg" alt="" className="h-[13px] w-[27.328px]" />
      </div>
    </div>
  );
}
