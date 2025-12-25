'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, PackageCheck, PackageX, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useInventory } from '@/hooks/useInventory';
import { createClient } from '@/lib/supabase/client';

const PHARMACY_LOCATION_KEY = 'pharmacistLocation';

const locationSchema = z.object({
  name: z.string().min(1, 'Pharmacy name is required.'),
  address: z.string().min(10, 'A precise, searchable address is required for directions.'),
});

type LocationFormValues = z.infer<typeof locationSchema>;

const getInitialLocation = () => {
  if (typeof window === 'undefined') {
    return { name: '', address: '' };
  }
  try {
    const storedLocation = localStorage.getItem(PHARMACY_LOCATION_KEY);
    return storedLocation ? JSON.parse(storedLocation) : { name: '', address: '' };
  } catch (error) {
    console.error("Failed to parse location from localStorage", error);
    return { name: '', address: '' };
  }
};

export default function PharmacistDashboardPage() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { inventory } = useInventory(); // Real DB stats

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: getInitialLocation(),
  });

  const stats = useMemo(() => {
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    inventory.forEach(item => {
      if (item.quantity <= 0) outOfStock++;
      else if (item.quantity < 50) lowStock++;
      else inStock++;
    });

    return { inStock, lowStock, outOfStock };
  }, [inventory]);

  // Supabase client
  const supabase = createClient();

  const onSubmit = async (data: LocationFormValues) => {
    if (!profile?.id) return;

    try {
      // Save to Supabase Profile (combining name and address for now as we lack a specific column)
      // Or just update address and assume Name is the User's name? 
      // Let's store "Pharmacy Name: Address" in the address field to keep it simple but persistent.
      const combinedAddress = `${data.name} || ${data.address}`;

      const { error } = await supabase
        .from('profiles')
        .update({ address: combinedAddress })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: 'Location Saved!',
        description: 'Your pharmacy details have been updated in your profile.',
      });

      // Also update localStorage for fallback/offline if needed, or remove it.
      // localStorage.setItem(PHARMACY_LOCATION_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save location", error);
      toast({
        variant: 'destructive',
        title: 'Error Saving Location',
        description: 'Could not save your pharmacy details.',
      });
    }
  };

  // Pre-fill form from profile
  useEffect(() => {
    if (profile?.address) {
      const parts = profile.address.split(' || ');
      if (parts.length === 2) {
        form.setValue('name', parts[0]);
        form.setValue('address', parts[1]);
      } else {
        form.setValue('address', profile.address);
      }
    }
  }, [profile, form]);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          Pharmacist Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome, {profile?.full_name || 'Pharmacist'}. Manage your pharmacy inventory and public information.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Overview</CardTitle>
            <CardDescription>A summary of your current stock status based on the database.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
            <div className="rounded-lg border p-4">
              <PackageCheck className="mx-auto h-8 w-8 text-green-600" />
              <p className="mt-2 text-2xl font-bold">{stats.inStock}</p>
              <p className="text-sm text-muted-foreground">In Stock</p>
            </div>
            <div className="rounded-lg border p-4">
              <Package className="mx-auto h-8 w-8 text-yellow-600" />
              <p className="mt-2 text-2xl font-bold">{stats.lowStock}</p>
              <p className="text-sm text-muted-foreground">Low Stock</p>
            </div>
            <div className="rounded-lg border p-4">
              <PackageX className="mx-auto h-8 w-8 text-red-600" />
              <p className="mt-2 text-2xl font-bold">{stats.outOfStock}</p>
              <p className="text-sm text-muted-foreground">Out of Stock</p>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/pharmacist/inventory" className="w-full">
              <Button variant="outline" className="w-full">Manage Inventory</Button>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Pharmacy Location</CardTitle>
                <CardDescription>
                  Enter a precise address for delivery logistics.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pharmacy Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Jan Aushadhi Kendra" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Address</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 123, Village Market Rd, Rampur, Uttar Pradesh" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="mt-auto">
                <Button type="submit" className="w-full">
                  <Save className="mr-2 h-4 w-4" /> Save Location
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
