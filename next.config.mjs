/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aísla la caché de vista previa (.next-dev) de la compilación de producción (.next)
  distDir: process.env.NEXT_DEV_DIST_DIR || '.next',
  output: 'standalone',
  experimental: {
    cpus: 1,
    workerThreads: false,
    webpackBuildWorker: true,
  },
  webpack: (config, { dev }) => {
    // Reduce drásticamente el pico de RAM en next build evitando retener caché pesada en memoria
    if (!dev) {
      config.cache = false;
    }
    return config;
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
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: '/images/:path*',
          destination: 'https://storage.googleapis.com/purorush.appspot.com/images/:path*',
        },
      ],
    };
  },
};

export default nextConfig;