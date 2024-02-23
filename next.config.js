const webpack = require('webpack');
const withPlugins = require('next-compose-plugins');
const withPWA = require('next-pwa');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  images: {
    domains: ['strapi.kplazma.ru', '192.168.1.19'],
  },
  experimental: {
    optimizePackageImports: ['@mantine/core'],
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
