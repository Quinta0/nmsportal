/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['nmsportal-9ac18.firebaseapp.com'],
    },
    output: 'export',
    basePath: process.env.GITHUB_ACTIONS && '/nmsportal',
    assetPrefix: process.env.GITHUB_ACTIONS && '/nmsportal/',
}

module.exports = nextConfig