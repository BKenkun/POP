
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Send, Mail, Info, Building } from 'lucide-react';
import { useState } from 'react';

const contactSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  email: z.string().email('Por favor, introduce un email válido.'),
  subject: z.string().min(5, 'El asunto debe tener al menos 5 caracteres.'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres.'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    setLoading(true);
    // Simulate sending an email
    console.log('Contact form submitted:', data);

    setTimeout(() => {
        toast({
        title: '¡Mensaje Enviado!',
        description: 'Gracias por contactarnos. Te responderemos lo antes posible.',
        });
        form.reset();
        setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight font-bold">Contacta con Nosotros</h1>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                ¿Tienes alguna pregunta o necesitas ayuda? Rellena el formulario y nuestro equipo se pondrá en contacto contigo.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <Card>
                <CardHeader>
                    <CardTitle>Enviar un mensaje</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tu Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tu Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="tu@email.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="subject"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Asunto</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Consulta sobre un pedido" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="message"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mensaje</FormLabel>
                                    <FormControl>
                                        <Textarea rows={5} placeholder="Escribe tu consulta aquí..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={loading}>
                                <Send className="mr-2 h-4 w-4" />
                                {loading ? 'Enviando...' : 'Enviar Mensaje'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <div className="space-y-8">
                 <Card className="bg-secondary/50 border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-primary"/>Email de Contacto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Para consultas generales, envíanos un correo a:</p>
                        <a href="mailto:info@comprarpopperonline.com" className="font-semibold text-primary hover:underline">
                            info@comprarpopperonline.com
                        </a>
                    </CardContent>
                </Card>
                 <Card className="bg-secondary/50 border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5 text-primary"/>Información Legal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                       <div>
                           <h4 className="font-semibold text-foreground flex items-center gap-2"><Building className="h-4 w-4"/>Titular</h4>
                           <p className="text-muted-foreground">MARY AND POPPER</p>
                           <p className="text-muted-foreground">ABN: 37 588 057 135</p>
                       </div>
                       <div>
                           <h4 className="font-semibold text-foreground">Dirección</h4>
                           <p className="text-muted-foreground">U 2 58 MAIN ST, OSBORNE PARK WA 6017, AUSTRALIA</p>
                       </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
