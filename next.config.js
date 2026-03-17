/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Silence Next.js workspace root detection warning
  outputFileTracingRoot: require('path').join(__dirname),
}

module.exports = nextConfig