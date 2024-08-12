/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_CDN_URL: process.env.CDN_URL,
        NEXT_PUBLIC_WEB_URL: process.env.WEB_URL,
    },
};

export default nextConfig;
