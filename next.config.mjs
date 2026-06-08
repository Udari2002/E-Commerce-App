/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        turbopack: {
            root: '.',
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'raw.githubusercontent.com',
                pathname: '**',
            },
        ],
    },
};

export default nextConfig;
