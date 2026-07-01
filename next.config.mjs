/** @type {import('next').NextConfig} */

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      object-src 'none';

      img-src 'self' data: blob:
        https://firebasestorage.googleapis.com
        https://picsum.photos
        https://placehold.co
        https://www.poppers-espana.es
        https://files.stripe.com
        https://www.euro-poppers.eu
        https://jointoyou.it
        https://mypoppers.eu
        https://www.abcparty.nl
        https://http2.mlstatic.com
        https://monpapier.fr
        https://www.mistersmoke.com
        https://poppers-discount.fr
        https://www.svgrepo.com
        https://images.unsplash.com
        https://storage.googleapis.com;

      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.clarity.ms;
      style-src 'self' 'unsafe-inline';
      connect-src 'self' https:;
      font-src 'self' data: https:;
      frame-src 'self' https://js.stripe.com;
    `
      .replace(/\n/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim(),
  },
];

const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'www.poppers-espana.es', pathname: '/**' },
      { protocol: 'https', hostname: 'files.stripe.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.euro-poppers.eu', pathname: '/**' },
      { protocol: 'https', hostname: 'jointoyou.it', pathname: '/**' },
      { protocol: 'https', hostname: 'mypoppers.eu', pathname: '/**' },
      { protocol: 'https', hostname: 'www.abcparty.nl', pathname: '/**' },
      { protocol: 'https', hostname: 'http2.mlstatic.com', pathname: '/**' },
      { protocol: 'https', hostname: 'monpapier.fr', pathname: '/**' },
      { protocol: 'https', hostname: 'www.mistersmoke.com', pathname: '/**' },
      { protocol: 'https', hostname: 'poppers-discount.fr', pathname: '/**' },
      { protocol: 'https', hostname: 'www.svgrepo.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
    ],
  },
  webpack: (config) => {
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
    ];

    return config;
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;