/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "results.deepinfra.com",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
