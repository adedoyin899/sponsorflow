/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {},
  async rewrites() {
    return [
      {
        source: "/dashboard/:path+",
        destination: "/:path+",
      },
    ];
  },
};

export default nextConfig;

