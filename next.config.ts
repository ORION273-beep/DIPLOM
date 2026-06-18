import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const backendUrl = (process.env.BACKEND_URL || "http://localhost:4000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Fix wrong workspace root when another package-lock.json exists higher in the tree
  // (e.g. ~/package-lock.json) — prevents Turbopack panics on page compile.
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets.change.org" },
      { protocol: "https", hostname: "upload-os-bbs.hoyolab.com" },
      { protocol: "https", hostname: "cdn-www.bluestacks.com" },
      { protocol: "https", hostname: "brawlstars.inbox.supercell.com" },
      { protocol: "https", hostname: "ir.ozone.ru" },
      { protocol: "https", hostname: "d1lss44hh2trtw.cloudfront.net" },
      { protocol: "https", hostname: "kupikod.com" },
      { protocol: "https", hostname: "images.example.com" },
      { protocol: "https", hostname: "cdn.kupikod.com" },
      { protocol: "https", hostname: "preview.redd.it" },
      { protocol: "https", hostname: "avatars.mds.yandex.net" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
