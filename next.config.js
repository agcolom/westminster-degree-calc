/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/westminster-degree-calc',
  assetPrefix: '/westminster-degree-calc',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig 