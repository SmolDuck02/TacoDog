/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.example.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;

// LEARN MORE https://nextjs.org/docs/pages/api-reference/components/image#remotepatterns
