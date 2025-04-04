/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    loader: "default",
    path: "/",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;

// LEARN MORE https://nextjs.org/docs/pages/api-reference/components/image#remotepatterns
