/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Silence Next.js workspace root detection warning
  outputFileTracingRoot: require('path').join(__dirname),
}

module.exports = nextConfig