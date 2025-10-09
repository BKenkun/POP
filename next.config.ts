
import type {NextConfig} from 'next';

// Forcing a server restart to recognize new routes. This comment will trigger it again.
const nextConfig: NextConfig = {
  devIndicators: {
    allowedDevOrigins: ['*'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    // This is the "special" client-side user that will see the secret link to the admin login page.
    // They must first register and log in like a normal user.
    NEXT_PUBLIC_CLIENT_ADMIN_EMAIL: 'maryandpopper@gmail.com',
    
    // These are the final admin credentials for the second verification step on the /verify page.
    ADMIN_EMAIL: 'admin@purorush.com',
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

export default nextConfig;
