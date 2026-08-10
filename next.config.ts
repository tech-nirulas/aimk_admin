import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@aimk/permissions", "@aimk/image-spec"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.angelsinmykitchen.in",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
