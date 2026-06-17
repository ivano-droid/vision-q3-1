import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Pin Turbopack's project root to this directory. Otherwise Next walks
// up and finds a stray ~/package-lock.json, wrongly treating the home
// folder as the workspace root (causes a dev-mode Turbopack panic).
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
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
