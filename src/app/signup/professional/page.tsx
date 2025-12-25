'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

export default function ProfessionalSignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [role, setRole] = useState('');

  useEffect(() => {
    const roleFromQuery = searchParams.get('role');
    if (roleFromQuery) {
      setRole(roleFromQuery);
    } else {
      router.push('/login');
    }
  }, [searchParams, router]);

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

      // Step 1: Check if UserID already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', data.userId)
        .single()

      if (existingProfile) {
        toast({
          variant: 'destructive',
          title: 'User ID Taken',
          description: 'This User ID is already in use. Please choose another one.',
        });
        return;
      }

      // Step 2: Create Supabase Auth user with email/password (auto-confirmed)
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation
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
            title: 'Email Already Registered',
            description: 'An account with this email already exists.',
          });
          return
        }
        throw signUpError
      }

      // Step 3: Update profile with custom user_id and role-specific data
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
        title: 'Account Created!',
        description: 'Your account has been created successfully. Please log in.',
      });
      router.push(`/login/professional?role=${role}`);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message || 'Something went wrong. Please try again.',
      });
      console.error(error);
    }
  };

  const roleLabel = role.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary py-12 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">Grameen Swasthya Setu</span>
          </Link>
          <CardTitle>Create {roleLabel} Account</CardTitle>
          <CardDescription>Enter your details to register.</CardDescription>
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
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="e.g., Dr. Priya Singh" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User ID</FormLabel>
                      <FormControl><Input placeholder="Choose a unique User ID" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl><Input type="tel" placeholder="10-digit mobile number" {...field} /></FormControl>
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
                        <FormLabel>License/Registration Number</FormLabel>
                        <FormControl><Input placeholder="Your official license number" {...field} /></FormControl>
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
                        <FormLabel>Specialization</FormLabel>
                        <FormControl><Input placeholder="e.g., Cardiology" {...field} /></FormControl>
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
                      <FormLabel>Password</FormLabel>
                      <FormControl><Input type="password" placeholder="Choose a secure password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full">
                <UserPlus className="mr-2 h-4 w-4" /> Create Account
              </Button>
            </form>
          </Form>
          <div className="text-center text-sm text-muted-foreground pt-4">
            Already have an account?{' '}
            <Link href={`/login/professional?role=${role}`} className="text-primary underline">
              Log In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
