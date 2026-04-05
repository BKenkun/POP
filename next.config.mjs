/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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