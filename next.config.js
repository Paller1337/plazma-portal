const webpack = require('webpack')
const withPlugins = require('next-compose-plugins');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['strapi.kplazma.ru', '192.168.1.19'],
    },
    // webpack: (config, { isServer }) => {
    //     // Добавьте плагин webpack-remove-debug только для продакшн-сборки и клиентской части
    //     if (!isServer) { // Это для клиентской части
    //         config.resolve.alias['debug'] = false; // Исключить debug
    //         config.plugins.push(
    //             new webpack.DefinePlugin({
    //                 'process.env.DEBUG': JSON.stringify(false),
    //             })
    //         );
    //     }
    //     return config; // Важно возвращать измененную конфигурацию
    // },
    // Удалите experimental, если они не поддерживаются в вашей версии Next.js
    experimental: {
        optimizePackageImports: ['@mantine/core'],
        // fallbackNodePolyfills: false,
    },
};

module.exports = withPlugins([
    withBundleAnalyzer,
    // Можно добавлять другие плагины сюда
], nextConfig);
