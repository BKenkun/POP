
const nextConfig = {
  async rewrites() {
    return {
      // These rewrites are only active in development
      beforeFiles: [
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'localhost',
            },
          ],
          destination: 'http://localhost:9002/:path*',
        },
      ],
    };
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    // These are the final admin credentials for the second verification step on the /verify page.
    ADMIN_EMAIL: 'maryandpopper@gmail.com',
    ADMIN_PASSWORD: 'PowerAdmin123!',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'files.stripe.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.euro-poppers.eu',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'jointoyou.it',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mypoppers.eu',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.abcparty.nl',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'http2.mlstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'monpapier.fr',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.mistersmoke.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'poppers-discount.fr',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.svgrepo.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

module.exports = nextConfig;
