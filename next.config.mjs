/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_CDN_URL: process.env.CDN_URL,
        NEXT_PUBLIC_WEB_URL: process.env.WEB_URL,
        NEXT_PUBLIC_API_BASE_URL: process.env.API_BASE_URL,
    },
    reactStrictMode: false,
    experimental: {
        optimizePackageImports: [
            'framer-motion',
            'react-hot-toast',
            'clsx',
            'class-variance-authority',
            'tailwind-merge',
            '@radix-ui/react-switch',
            '@radix-ui/react-label',
            '@radix-ui/react-dialog',
            '@radix-ui/react-slot',
        ],
    },
};

export default nextConfig;
