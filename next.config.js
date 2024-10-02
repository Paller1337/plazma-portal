const webpack = require('webpack');
const withPlugins = require('next-compose-plugins');
const withPWA = require('next-pwa');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  images: {
    domains: ['strapi.kplazma.ru', '192.168.1.19', 'userapi.com'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/dates'
    ],
  },
  webpack: (config, { isServer }) => {
    // Ваши настройки webpack
    return config;
  },
};

module.exports = withPlugins([
  [withPWA, {
    pwa: {
      dest: 'public',
      //   disable: process.env.NODE_ENV === 'development',
    },
  }],
  withBundleAnalyzer,
], nextConfig);
