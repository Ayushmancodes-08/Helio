'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/hooks/useLanguage';

const loginSchema = z.object({
  userId: z.string().min(3, 'User ID is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function ProfessionalLoginContent() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en-IN';
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'doctor';
  const { toast } = useToast();
  const { getErrorMessage, getAuthErrorMessage } = useErrorTranslation();
  const { t: tCommon } = useLanguage();
  const t = useTranslations('auth');
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userId: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      // Hardcoded admin credentials for easy login
      const hardcodedAdmins = {
        'HO001': {
          password: 'HealthOfficial@2024',
          role: 'health-official',
          email: 'healthofficial@hospital.com',
          full_name: 'Health Official',
          user_id: 'HO001'
        },
        'DEO001': {
          password: 'DataEntry@2024',
          role: 'data-entry-operator',
          email: 'dataentry@hospital.com',
          full_name: 'Data Entry Operator',
          user_id: 'DEO001'
        }
      };

      const adminAccount = hardcodedAdmins[data.userId as keyof typeof hardcodedAdmins];

      // If credentials match hardcoded admin, try Supabase FIRST (for data persistence)
      if (adminAccount && adminAccount.password === data.password && adminAccount.role === role) {
        const supabase = createClient();

        // Try to authenticate with Supabase (if account exists in database)
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email: adminAccount.email,
          password: adminAccount.password,
        });

        if (!signInError && authData.user) {
          // SUCCESS: Supabase account exists - use real database session
          // Verify role from profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('auth_user_id', authData.user.id)
            .single();

          if (profileData && profileData.role === role) {
            toast({
              title: 'Login Successful',
              description: `Welcome back, ${profileData.full_name || adminAccount.full_name}! (Using Supabase)`,
            });

            router.push(`/${locale}/dashboard/${adminAccount.role}`);
            setIsLoading(false);
            return;
          }
        }

        // FALLBACK: Supabase auth failed or role mismatch - use local session (testing only)
        sessionStorage.setItem('hardcoded_admin', JSON.stringify({
          user_id: adminAccount.user_id,
          role: adminAccount.role,
          email: adminAccount.email,
          full_name: adminAccount.full_name
        }));

        toast({
          title: 'Login Successful',
          description: `Welcome, ${adminAccount.full_name}! (Local mode - changes won't be saved)`,
        });

        router.push(`/${locale}/dashboard/${adminAccount.role}`);
        setIsLoading(false);
        return;
      }

      // Regular authentication for non-hardcoded accounts
      const supabase = createClient();

      // 1. Lookup email from User ID
      const { data: profileData, error: profileLookupError } = await supabase
        .from('profiles')
        .select('email, role, auth_user_id')
        .eq('user_id', data.userId)
        .single();

      if (profileLookupError || !profileData || !profileData.email) {
        const errorMessage = getErrorMessage('authentication.accountNotFound');
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: errorMessage, // Or "Invalid User ID"
        });
        setIsLoading(false);
        return;
      }

      // 2. Sign in with retrieved email and password
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password: data.password,
      });

      if (signInError) {
        const errorMessage = getAuthErrorMessage('invalid_credentials');
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: errorMessage,
        });
        return;
      }

      if (!authData.user) {
        // Should not happen if signInWithPassword succeeds
        throw new Error('No user returned from auth');
      }

      // 3. Role verification (double check)
      if (profileData.role !== role) {
        const errorMessage = getErrorMessage('general.forbidden');
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: `This User ID belongs to a ${profileData.role}, but you are trying to login as ${role}.`,
        });
        // Optional: Sign out if role mismatch
        await supabase.auth.signOut();
        return;
      }

      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });

      // Redirect to appropriate dashboard
      router.push(`/${locale}/dashboard/${role}`);
    } catch (error: any) {
      const errorMessage = getErrorMessage('general.serverError');
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = () => {
    const roleMap: Record<string, string> = {
      doctor: tCommon('common.roles.doctor') || 'Doctor',
      pharmacist: tCommon('common.roles.pharmacist') || 'Pharmacist',
      'health-official': tCommon('common.roles.healthOfficial') || 'Health Official',
      'data-entry-operator': tCommon('common.roles.dataEntryOperator') || 'Data Entry Operator',
    };
    return roleMap[role] || tCommon('common.roles.professional') || 'Professional';
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
            <span className="font-bold text-xl">{tCommon('common.app.name') || 'Grameen Swasthya Setu'}</span>
          </Link>
          <CardTitle>{t('professionalLogin')}</CardTitle>
          <CardDescription>
            {t('loginAs')} {getRoleLabel()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('login.userId')}</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder={t('login.userIdPlaceholder')}
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
                    <FormLabel>{t('password')}</FormLabel>
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
                {isLoading ? tCommon('common.loggingIn') || 'Logging in...' : tCommon('common.buttons.login') || 'Login'} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>

          {['doctor', 'pharmacist'].includes(role) && (
            <div className="mt-6 text-center text-sm">
              {t('login.noAccount')}{' '}
              <Link href={`/${locale}/signup/professional?role=${role}`} className="text-primary hover:underline">
                {t('signup.title')}
              </Link>
            </div>
          )}
          <div className="mt-2 text-center text-sm">
            <Link href={`/${locale}/login`} className="text-muted-foreground hover:underline">
              {t('chooseDifferentRole')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfessionalLoginWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfessionalLoginContent />
    </Suspense>
  );
}

export default function ProfessionalLoginPage() {
  return <ProfessionalLoginWrapper />;
}
