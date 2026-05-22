import type { Metadata, Viewport } from "next";
import { Manrope, Anton } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "MrQ — Concept",
  description: "MrQ mobile app concept",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a2ecb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${anton.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
