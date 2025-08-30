'use client';

import dynamic from 'next/dynamic';

const SubscriptionFormComponent = () => {
    const Send = dynamic(() => import('lucide-react').then(mod => mod.Send));
    const Input = dynamic(() => import('@/components/ui/input').then(mod => mod.Input));
    const Button = dynamic(() => import('@/components/ui/button').then(mod => mod.Button));

    if (!Send || !Input || !Button) return null;

    return (
        <div className="bg-muted/40 p-8 rounded-lg">
            <div className="max-w-2xl mx-auto text-center">
                <h3 className="font-semibold font-headline text-2xl mb-3">Suscríbete a nuestro boletín</h3>
                <p className="text-sm text-foreground/80 mb-6">
                Puede cancelar su suscripción en cualquier momento. Para ello, consulte nuestra información de contacto en la declaración legal.
                </p>
                <form className="flex w-full max-w-md mx-auto items-center space-x-2">
                <Input type="email" placeholder="Enter your email..." className="flex-1 bg-white dark:bg-background" />
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Send className="h-4 w-4 mr-2" />
                    Suscribirse
                </Button>
                </form>
            </div>
        </div>
    )
};

const SubscriptionForm = dynamic(() => Promise.resolve(SubscriptionFormComponent), {
    ssr: false,
});

export default SubscriptionForm;
