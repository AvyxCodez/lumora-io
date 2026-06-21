/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Allow large file uploads through Server Actions / route handlers
  },
};

export default nextConfig;
