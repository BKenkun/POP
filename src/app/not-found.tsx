'use client'

import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'
import Link from 'next/link'

// Ensure dynamic rendering (avoids prerender crash)
export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <h1 className="text-9xl font-bold text-primary">404</h1>
      <h2 className="mt-4 text-3xl font-semibold">Página no encontrada</h2>
      <p className="mt-2 text-muted-foreground">
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          Volver a la página principal
        </Link>
      </Button>
    </div>
  )
}
