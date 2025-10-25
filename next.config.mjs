/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_API_URL
          ? new URL(process.env.NEXT_PUBLIC_API_URL).hostname
          : "example.com",
      },
    ],
  },
};

export default nextConfig;
