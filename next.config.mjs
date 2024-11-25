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