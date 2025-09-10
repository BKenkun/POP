
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PackagePlus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export function CreatePackCard() {
  return (
    <Card className="group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-dashed border-2 border-primary/50 bg-primary/5 h-full">
        <Link href="/create-pack" className="flex-grow flex flex-col">
            <CardHeader className="p-0 relative">
                 <div className="relative h-64 w-full flex items-center justify-center bg-primary/10">
                    <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
                        <Badge variant="destructive">Oferta</Badge>
                        <Badge variant="secondary">Pack</Badge>
                    </div>
                    <PackagePlus className="h-20 w-20 text-primary/60 transition-transform group-hover:scale-110" strokeWidth={1.5}/>
                </div>
            </CardHeader>
            <CardContent className="flex-grow p-5 space-y-2 text-center">
                <CardTitle className="text-xl font-bold leading-snug tracking-normal text-primary transition-colors">
                    Crea tu Propio Pack de Poppers
                </CardTitle>
                <CardDescription className="text-foreground/70">
                    Elige tus productos favoritos y obtén un descuento especial. ¡A tu gusto!
                </CardDescription>
            </CardContent>
        </Link>
        <CardFooter className="p-5 pt-0">
            <Button
                asChild
                size="lg"
                className="w-full"
                variant="default"
            >
                <Link href="/create-pack">
                    Empezar a Crear
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </CardFooter>
    </Card>
  );
}
