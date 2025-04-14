/** @type {import('next').NextConfig} */
const nextConfig = {
    // Asegura que las rutas API funcionen correctamente
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
                    { key: 'Pragma', value: 'no-cache' },
                    { key: 'Expires', value: '0' },
                ],
            },
        ];
    },
    // Otras configuraciones...
};

module.exports = nextConfig;
