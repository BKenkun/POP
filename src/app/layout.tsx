import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/context/providers';
import { ReactNode, Suspense } from 'react';

import { getSiteUrl, SITE_NAME } from '@/lib/seo';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'PuroRush | Premium Aromas',
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'The official store for premium quality aromas, leather cleaners, custom packs, and discreet 24/48h shipping across Spain and Europe.',
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'PuroRush | Premium Aromas',
    description:
      'Explore our curated selection of premium aromas, leather cleaners, and custom packs with fast, discreet 24/48h delivery.',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PuroRush | Premium Aromas',
    description:
      'Explore our curated selection of premium aromas, leather cleaners, and custom packs with fast, discreet 24/48h delivery.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: siteUrl,
    email: 'info@comprarpopperonline.com',
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/products?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className={`${inter.variable} font-body antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Suspense>
          <Providers>{children}</Providers>
        </Suspense>
        <script async type='text/javascript' src='https://static.klaviyo.com/onsite/js/WdHvpw/klaviyo.js?company_id=WdHvpw'></script>
        <script type="text/javascript" dangerouslySetInnerHTML={{ __html: `
!function(){if(!window.klaviyo){window._klOnsite=window._klOnsite||[];try{window.klaviyo=new Proxy({},{get:function(n,i){return"push"===i?function(){var n;(n=window._klOnsite).push.apply(n,arguments)}:function(){for(var n=arguments.length,o=new Array(n),w=0;w<n;w++)o[w]=arguments[w];var t="function"==typeof o[o.length-1]?o.pop():void 0,e=new Promise((function(n){window._klOnsite.push([i].concat(o,[function(i){t&&t(i),n(i)}]))}));return e}}})}catch(n){window.klaviyo=window.klaviyo||[],window.klaviyo.push=function(){var n;(n=window._klOnsite).push.apply(n,arguments)}}}}();
        `}} />
      </body>
    </html>
  );
}
