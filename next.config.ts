import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the dev-mode indicator overlay so screenshots stay clean.
  devIndicators: false,
  images: {
    // Allow local SVG assets in /public to be served via next/image.
    // Safe here because all SVGs are first-party assets pulled from Figma.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
