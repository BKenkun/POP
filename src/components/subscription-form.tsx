'use client';

import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface SubscriptionFormProps {
    onSubscribed?: () => void;
}

const SubscriptionForm = ({ onSubscribed }: SubscriptionFormProps) => {
    const { toast } = useToast();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const email = e.currentTarget.email.value;
        if(email) {
            toast({
                title: "¡Gracias por suscribirte!",
                description: "Pronto recibirás nuestras mejores ofertas.",
            });
            e.currentTarget.reset();
            if (onSubscribed) {
                onSubscribed();
            }
        }
    };
    
    if (!isMounted) {
        return null;
    }

    return (
        <div className="bg-primary/20 dark:bg-primary/10 p-8 rounded-lg">
            <div className="max-w-2xl mx-auto text-center">
                <h3 className="font-semibold font-headline text-2xl mb-3 text-primary">Suscríbete a nuestro boletín</h3>
                <p className="text-sm text-foreground/80 mb-6">
                Puede cancelar su suscripción en cualquier momento. Para ello, consulte nuestra información de contacto en la declaración legal.
                </p>
                <form onSubmit={handleSubmit} className="flex w-full max-w-md mx-auto items-center space-x-2">
                    <Input name="email" type="email" placeholder="Introduce tu email..." className="flex-1 bg-background dark:bg-card" required />
                    <Button type="submit" variant="destructive">
                        <Send className="h-4 w-4 mr-2" />
                        Suscribirse
                    </Button>
                </form>
            </div>
        </div>
    )
};

export default SubscriptionForm;
