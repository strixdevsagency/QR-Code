import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Strix QR — Vector QR & 2D Matrix Engine',
    short_name: 'Strix QR',
    description: 'Permanent vector QR code generator and real-time optical camera scanner by StrixDevs.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
