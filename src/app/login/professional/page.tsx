'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ProfessionalLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('');

  useEffect(() => {
    const roleFromQuery = searchParams.get('role');
    if (roleFromQuery) {
      setRole(roleFromQuery);
    } else {
      router.push('/login');
    }
  }, [searchParams, router]);

  const handleLogin = async () => {
    if (!userId || !password) {
      toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please enter both User ID and password.' });
      return;
    }

    try {
      const supabase = createClient()

      // HARDCODED ADMIN CREDENTIALS (No database required)
      const ADMIN_ACCOUNTS = {
        'HO001': {
          password: 'HealthOfficial@2024',
          role: 'health-official',
          name: 'Health Official',
          email: 'healthofficial@hospital.com'
        },
        'DEO001': {
          password: 'DataEntry@2024',
          role: 'data-entry-operator',
          name: 'Data Entry Operator',
          email: 'dataentry@hospital.com'
        }
      };

      // Check for hardcoded admin accounts first
      if (userId in ADMIN_ACCOUNTS) {
        const adminAccount = ADMIN_ACCOUNTS[userId as keyof typeof ADMIN_ACCOUNTS];

        if (password === adminAccount.password && role === adminAccount.role) {
          toast({
            title: 'Login Successful!',
            description: `Welcome back, ${adminAccount.name}!`
          });

          // Store minimal session data for hardcoded accounts
          sessionStorage.setItem('hardcoded_admin', JSON.stringify({
            user_id: userId,
            role: adminAccount.role,
            full_name: adminAccount.name,
            email: adminAccount.email
          }));

          router.push(`/dashboard/${adminAccount.role}`);
          return;
        } else {
          // If known user ID but wrong password for hardcoded account
          toast({
            variant: 'destructive',
            title: 'Invalid Credentials',
            description: 'The User ID or password you entered is incorrect.',
          });
          return;
        }
      }

      // STEP 1: Lookup email from user_id (for regular accounts)
      const { data: profile, error: lookupError } = await supabase
        .from('profiles')
        .select('email, role')
        .eq('user_id', userId)
        .single()

      if (lookupError || !profile) {
        // Generic error message to prevent user enumeration
        toast({
          variant: 'destructive',
          title: 'Invalid Credentials',
          description: 'The User ID or password you entered is incorrect.',
        });
        return
      }

      // Verify role matches
      if (profile.role !== role) {
        toast({
          variant: 'destructive',
          title: 'Invalid Credentials',
          description: 'The User ID or password you entered is incorrect.',
        });
        return
      }

      // STEP 2: Sign in with retrieved email and provided password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: password,
      })

      if (signInError) {
        toast({
          variant: 'destructive',
          title: 'Invalid Credentials',
          description: 'The User ID or password you entered is incorrect.',
        });
        return
      }

      // Fetch full profile for welcome message
      const { data: fullProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      toast({ title: 'Login Successful!', description: `Welcome back, ${fullProfile?.full_name}!` });
      router.push(`/dashboard/${profile.role}`);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Something went wrong. Please try again.',
      });
      console.error(error)
    }
  };

  const roleLabel = role.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const canSignUp = ['doctor', 'pharmacist'].includes(role);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">Grameen Swasthya Setu</span>
          </Link>
          <CardTitle>{roleLabel} Login</CardTitle>
          <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="sr-only">Toggle password visibility</span>
            </Button>
          </div>
          <Button onClick={handleLogin} className="w-full">
            Login <KeyRound className="ml-2 h-4 w-4" />
          </Button>

          {/* Only show Forgot Password for doctor and pharmacist */}
          {(role === 'doctor' || role === 'pharmacist') && (
            <div className="text-center text-sm text-muted-foreground">
              <Link href="/login/forgot-password" className="text-primary underline">
                Forgot Password?
              </Link>
            </div>
          )}

          {canSignUp && (
            <div className="text-center text-sm text-muted-foreground pt-4">
              Don't have an account?{' '}
              <Link href={`/signup/professional?role=${role}`} className="text-primary underline">
                Sign Up
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
