import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
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
    ],
  },
  devIndicators: {
    allowedDevOrigins: [
        '*.cloudworkstations.dev',
    ],
  },
  env: {
    STRIPE_SECRET_KEY: 'sk_test_51S2BOxBKkrkkTRlpCTYMcfwxYjFECPRK5l7r1pylfxQzp25xGkubkAEqKIZHTu5tWExLk4Dwll7NX2OebXvzAC5c00RYcxcdWa',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  },
};

export default nextConfig;
