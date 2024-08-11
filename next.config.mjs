/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_CDN_URL: process.env.CDN_URL,
    },
};

export default nextConfig;
