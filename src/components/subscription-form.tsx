'use client';

import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, Loader2 } from 'lucide-react';
import React, { useState } from 'react';

interface SubscriptionFormProps {
    onSubscribed?: () => void;
}

const SubscriptionForm = ({ onSubscribed }: SubscriptionFormProps) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const email = e.currentTarget.email.value;

        if(!email) {
            toast({
                title: "Error",
                description: "Please enter your email address.",
                variant: "destructive",
            });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong.');
            }

            toast({
                title: "¡Gracias por suscribirte!",
                description: "Pronto recibirás nuestras mejores ofertas.",
            });
            e.currentTarget.reset();
            if (onSubscribed) {
                onSubscribed();
            }

        } catch (error: any) {
             toast({
                title: "Subscription Failed",
                description: error.message || "Could not subscribe. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="bg-primary/20 dark:bg-primary/10 p-8 rounded-lg">
            <div className="max-w-2xl mx-auto text-center">
                <h3 className="font-semibold font-headline text-2xl mb-3 text-primary">Suscríbete a nuestro boletín</h3>
                <p className="text-sm text-foreground/80 mb-6">
                Puede cancelar su suscripción en cualquier momento. Para ello, consulte nuestra información de contacto en la declaración legal.
                </p>
                <form onSubmit={handleSubmit} className="flex w-full max-w-md mx-auto items-center space-x-2">
                    <Input name="email" type="email" placeholder="Introduce tu email..." className="flex-1 bg-background dark:bg-card" required disabled={loading}/>
                    <Button type="submit" variant="destructive" disabled={loading}>
                        {loading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4 mr-2" />
                        )}
                        {loading ? 'Suscribiendo...' : 'Suscribirse'}
                    </Button>
                </form>
            </div>
        </div>
    )
};

export default SubscriptionForm;
