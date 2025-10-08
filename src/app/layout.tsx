
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/context/providers';
import AppLayout from '@/components/layout/app-layout';
import { ThemeProvider } from '@/context/theme-provider';

// Setup font with next/font
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
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* The font link in head is now handled by next/font, so we can remove it */}
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <AppLayout>{children}</AppLayout>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
