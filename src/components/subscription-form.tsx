
'use client';

import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface SubscriptionFormProps {
    onSubscribed?: () => void;
}

const SUBSCRIBED_KEY = 'popper_newsletter_subscribed';

const SubscriptionForm = ({ onSubscribed }: SubscriptionFormProps) => {
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        
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
                // Use the detailed error message from the API response
                throw new Error(data.message || 'Something went wrong on the server.');
            }

            toast({
                title: "¡Gracias por suscribirte!",
                description: "Pronto recibirás nuestras mejores ofertas.",
            });
            
            // Set flag in local storage
            try {
              localStorage.setItem(SUBSCRIBED_KEY, 'true');
            } catch (error) {
              console.error('Could not save subscription status to localStorage', error);
            }

            setEmail(''); // Reset the input field
            if (onSubscribed) {
                onSubscribed();
            }

        } catch (error: any) {
             toast({
                title: "Subscription Failed",
                // Display the specific error message
                description: error.message || "Could not subscribe. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };
    
    // Render a placeholder on the server and initial client render
    if (!isMounted) {
        return <div className="h-[148px]" />; // Adjust height to match the form's height to prevent layout shift
    }

    return (
        <div className="bg-secondary/50 p-8 rounded-lg">
            <div className="max-w-2xl mx-auto text-center">
                <h3 className="font-headline text-2xl mb-3 text-primary font-bold">Suscríbete a nuestro boletín</h3>
                <p className="text-sm text-foreground/80 mb-6">
                Puede cancelar su suscripción en cualquier momento. Para ello, consulte nuestra información de contacto en la declaración legal.
                </p>
                <form onSubmit={handleSubmit} className="flex w-full max-w-md mx-auto items-center space-x-2">
                    <Input 
                        name="email" 
                        type="email" 
                        placeholder="Introduce tu email..." 
                        className="flex-1 bg-background" 
                        required 
                        disabled={loading}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button type="submit" disabled={loading}>
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
