/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.",
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // SEO optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  // Enable static optimization
  reactStrictMode: true,
  // Optimize fonts
  optimizeFonts: true,
};

export default nextConfig;

// LEARN MORE https://nextjs.org/docs/pages/api-reference/components/image#remotepatterns
