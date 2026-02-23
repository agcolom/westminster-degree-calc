/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  basePath: isProd ? '/westminster-degree-calc' : '',
  assetPrefix: isProd ? '/westminster-degree-calc' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
