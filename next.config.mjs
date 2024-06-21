/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' https://js.stripe.com 'sha256-MhJXriqz7P/nM/kr2Yx1NMDOvpWN8q2Gj8Kfm89ipjk=' 'sha256-Rs7zoycEGz8Aoh9NxrpDQaZ9oV27ZjlGKVOcL1V1ntA=' 'sha256-o88MtMv1rAF5kHVN1MN9wurclcppRPkgCsYo4Ilowcs='; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-src 'self' https://js.stripe.com;",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
