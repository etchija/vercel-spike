import type { NextConfig } from "next";

// Build-time only. Changing BACKEND_ORIGIN requires a redeploy, not a refresh.
// Unset → same app /api (local Stage A). Set → other Vercel origin (Stage C).
const backendOrigin = process.env.BACKEND_ORIGIN?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: backendOrigin
          ? `${backendOrigin}/api/:path*`
          : "/api/:path*",
      },
    ];
  },
};

export default nextConfig;
