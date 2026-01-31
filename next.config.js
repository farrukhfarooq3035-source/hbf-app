/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serve logo as favicon so /favicon.ico doesn't 404
  async redirects() {
    return [{ source: '/favicon.ico', destination: '/logo.png', permanent: false }];
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
