/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // ← Add this
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'example.com' },
      { protocol: 'https', hostname: 'placeholder.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      {
        protocol: 'https',
        hostname: 'amzn-artwork-images.s3.eu-north-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'amzn-artwork-images.s3.undefined.amazonaws.com',
      },
      { protocol: 'https', hostname: 'www.thefilmcatalogue.com' },
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
      },
      { protocol: 'https', hostname: 'cdn.example.com' },
      { protocol: 'https', hostname: 'i.postimg.cc' },
      { protocol: 'https', hostname: 'wallpapercave.com' },
      { protocol: 'https', hostname: 'i.pinimg.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:8080/api/:path*'
            : 'https://modfanart-9x6b.onrender.com/api/:path*',
      },
    ];
  },

  ...(process.env.NODE_ENV === 'production'
    ? {
        poweredByHeader: false,
        compiler: {
          removeConsole: { exclude: ['error'] },
        },
      }
    : {
        webpack: (config) => {
          config.optimization.minimize = false;
          return config;
        },
      }),
};

export default nextConfig;
