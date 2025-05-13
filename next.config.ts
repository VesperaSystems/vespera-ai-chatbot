import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: false,
    turbo: false,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Suppress punycode deprecation warning
    config.ignoreWarnings = [{ module: /node_modules\/punycode/ }];
    return config;
  },
};

export default nextConfig;
