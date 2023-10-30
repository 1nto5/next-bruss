/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // serverActions: true,
  },
  exclude: ['./app/cs/**'],
};

module.exports = nextConfig;
