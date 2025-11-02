
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { useTranslation } from '@/context/language-context';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un email válido.' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, data.email);
      toast({
        title: 'Correo enviado',
        description: 'Hemos enviado un enlace a tu correo para que puedas restablecer tu contraseña.',
      });
      setSubmitted(true);
    } catch (error: any) {
      let friendlyError = 'Ha ocurrido un error. Por favor, inténtalo de nuevo.';
      if (error.code === 'auth/user-not-found') {
        friendlyError = 'No se ha encontrado ninguna cuenta con ese correo electrónico.';
      }
      toast({
        title: 'Error',
        description: friendlyError,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">{t('auth.forgot_password_title')}</CardTitle>
          <CardDescription>
            {submitted
              ? t('auth.forgot_password_success_subtitle')
              : t('auth.forgot_password_subtitle')}
          </CardDescription>
        </CardHeader>
        {submitted ? (
            <CardContent className="text-center">
                 <p className="text-muted-foreground">Si el correo electrónico existe en nuestro sistema, recibirás un mensaje en breve.</p>
                 <Button asChild className="mt-6 w-full">
                    <Link href="/login">
                        <ArrowLeft className="mr-2" />
                        {t('auth.back_to_login_button')}
                    </Link>
                 </Button>
            </CardContent>
        ) : (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>{t('auth.email_label')}</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="tu@email.com" {...field} disabled={loading} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </CardContent>
                    <CardFooter className="flex-col gap-4">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Mail className="mr-2 h-4 w-4" />
                            )}
                            {loading ? t('auth.sending_button') : t('auth.send_recovery_link_button')}
                        </Button>
                         <Button asChild variant="ghost" className="text-sm text-muted-foreground">
                            <Link href="/login">
                                <ArrowLeft className="mr-1 h-3 w-3"/>
                                {t('auth.back_to_login_button')}
                            </Link>
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        )}
      </Card>
    </div>
  );
}
