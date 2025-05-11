/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: '/api/subscription/webhook',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-store, must-revalidate',
                    },
                ],
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: '/api/subscription/webhook',
                destination: '/api/subscription/webhook',
            },
        ];
    },
};

module.exports = nextConfig; 