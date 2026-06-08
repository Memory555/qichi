/** @type {import('next').NextConfig} */

// 通过环境变量 BUILD_TARGET 控制构建目标：
//   - 默认 / 'vercel' → 正常 SSR/ISR 构建，部署 Vercel
//   - 'static'       → output: 'export'，导出纯静态文件，给 Capacitor 打包 APK 用
const target = process.env.BUILD_TARGET ?? 'vercel';

const nextConfig = {
  reactStrictMode: true,
  ...(target === 'static' && {
    // 静态导出模式（APK 打包）
    output: 'export',
    // 静态导出不支持 next/image 的优化，关掉
    images: { unoptimized: true },
    // 静态导出不支持后缀路径斜杠以外的特殊路由，保险起见
    trailingSlash: true,
  }),
  ...(target !== 'static' && {
    images: { unoptimized: false },
  }),
};

export default nextConfig;
