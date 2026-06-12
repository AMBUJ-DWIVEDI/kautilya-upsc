import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js to bundle these CJS-only packages via Node.js require()
  // instead of trying to use their ESM builds (which Turbopack can't handle)
  serverExternalPackages: ['pdf-parse'],
};

export default nextConfig;
