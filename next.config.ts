import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  typedRoutes: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.alias ??= {};
    config.resolve.alias["@"] = path.join(__dirname, "src");
    return config;
  },
};

export default nextConfig;
