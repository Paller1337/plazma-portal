const webpack = require('webpack');
const withPlugins = require('next-compose-plugins');
const withPWA = require('next-pwa');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://portal-plazma.ru.tuna.am',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,DELETE,OPTIONS', // Разрешить нужные методы
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With,Content-Type,Authorization', // Разрешить нужные заголовки
          },
        ],
      },
    ];
  },
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
