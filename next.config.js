/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['your-firebase-storage-domain.com'],
        unoptimized: true,
    },
    output: 'export',
    basePath: process.env.GITHUB_ACTIONS ? '/nmsportal' : '',
    assetPrefix: process.env.GITHUB_ACTIONS ? '/nmsportal/' : '',
}

module.exports = nextConfig