import type { NextConfig } from "next";

export function createNextConfig(env: NodeJS.ProcessEnv): NextConfig {
  return {
    reactStrictMode: true,
    distDir: env.NEXT_DIST_DIR || ".next",
  };
}

const nextConfig = createNextConfig(process.env);

export default nextConfig;
