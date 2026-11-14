/** @type {import('next').NextConfig} */
// TECH-02: no security headers were sent on any page. frame-ancestors/XFO stop
// /login and /signup being framed (clickjacking). A full script CSP is left
// for a follow-up because Firebase, Stripe and Elfsight need an allowlist
// that should be tested in staging first.
const securityHeaders = [
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests" },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://js.stripe.com")' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  async redirects() {
    // Legacy / mistyped routes that were linked from the app or shared
    // externally (ART-01, ART-12, AUTH-09, BRD-03, ART-06, FAN-09).
    return [
      { source: '/opportunities', destination: '/explore/contests', permanent: false },
      { source: '/brands/:slug', destination: '/brand/:slug', permanent: true },
      { source: '/profile/edit', destination: '/settings', permanent: false },
      { source: '/brand/verify', destination: '/dashboard', permanent: false },
      { source: '/brand', destination: '/dashboard', permanent: false },
      { source: '/dashboard/brand', destination: '/dashboard', permanent: false },
      { source: '/dashboard/brand/:slug', destination: '/dashboard?brand=:slug', permanent: false },

      // ── Dashboard URL shortening ────────────────────────────────────
      // /(role)/(username|brand)/route  ->  /dashboard/route
      // Most specific first. Brand links keep the brand via ?brand=<slug>,
      // which hooks/use-active-brand.ts picks up.
      { source: '/artist/:u/my-artworks/:rest*', destination: '/dashboard/artworks/:rest*', permanent: true },
      { source: '/artist/:u/licensing-earnings', destination: '/dashboard/licensing', permanent: true },
      { source: '/artist/:u/:rest*', destination: '/dashboard/:rest*', permanent: true },
      { source: '/brand-manager/:slug/opportunities/create', destination: '/dashboard/opportunities/new?brand=:slug', permanent: true },
      { source: '/brand-manager/:slug/licensing-requests', destination: '/dashboard/licensing?brand=:slug', permanent: true },
      { source: '/brand-manager/:slug/:rest*', destination: '/dashboard/:rest*?brand=:slug', permanent: true },
      { source: '/brand-manager', destination: '/dashboard', permanent: true },
      { source: '/seller/:u/products/:rest*', destination: '/dashboard/store/products/:rest*', permanent: true },
      { source: '/seller/:u/:rest*', destination: '/dashboard/:rest*', permanent: true },
      // /judge/invite/<token> is a public page and must keep working.
      { source: '/judge/:u((?!invite$)[^/]+)/contest/:id/:rest*', destination: '/dashboard/judging/:id/:rest*', permanent: true },
      { source: '/judge/:u((?!invite$)[^/]+)/results/:id', destination: '/dashboard/judging/:id/results', permanent: true },
      { source: '/judge/:u((?!invite$)[^/]+)/opportunities', destination: '/dashboard/judging/opportunities', permanent: true },
      { source: '/judge/:u((?!invite$)[^/]+)', destination: '/dashboard/judging', permanent: true },
      { source: '/notifications', destination: '/settings', permanent: false },
      { source: '/admin/:path*', destination: '/', permanent: false },
      { source: '/compliance/:path*', destination: '/', permanent: false },
    ];
  },
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
      { protocol: 'https', hostname: 'pub-bc028dede49c432da3e40f2c5fd199f4.r2.dev' },
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
      { protocol: 'https', hostname: 'media.modfanofficial.com' },
      { protocol: 'https', hostname: 't3.ftcdn.net' },
      { protocol: 'https', hostname: 't4.ftcdn.net' },
      { protocol: 'https', hostname: 'img.freepik.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' },
    ],
  },
};

export default nextConfig;