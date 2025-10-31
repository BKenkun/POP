
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/context/providers';
import { ReactNode, Suspense } from 'react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Popper Online',
  description: 'La tienda oficial de productos Popper en España.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es" className="light" suppressHydrationWarning>
      <head>
        {/* The font link in head is now handled by next/font */}
      </head>
      <body className={`${inter.variable} font-body antialiased`}>
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
