import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tacodog.onrender.com';
  
  return {
    rules: [
      {
        userAgent: '*',
        disallow: ['/api/', '/chat'],
      },
      {
        userAgent: 'Googlebot',
        disallow: ['/api/', '/chat'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
