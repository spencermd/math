import type { NextConfig } from "next";

// GitHub Pages serves the site from a sub-path (https://<user>.github.io/math), so the
// Pages build sets BASE_PATH=/math. Local dev and ordinary builds leave it unset.
const basePath = process.env.BASE_PATH || undefined;

const nextConfig: NextConfig = {
  // The app is fully static: progress lives in the browser, so it exports to plain files.
  output: "export",
  basePath,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
