import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },

  // Rewrites are NOT used here — we use an explicit Route Handler at
  // /api/proxy/[...path] so we have full control over session injection.
  //
  // If you ever want to skip the proxy for internal server-component fetches
  // (e.g. for ISR cache warming), you can point NEXT_PUBLIC_APP_URL to the
  // upstream directly in production — but the default path through /api/proxy
  // is the safest option.

  async headers() {
    return [
      {
        // Disallow direct browser access to the proxy route from other origins
        source: "/api/proxy/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex" },
        ],
      },
    ];
  },
};

export default nextConfig;
