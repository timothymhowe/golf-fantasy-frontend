/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['lh3.googleusercontent.com',
            'firebasestorage.googleapis.com'
        ]
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/dashboard',
                permanent: true,
            },
            // More redirects...
        ]
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://127.0.0.1:5000/:path*',
            },
            // More rewrites...
        ]
    },
}

export default nextConfig;