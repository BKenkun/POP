
'use client';

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

// This layout is specific to login/register pages to avoid showing
// certain elements like the floating action buttons.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {children}
            </main>
            <Footer />
        </div>
    );
}
