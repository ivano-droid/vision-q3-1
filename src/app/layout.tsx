import type { Metadata, Viewport } from "next";
import { Manrope, Anton } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ShellProvider } from "@/lib/filter-context";
import { AppShell } from "@/components/AppShell";

// Spectre beacon — reports which design-system components (tagged with
// `data-component`) this prototype renders, so the host tool can detect them.
// Broadcasts on load, on demand (when Spectre posts `__spectreScan`), and once
// more after a delay to catch client-rendered content.
const SPECTRE_BEACON = `
(function () {
  var STYLE_PROPS = ['border-radius','background-color','color','font-family','font-size','font-weight','padding','border','box-shadow'];
  function stylesOf(el) {
    var cs = getComputedStyle(el), out = {};
    STYLE_PROPS.forEach(function (p) { var v = cs.getPropertyValue(p); if (v) out[p] = v.trim(); });
    return out;
  }
  function collect() {
    var map = new Map();
    document.querySelectorAll('[data-component]').forEach(function (el) {
      var name = el.getAttribute('data-component');
      if (!name) return;
      var e = map.get(name) || { name: name, count: 0, classes: new Set(), styles: null };
      e.count++;
      (typeof el.className === 'string' ? el.className.split(/\\s+/) : [])
        .forEach(function (c) { if (c) e.classes.add(c); });
      if (!e.styles) e.styles = stylesOf(el);
      map.set(name, e);
    });
    return Array.from(map.values()).map(function (e) {
      return { name: e.name, count: e.count, classes: Array.from(e.classes).slice(0, 30), styles: e.styles };
    });
  }
  function broadcast() {
    try {
      parent.postMessage({ __spectreComponents: true, url: location.href, components: collect() }, '*');
    } catch (_) {}
  }
  window.addEventListener('load', broadcast);
  window.addEventListener('message', function (e) {
    if (e && e.data && e.data.__spectreScan) broadcast();
  });
  setTimeout(broadcast, 1500); // catch client-rendered content
})();
`;

// Manrope: free stand-in for Gilroy ExtraBold (the proprietary brand font).
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Anton: free stand-in for Formula Condensed Bold — used for promo headlines
// like "BIG WEEKENDER" / "PLAY NOW / GET SPICY".
const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: ["400"],
});

// Single source for the home-screen / favicon artwork. The PNG
// lives at /public/assets/rewards/app_icon.png — 536×536 RGBA, big
// enough that iOS (180px) and Android (192/512px) both downscale
// cleanly without needing pre-rendered variants.
const APP_ICON = "/assets/rewards/app_icon.png";

export const metadata: Metadata = {
  title: "MrQ — Q3 Prototype",
  description: "MrQ mobile app concept",
  // PWA / Add-to-Home-Screen
  manifest: "/manifest.webmanifest",
  icons: {
    // Tab favicon + generic icon for browsers that don't read the
    // manifest (older desktop Safari, etc.).
    icon: [{ url: APP_ICON, type: "image/png" }],
    // iOS Add-to-Home-Screen. Safari rounds the corners itself, so
    // ship a full-bleed square — no need to pre-round.
    apple: [{ url: APP_ICON, sizes: "180x180", type: "image/png" }],
    // Shortcut icon for legacy crawlers / RSS readers.
    shortcut: [APP_ICON],
  },
  // OpenGraph / Twitter card — same source PNG as the favicon so
  // share previews on iMessage, Slack, Discord, Twitter, etc. all
  // use the brand app icon.
  openGraph: {
    type: "website",
    title: "MrQ — Q3 Prototype",
    description: "MrQ mobile app concept",
    siteName: "MrQ",
    images: [
      {
        url: APP_ICON,
        width: 536,
        height: 536,
        alt: "MrQ",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "MrQ — Q3 Prototype",
    description: "MrQ mobile app concept",
    images: [APP_ICON],
  },
  appleWebApp: {
    capable: true,
    title: "MrQ",
    // "black-translucent" lets the app content extend behind the status bar,
    // matching how native iOS apps look when launched from home screen.
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  // `viewport-fit: cover` lets the app draw under the iOS notch / home indicator.
  viewportFit: "cover",
  themeColor: "#0a2ecb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${anton.variable} h-full antialiased`}>
      <body className="min-h-full">
        {/* ShellProvider holds side-nav + splash state that survives
            navigation. AppShell renders the mobile-frame + brand bar +
            bottom nav + side nav + splash — wrapping the per-route
            `children` so every page inherits the same chrome. */}
        <ShellProvider>
          <AppShell>{children}</AppShell>
        </ShellProvider>
        <Script id="spectre-beacon" strategy="afterInteractive">
          {SPECTRE_BEACON}
        </Script>
      </body>
    </html>
  );
}
