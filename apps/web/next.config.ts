import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Prevent webpack from bundling native Node modules used only in API routes
  serverExternalPackages: ["better-sqlite3"],
  // Silence monorepo root detection warning
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
