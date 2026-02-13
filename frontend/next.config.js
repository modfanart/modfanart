/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      {
        protocol: 'https',
        hostname: 'placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'amzn-artwork-images.s3.eu-north-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'www.thefilmcatalogue.com',
      },
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
      },
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
      },
    ],
  },

  // ── Best way to proxy /api calls to backend ──────────────────────────────
  // This makes client → /api/artwork → automatically forwarded to backend
  // → No CSP connect-src changes needed (same origin)
  // → Works great in dev + production
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:8080/api/:path*'
            : 'https://modfanart.onrender.com/api/:path*', // ← CHANGE THIS!
      },
    ];
  },

  // Optional: clean production build
  ...(process.env.NODE_ENV === 'production'
    ? {
        poweredByHeader: false, // hides "x-powered-by: Next.js"
        compiler: {
          removeConsole: {
            exclude: ['error'], // keep console.error in production
          },
        },
      }
    : {
        // Dev-only tweaks (your original suggestion)
        webpack: (config) => {
          config.optimization.minimize = false;
          return config;
        },
      }),

  // Optional: if you want stricter image optimization in production
  // output: 'standalone', // useful for Docker/self-hosting
};

module.exports = nextConfig;
