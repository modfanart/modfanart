/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'placeholder.com',
      'via.placeholder.com',
      'hebbkx1anhila5yf.public.blob.vercel-storage.com', // Add this
    ],
  },
  // Add environment-specific configuration
  ...(process.env.NODE_ENV === 'development'
    ? {
        // Development-only settings
        webpack: (config) => {
          // Enable detailed error messages in development
          config.optimization.minimize = false;
          return config;
        },
      }
    : {
        // Production-only settings
        poweredByHeader: false,
        // Optimize for production
        compiler: {
          removeConsole: {
            exclude: ['error'],
          },
        },
      }),
};

module.exports = nextConfig;
