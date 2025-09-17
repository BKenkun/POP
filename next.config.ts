
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  env: {
    ADMIN_EMAIL: 'maryandpopper@gmail.com',
    ADMIN_PASSWORD: '/(IYUKMN$7(I)=rb8',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    KLAVIYO_API_KEY: process.env.KLAVIYO_API_KEY,
    KLAVIYO_LIST_ID: process.env.KLAVIYO_LIST_ID,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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
        hostname: 'www.poppers-espana.es',
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
    ],
  },
};

export default nextConfig;
