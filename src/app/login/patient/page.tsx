'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, KeyRound } from 'lucide-react';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function PatientLoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const router = useRouter();
  const { toast } = useToast();

  const handleRequestOtp = async () => {
    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      toast({ variant: 'destructive', title: 'Invalid Phone Number', description: 'Please enter a valid 10-digit phone number.' });
      return;
    }

    try {
      const supabase = createClient()

      // Request OTP from Supabase
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+91${phone}`,
      })

      if (error) {
        if (error.message.includes('not found') || error.message.includes('User not found')) {
          toast({
            variant: 'destructive',
            title: 'Account Not Found',
            description: 'No account exists with this phone number. Please sign up first.',
            action: <Button variant="secondary" size="sm" onClick={() => router.push('/signup/patient')}>Sign Up</Button>,
          });
          return
        }
        throw error
      }

      toast({ title: 'OTP Sent!', description: `An OTP has been sent to +91${phone}` });
      setStep(2);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Send OTP',
        description: error.message || 'Please try again.'
      });
    }
  };

  const handleLogin = async () => {
    if (!otp || otp.length !== 6) {
      toast({ variant: 'destructive', title: 'Invalid OTP', description: 'Please enter the 6-digit OTP.' });
      return;
    }

    try {
      const supabase = createClient()

      // Verify OTP
      const { data, error } = await supabase.auth.verifyOtp({
        phone: `+91${phone}`,
        token: otp,
        type: 'sms',
      })

      if (error) {
        toast({ variant: 'destructive', title: 'Invalid OTP', description: 'The OTP you entered is incorrect.' });
        return;
      }

      if (data.user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_user_id', data.user.id)
          .single()

        toast({ title: 'Login Successful!', description: `Welcome ${profile?.full_name || 'back'}!` });
        router.push('/dashboard/patient');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'Please try again.'
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">Grameen Swasthya Setu</span>
          </Link>
          <CardTitle>Patient Login</CardTitle>
          <CardDescription>
            {step === 1 ? 'Enter your phone number to receive an OTP.' : 'Enter the OTP sent to your phone.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 ? (
            <div className="space-y-4">
              <Input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
              />
              <Button onClick={handleRequestOtp} className="w-full">
                Request OTP <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
              <Button onClick={handleLogin} className="w-full">
                Login <KeyRound className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="link" onClick={() => setStep(1)} className="w-full">
                Back to phone number
              </Button>
            </div>
          )}
          <div className="text-center text-sm text-muted-foreground pt-4">
            Don't have an account?{' '}
            <Link href="/signup/patient" className="text-primary underline">
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
