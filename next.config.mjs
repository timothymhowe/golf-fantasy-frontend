/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
            },
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
            },
        ],
    },
    async rewrites() {
        return [
            {

                // this is for local development
                // source: '/api/:path*',
                // destination: 'http://127.0.0.1:5001/:path*',
                source: '/api/:path*',
                destination: 'https://fantasy-golf-staging-371710577879.us-central1.run.app/:path*',
            },
            //
        ]
    },
}

export default nextConfig;