
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        id: 'placehold',
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        id: 'picsum',
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        id: 'stripe',
        protocol: 'https'
,        hostname: 'files.stripe.com',
        port: '',
        pathname: '/**',
      },
      {
        id: 'europoppers',
        protocol: 'https',
        hostname: 'www.euro-poppers.eu',
        port: '',
        pathname: '/**',
      },
      {
        id: 'jointoyou',
        protocol: 'https',
        hostname: 'jointoyou.it',
        port: '',
        pathname: '/**',
      },
      {
        id: 'mypoppers',
        protocol: 'https',
        hostname: 'mypoppers.eu',
        port: '',
        pathname: '/**',
      },
      {
        id: 'abcparty',
        protocol: 'https',
        hostname: 'www.abcparty.nl',
        port: '',
        pathname: '/**',
      },
      {
        id: 'mlstatic',
        protocol: 'https',
        hostname: 'http2.mlstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        id: 'monpapier',
        protocol: 'https',
        hostname: 'monpapier.fr',
        port: '',
        pathname: '/**',
      },
      {
        id: 'mistersmoke',
        protocol: 'https',
        hostname: 'www.mistersmoke.com',
        port: '',
        pathname: '/**',
      },
      {
        id: 'poppersdiscount',
        protocol: 'https',
        hostname: 'poppers-discount.fr',
        port: '',
        pathname: '/**',
      },
      {
        id: 'svgrepo',
        protocol: 'https',
        hostname: 'www.svgrepo.com',
        port: '',
        pathname: '/**',
      },
      {
        id: 'poppers-espana',
        protocol: 'https',
        hostname: 'www.poppers-espana.es',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
