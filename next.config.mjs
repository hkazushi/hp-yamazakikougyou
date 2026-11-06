/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // Vercel 上のビルドは自動で確認用になる（PHP が動かないのでブラウザ内で完結させる）
  env: {
    NEXT_PUBLIC_REVIEW: process.env.VERCEL ? '1' : process.env.NEXT_PUBLIC_REVIEW || '',
  },
};

export default nextConfig;
