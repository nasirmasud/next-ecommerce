import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // Add this line for static export
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
      },
    ],
  },
};

export default nextConfig;
