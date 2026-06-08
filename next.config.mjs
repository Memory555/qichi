/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // 我们的资源都是同源 public/，无需远程域名白名单
    unoptimized: false,
  },
};

export default nextConfig;
