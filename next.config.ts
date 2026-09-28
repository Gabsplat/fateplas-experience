import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.FATEPLAS_STATIC_EXPORT === "true"
    ? { output: "export", trailingSlash: true, images: { unoptimized: true } }
    : {}),
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  ...(process.env.FATEPLAS_PROJECT_ROOT
    ? { turbopack: { root: process.env.FATEPLAS_PROJECT_ROOT } }
    : {}),
  poweredByHeader: false,
  devIndicators: false,
  allowedDevOrigins: ["omarchy.tailff08b5.ts.net"],
};

export default nextConfig;
