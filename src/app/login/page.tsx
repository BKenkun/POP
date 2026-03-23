'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '@/context/language-context';

// Dynamically import the form component with SSR turned off.
// Using an absolute path alias to fix ChunkLoadError.
const LoginForm = dynamic(() => import('@/app/login/login-form'), { 
  ssr: false,
  loading: () => <div className="p-12 text-center text-muted-foreground">Initializing security module...</div> 
});

function RedirectAlert() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  if (!redirect) {
    return null;
  }

  return (
    <div className="px-6 pb-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Restricted</AlertTitle>
        <AlertDescription>
          You must log in to access this page.
        </AlertDescription>
      </Alert>
    </div>
  );
}

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">{t('auth.login_title')}</CardTitle>
          <CardDescription>{t('auth.login_subtitle')}</CardDescription>
        </CardHeader>
        <Suspense fallback={null}>
          <RedirectAlert />
        </Suspense>
        <LoginForm />
      </Card>
    </div>
  );
}
