/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_CDN_URL: process.env.CDN_URL,
        NEXT_PUBLIC_WEB_URL: process.env.WEB_URL,
    },
    reactStrictMode: false,
    experimental: {
        optimizePackageImports: [
            'framer-motion',
            'react-hot-toast',
            'clsx',
            'class-variance-authority',
            'tailwind-merge',
        ],
    },
};

export default nextConfig;
