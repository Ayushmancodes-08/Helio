'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function ProfessionalLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'doctor';
  const { toast } = useToast();
  const { getErrorMessage, getAuthErrorMessage } = useErrorTranslation();
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

      // Sign in with email and password
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        // Translate authentication error
        const errorMessage = getAuthErrorMessage('invalid_credentials');
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: errorMessage,
        });
        return;
      }

      if (!authData.user) {
        const errorMessage = getErrorMessage('authentication.accountNotFound');
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: errorMessage,
        });
        return;
      }

      // Verify user has the correct role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('auth_user_id', authData.user.id)
        .single();

      if (profileError || !profile) {
        const errorMessage = getErrorMessage('database.dataNotFound');
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: errorMessage,
        });
        return;
      }

      if (profile.role !== role) {
        const errorMessage = getErrorMessage('general.forbidden');
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: errorMessage,
        });
        return;
      }

      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });

      // Redirect to appropriate dashboard
      router.push(`/dashboard/${role}`);
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
      doctor: 'Doctor',
      pharmacist: 'Pharmacist',
      'health-official': 'Health Official',
      'data-entry-operator': 'Data Entry Operator',
    };
    return roleMap[role] || 'Professional';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">Grameen Swasthya Setu</span>
          </Link>
          <CardTitle>Professional Login</CardTitle>
          <CardDescription>
            Login as {getRoleLabel()}
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
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
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
                    <FormLabel>Password</FormLabel>
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
                {isLoading ? 'Logging in...' : 'Login'} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Choose a different role
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfessionalLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfessionalLoginContent />
    </Suspense>
  );
}
