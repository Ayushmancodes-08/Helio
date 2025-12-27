'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useErrorTranslation } from '@/hooks/useErrorTranslation';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageSwitcher } from '@/components/language-switcher';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function ProfessionalLoginContent() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en-IN';
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'doctor';
  const { toast } = useToast();
  const { getErrorMessage, getAuthErrorMessage } = useErrorTranslation();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        const errorMessage = getAuthErrorMessage('invalid_credentials');
        toast({
          variant: 'destructive',
          title: t('errors.loginFailed') || 'Login Failed',
          description: errorMessage,
        });
        return;
      }

      if (!authData.user) {
        const errorMessage = getErrorMessage('authentication.accountNotFound');
        toast({
          variant: 'destructive',
          title: t('errors.loginFailed') || 'Login Failed',
          description: errorMessage,
        });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('auth_user_id', authData.user.id)
        .single();

      if (profileError || !profile) {
        const errorMessage = getErrorMessage('database.dataNotFound');
        toast({
          variant: 'destructive',
          title: t('errors.loginFailed') || 'Login Failed',
          description: errorMessage,
        });
        return;
      }

      if (profile.role !== role) {
        const errorMessage = getErrorMessage('general.forbidden');
        toast({
          variant: 'destructive',
          title: t('errors.loginFailed') || 'Login Failed',
          description: errorMessage,
        });
        return;
      }

      toast({
        title: t('auth.loginSuccess') || 'Login Successful',
        description: t('auth.welcome') || 'Welcome back!',
      });

      router.push(`/${locale}/dashboard/${role}`);
    } catch (error: any) {
      const errorMessage = getErrorMessage('general.serverError');
      toast({
        variant: 'destructive',
        title: t('errors.loginFailed') || 'Login Failed',
        description: error.message || errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = () => {
    const roleMap: Record<string, string> = {
      doctor: t('common.roles.doctor') || 'Doctor',
      pharmacist: t('common.roles.pharmacist') || 'Pharmacist',
      'health-official': t('common.roles.healthOfficial') || 'Health Official',
      'data-entry-operator': t('common.roles.dataEntryOperator') || 'Data Entry Operator',
    };
    return roleMap[role] || t('common.professional') || 'Professional';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary py-12 px-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher variant="homepage" />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href={`/${locale}`} className="flex items-center justify-center gap-2 mb-4">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">{t('homepage.header.appName') || 'Grameen Swasthya Setu'}</span>
          </Link>
          <CardTitle>{t('auth.professionalLogin') || 'Professional Login'}</CardTitle>
          <CardDescription>
            {t('auth.loginAs') || 'Login as'} {getRoleLabel()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.email') || 'Email Address'}</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder={t('auth.emailPlaceholder') || 'your.email@example.com'}
                          {...field}
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.password') || 'Password'}</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('common.loggingIn') || 'Logging in...' : t('auth.login.title') || 'Login'} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            {t('auth.noAccount') || "Don't have an account?"}{' '}
            <Link href={`/${locale}/login`} className="text-primary hover:underline">
              {t('auth.chooseDifferentRole') || 'Choose a different role'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
