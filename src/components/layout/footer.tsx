'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Footer() {
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const isAdminPath = pathname.startsWith('/admin');
    const isBlogPath = pathname.startsWith('/blog');
    const isCheckout = pathname.startsWith('/checkout');

    // Hide footer on admin login page
    if (isAdminPath && pathname.includes('/login')) {
      return null;
    }
    
    // Fallback for SSR to prevent layout shifts, no extra padding needed here
    if (!isMounted) {
        return (
            <footer className="border-t border-border/40 mt-16 pt-12 pb-8">
                <div className="container">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground text-center md:text-left">
                    &copy; {new Date().getFullYear()} Popper España. Todos los derechos reservados.
                    </p>
                    <nav className="flex items-center gap-4">
                    <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">
                        Blog
                    </Link>
                    </nav>
                </div>
                </div>
          </footer>
        );
    }

    return (
      <footer className="border-t border-border/40 mt-16 pt-12 pb-8">
        {/* Add padding-right to the container to avoid overlapping with floating cart button */}
        <div className="container pr-24">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
             <p className="text-sm text-muted-foreground text-center md:text-left">
              &copy; {new Date().getFullYear()} Popper España. T
              {isBlogPath ? (
                <Link href="/admin/login" className="hover:text-primary">o</Link>
              ) : (
                'o'
              )}
              dos los derechos reservados.
            </p>
            <nav className="flex items-center gap-4">
               <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">
                Blog
              </Link>
              {isAdminPath && (
                <Link href="/admin" className="text-sm text-muted-foreground hover:text-primary">
                    Admin
                </Link>
              )}
            </nav>
          </div>
        </div>
      </footer>
    );
  }
