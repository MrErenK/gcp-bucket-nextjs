/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_CDN_URL: process.env.CDN_URL,
    NEXT_PUBLIC_WEB_URL: process.env.WEB_URL,
    NEXT_PUBLIC_ADMIN_API_KEY: process.env.ADMIN_API_KEY,
    NEXT_PUBLIC_MAINTENANCE_MODE: process.env.MAINTENANCE_MODE,
    NEXT_PUBLIC_REASON_FOR_MAINTENANCE: process.env.REASON_FOR_MAINTENANCE,
  },
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "react-hot-toast",
      "clsx",
      "class-variance-authority",
      "tailwind-merge",
      "@radix-ui/react-switch",
      "@radix-ui/react-label",
      "@radix-ui/react-dialog",
      "@radix-ui/react-slot",
    ],
  },
  redirects: async () => {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/download-script",
        destination: "/api/download-script",
        permanent: true,
      },
      {
        source: "/upload-script",
        destination: "/api/download-script",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
