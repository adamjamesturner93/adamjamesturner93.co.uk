import { policy } from './lib/site.mjs';
const config = {
  allowedDevOrigins: ['**.ngrok-free.app', '**.ngrok.app', '**.ngrok.io'],
  async redirects() {
    return [
      { source: '/writing', destination: '/blog', permanent: true },
      {
        source: '/writing/:path*',
        destination: '/blog/:path*',
        permanent: true,
      },
    ];
  },
  async headers() {
    return policy().index
      ? []
      : [
          {
            source: '/:path*',
            headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
          },
        ];
  },
};

export default config;
