'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Mail, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = email, 2 = OTP, 3 = new password
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Step 1: Check email and send OTP
  const handleSendOTP = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Email',
        description: 'Please enter a valid email address.'
      });
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      // Check if email exists in profiles
      const { data: profile, error: checkError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single();

      if (checkError || !profile) {
        toast({
          variant: 'destructive',
          title: 'Email Not Found',
          description: 'No account exists with this email address.',
        });
        setLoading(false);
        return;
      }

      // Send OTP to registered email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (error) throw error;

      toast({
        title: 'OTP Sent! 📧',
        description: `A 6-digit code has been sent to ${email}`,
      });

      setStep(2);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Send OTP',
        description: error.message || 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'Invalid OTP',
        description: 'Please enter the complete 6-digit code.'
      });
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      // Verify OTP
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (verifyError) {
        throw new Error('Invalid or expired OTP code');
      }

      toast({
        title: 'OTP Verified! ✅',
        description: 'Now set your new password.',
      });

      setStep(3);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error.message || 'Invalid OTP code. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set new password
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Weak Password',
        description: 'Password must be at least 6 characters.'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords Don\'t Match',
        description: 'Please make sure both passwords are identical.'
      });
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: 'Password Reset Successful! 🎉',
        description: 'You can now login with your new password.',
      });

      // Sign out and redirect
      await supabase.auth.signOut();
      setTimeout(() => router.push('/login'), 1500);

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Password Update Failed',
        description: error.message || 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp('');
    setStep(1);
    await handleSendOTP();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">Grameen Swasthya Setu</span>
          </Link>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            {step === 1 && 'Enter your registered email address'}
            {step === 2 && 'Verify the OTP code sent to your email'}
            {step === 3 && 'Create your new password'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* STEP 1: Email Input */}
          {step === 1 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                  disabled={loading}
                  className="text-base"
                  autoFocus
                />
              </div>
              <Button
                onClick={handleSendOTP}
                className="w-full"
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    Send OTP <Mail className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 2 && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-blue-900">Check your email!</p>
                <p className="text-sm text-blue-700 mt-1">
                  We sent a 6-digit code to<br />
                  <strong>{email}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-center block">Enter OTP Code</label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP()}
                  disabled={loading}
                  className="text-center text-3xl tracking-[0.5em] font-mono font-bold"
                  maxLength={6}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground text-center">
                  Enter the 6-digit code from your email
                </p>
              </div>

              <Button
                onClick={handleVerifyOTP}
                className="w-full"
                disabled={loading || otp.length !== 6}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify OTP <ShieldCheck className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                  disabled={loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResendOTP}
                  className="flex-1"
                  disabled={loading}
                >
                  Resend OTP
                </Button>
              </div>
            </>
          )}

          {/* STEP 3: New Password */}
          {step === 3 && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <ShieldCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-green-900">OTP Verified!</p>
                <p className="text-sm text-green-700 mt-1">
                  Now create a strong new password
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                onClick={handleResetPassword}
                className="w-full"
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    Reset Password <KeyRound className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </>
          )}

          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            Remember your password?{' '}
            <Link href="/login" className="text-primary underline hover:text-primary/80 font-medium">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
