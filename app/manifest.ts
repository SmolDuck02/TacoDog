import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TacoDog - AI-Powered Social Messaging',
    short_name: 'TacoDog',
    description: 'Connect with friends and chat with TacoDog, your AI assistant. Real-time messaging, video calls, and intelligent conversations.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
