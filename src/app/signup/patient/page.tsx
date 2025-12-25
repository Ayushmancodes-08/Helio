'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Camera, ArrowRight, KeyRound } from 'lucide-react';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';


const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  age: z.coerce.number().min(1, 'Age must be a positive number.').max(120),
  gender: z.string().min(1, 'Please select a gender.'),
  phone: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit phone number.'),
  address: z.string().min(5, 'Address is required.'),
  photo: z.any().optional(),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function PatientSignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      gender: '',
      phone: '',
      address: '',
      age: 0,
      photo: null,
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        form.setValue('photo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [step, setStep] = useState(1); // 1 = form, 2 = OTP verification
  const [otp, setOtp] = useState('');

  const onSubmit = async (data: SignupFormValues) => {
    try {
      const supabase = createClient()

      // For phone auth in Supabase, we use signInWithOtp (not signUp!)
      // This works for both new users and existing users
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: `+91${data.phone}`,
      })

      if (otpError) {
        console.error('OTP send error:', otpError)
        throw otpError
      }

      // Store patient data temporarily to use after OTP verification
      localStorage.setItem('pending_patient_signup', JSON.stringify({
        full_name: data.name,
        age: data.age,
        gender: data.gender,
        address: data.address,
        photo: data.photo,
        phone: data.phone,
      }))

      toast({
        title: 'OTP Sent!',
        description: `An OTP has been sent to +91${data.phone}. Please enter it below.`,
      })

      // Move to OTP verification step
      setStep(2)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast({ variant: 'destructive', title: 'Invalid OTP', description: 'Please enter the 6-digit OTP.' });
      return;
    }

    try {
      const supabase = createClient()
      const formData = form.getValues()

      // Verify OTP
      const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
        phone: `+91${formData.phone}`,
        token: otp,
        type: 'sms',
      })

      if (verifyError) {
        toast({ variant: 'destructive', title: 'Invalid OTP', description: 'The OTP you entered is incorrect.' });
        return;
      }

      if (!authData.user) {
        throw new Error('No user returned after verification')
      }

      // Get pending signup data
      const pendingData = localStorage.getItem('pending_patient_signup')
      if (pendingData) {
        const patientData = JSON.parse(pendingData)

        // Update the auto-created profile with patient details
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: patientData.full_name,
            age: patientData.age,
            gender: patientData.gender,
            address: patientData.address,
            photo: patientData.photo,
            phone: patientData.phone,
            role: 'patient',
          })
          .eq('auth_user_id', authData.user.id)

        if (updateError) {
          console.error('Profile update error:', updateError)
        }

        // Clear pending data
        localStorage.removeItem('pending_patient_signup')
      }

      toast({
        title: 'Account Created!',
        description: 'Your account has been successfully created.',
      })

      // Redirect to patient dashboard
      router.push('/dashboard/patient')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message || 'Something went wrong. Please try again.',
      })
      console.error(error)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary py-12 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">Grameen Swasthya Setu</span>
          </Link>
          <CardTitle>{step === 1 ? 'Create Patient Account' : 'Verify OTP'}</CardTitle>
          <CardDescription>
            {step === 1 ? 'Enter your details to get started.' : 'Enter the 6-digit OTP sent to your phone.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                  </label>
                  <Input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  <FormMessage>{form.formState.errors.photo?.message as string}</FormMessage>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Anil Kumar" {...field} /></FormControl>
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
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 35" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Full Address</FormLabel>
                        <FormControl><Input placeholder="e.g., Village, Post, District" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="otp" className="text-sm font-medium">Enter OTP</label>
                <div className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                  />
                </div>
              </div>

              <Button onClick={handleVerifyOtp} className="w-full">
                Verify & Create Account
              </Button>

              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="w-full"
              >
                Back to Form
              </Button>
            </div>
          )}

          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login/patient" className="text-primary hover:underline">
              Login here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
