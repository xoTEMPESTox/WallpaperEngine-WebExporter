/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_ENABLE_DOWNLOADER: process.env.NEXT_PUBLIC_ENABLE_DOWNLOADER || 'false',
  },
  async rewrites() {
    return [
      {
        source: '/demo/:id',
        destination: '/demos/:id/index.html',
      },
    ];
  },
};

module.exports = nextConfig;