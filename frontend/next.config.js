/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: [
      'example.com',
      'placeholder.com',
      'via.placeholder.com',
      'images.unsplash.com',
      'amzn-artwork-images.s3.eu-north-1.amazonaws.com',
      'amzn-artwork-images.s3.undefined.amazonaws.com',
      'www.thefilmcatalogue.com',
      'hebbkx1anhila5yf.public.blob.vercel-storage.com',
      'cdn.example.com',
      'i.postimg.cc',
      // ↑ good — add your real image hosting domains here (e.g. cloudinary, supabase, s3, etc.)
      // If using Next.js Image with remote images, you can also use remotePatterns (more flexible):
      // remotePatterns: [{ protocol: 'https', hostname: '**' }], // ← wildcard (less secure)
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
