/** @type {import('next').NextConfig} */
const nextConfig = {
  // Unoptimized so Cloudflare deploy works without Images binding (avoids resvg.wasm error on Windows)
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

// Cloudflare local dev integration (optional)
try {
  const { initOpenNextCloudflareForDev } = require('@opennextjs/cloudflare');
  initOpenNextCloudflareForDev();
} catch (_) {
  // @opennextjs/cloudflare not installed or not in dev
}

module.exports = nextConfig;
