/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['nmsportal-9ac18.firebaseapp.com'],
    },
    output: 'export',
    basePath: '/nmsportal',
    assetPrefix: '/nmsportal/',
}

module.exports = nextConfig