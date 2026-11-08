/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=15552000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
];

const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
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
};

export default nextConfig;