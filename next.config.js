/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['nmsportal-9ac18.firebaseapp.com'],
        unoptimized: true,
    },
    output: 'export',
    basePath: process.env.GITHUB_ACTIONS ? '/nmsportal' : '',
    assetPrefix: process.env.GITHUB_ACTIONS ? '/nmsportal/' : '',
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
            };
        }
        return config;
    },
}

module.exports = nextConfig