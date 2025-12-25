'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';


const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  userId: z.string().optional(),
  email: z.string().email('Please enter a valid email address.').optional(),
  phone: z.string().optional(),
  licenseNumber: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function PharmacistProfilePage() {
  const { toast } = useToast();
  const { profile, loading } = useAuth();
  const [saving, setSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      userId: '',
      email: '',
      phone: '',
      licenseNumber: '',
    }
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.full_name || '',
        userId: profile.user_id || '',
        email: profile.email || '',
        phone: profile.phone || '',
        licenseNumber: profile.license_number || '',
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!profile) return;

    setSaving(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.name,
          email: data.email,
          phone: data.phone,
          license_number: data.licenseNumber,
        })
        .eq('auth_user_id', profile.auth_user_id);

      if (error) throw error;

      toast({
        title: 'Profile Updated!',
        description: 'Your profile has been successfully updated.',
      });

      // Refresh the page to update sidebar
      window.location.reload();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Something went wrong. Please try again.',
      });
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-headline text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          View and update your professional information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Your Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="e.g., Ramesh Kumar" {...field} /></FormControl>
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
                      <FormControl><Input {...field} readOnly className="text-muted-foreground" /></FormControl>
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
              </div>

              <Button type="submit" className="w-full md:w-auto" disabled={saving}>
                <Save className="mr-2 h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
