/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                // matching all API routes
                source: '/(.*)',
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
                    { key: "Access-Control-Allow-Methods", value: "GET" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ]
            }
        ]
    },
    images: {
        domains: ['images.ctfassets.net'],
      },    
    experimental: {
    outputFileTracingIncludes: {
        '/reggie/*': ['./svgs/**/*'],
        '/ora/*': ['./assets/**/*'],

    },
    },      
}

module.exports = nextConfig;
