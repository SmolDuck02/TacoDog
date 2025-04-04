/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.",
      },
    ],
  },
};

export default nextConfig;

// LEARN MORE https://nextjs.org/docs/pages/api-reference/components/image#remotepatterns
