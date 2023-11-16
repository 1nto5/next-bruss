/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['http://localhost', 'http://10.27.10.127'],
    },
  },
};

module.exports = nextConfig;
