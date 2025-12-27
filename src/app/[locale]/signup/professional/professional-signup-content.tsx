'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/hooks/useLanguage';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  userId: z.string().min(3, 'User ID must be at least 3 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit phone number.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  licenseNumber: z.string().optional(),
  specialization: z.string().optional(),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function ProfessionalSignupContent() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en-IN';
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [role, setRole] = useState('');

  useEffect(() => {
    const roleFromQuery = searchParams.get('role');
    if (roleFromQuery) {
      setRole(roleFromQuery);
    } else {
      router.push(`/${locale}/login`);
    }
  }, [searchParams, router, locale]);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      userId: '',
      email: '',
      phone: '',
      password: '',
      licenseNumber: '',
      specialization: '',
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      const supabase = createClient()

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', data.userId)
        .single()

      if (existingProfile) {
        toast({
          variant: 'destructive',
          title: t('errors.userIdTaken') || 'User ID Taken',
          description: t('errors.userIdTakenDesc') || 'This User ID is already in use. Please choose another one.',
        });
        return;
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: undefined,
          data: {
            full_name: data.name,
            phone: data.phone,
          }
        }
      })

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          toast({
            variant: 'destructive',
            title: t('errors.emailExists') || 'Email Already Registered',
            description: t('errors.emailExistsDesc') || 'An account with this email already exists.',
          });
          return
        }
        throw signUpError
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            user_id: data.userId,
            role: role,
            full_name: data.name,
            email: data.email,
            phone: data.phone,
            license_number: data.licenseNumber || null,
            specialization: data.specialization || null,
          })
          .eq('auth_user_id', authData.user.id)

        if (profileError) {
          console.error('Profile update error:', profileError)
          throw new Error('Failed to create profile')
        }
      }

      toast({
        title: t('auth.loginSuccess') || 'Account Created!',
        description: t('auth.accountCreatedDesc') || 'Your account has been created successfully. Please log in.',
      });
      router.push(`/${locale}/login/professional?role=${role}`);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('errors.signupFailed') || 'Signup Failed',
        description: error.message || t('common.tryAgain') || 'Something went wrong. Please try again.',
      });
      console.error(error);
    }
  };

  const roleLabel = role.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary py-12 px-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher variant="homepage" />
      </div>
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Link href={`/${locale}`} className="flex items-center justify-center gap-2 mb-4">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">{t('homepage.header.appName') || 'Grameen Swasthya Setu'}</span>
          </Link>
          <CardTitle>{t('auth.createAccount') || `Create ${roleLabel} Account`}</CardTitle>
          <CardDescription>{t('auth.enterDetailsToRegister') || 'Enter your details to register.'}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.fullName') || 'Full Name'}</FormLabel>
                      <FormControl><Input placeholder={t('auth.namePlaceholder') || 'e.g., Dr. Priya Singh'} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.userId') || 'User ID'}</FormLabel>
                      <FormControl><Input placeholder={t('auth.userIdPlaceholder') || 'Choose a unique User ID'} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.email') || 'Email Address'}</FormLabel>
                      <FormControl><Input type="email" placeholder={t('auth.emailPlaceholder') || 'you@example.com'} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.phone') || 'Phone Number'}</FormLabel>
                      <FormControl><Input type="tel" placeholder={t('auth.phonePlaceholder') || '10-digit mobile number'} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {['doctor', 'pharmacist'].includes(role) && (
                  <FormField
                    control={form.control}
                    name="licenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.licenseNumber') || 'License/Registration Number'}</FormLabel>
                        <FormControl><Input placeholder={t('auth.licenseNumberPlaceholder') || 'Your official license number'} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {role === 'doctor' && (
                  <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.specialization') || 'Specialization'}</FormLabel>
                        <FormControl><Input placeholder={t('auth.specializationPlaceholder') || 'e.g., Cardiology'} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.password') || 'Password'}</FormLabel>
                      <FormControl><Input type="password" placeholder={t('auth.passwordPlaceholder') || 'Choose a secure password'} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full">
                <UserPlus className="mr-2 h-4 w-4" /> {t('auth.createAccount') || 'Create Account'}
              </Button>
            </form>
          </Form>
          <div className="text-center text-sm text-muted-foreground pt-4">
            {t('auth.haveAccount') || 'Already have an account?'}{' '}
            <Link href={`/${locale}/login/professional?role=${role}`} className="text-primary underline">
              {t('auth.login.title') || 'Log In'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
