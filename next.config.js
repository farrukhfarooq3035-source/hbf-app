/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serve logo as favicon so /favicon.ico doesn't 404
  async redirects() {
    return [{ source: '/favicon.ico', destination: '/logo.png', permanent: false }];
  },
  async headers() {
    return [
      {
        source: '/menu',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
      {
        source: '/auth/callback',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
      {
        source: '/auth/continue',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
    ];
  },
  // Unoptimized for simpler deployment (Vercel/Netlify compatible)
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

module.exports = nextConfig;
