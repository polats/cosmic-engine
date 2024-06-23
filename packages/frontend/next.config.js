/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputFileTracingIncludes: {
        '/': ['./assets/**/*'],
    },
    },        
}

module.exports = nextConfig
