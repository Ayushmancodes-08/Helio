'use client';

import { useTranslations } from 'next-intl';
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
import { useLanguage } from '@/hooks/useLanguage';
import { getSuccessMessageTranslation, getErrorMessageTranslation } from '@/lib/notification-translations';

import { MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const LeafletMap = dynamic(
  () => import('@/components/LeafletMap'),
  {
    loading: () => <div className="h-[300px] w-full flex items-center justify-center bg-muted/10 rounded-xl border border-border/50"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
    ssr: false
  }
);

const locationSchema = z.object({
  name: z.string().min(1, 'Pharmacy name is required.'),
  address: z.string().min(10, 'A precise, searchable address is required for directions.'),
});

type LocationFormValues = z.infer<typeof locationSchema>;

// Initial location is empty, will be filled by profile
const getInitialLocation = () => ({ name: '', address: '' });

import { usePharmacistDashboard } from '@/hooks/usePharmacistDashboard';

export default function PharmacistDashboardPage() {
  const { t, locale } = useLanguage();
  const { toast } = useToast();

  // Use aggregated hook
  const { profile, stats, loading: dashboardLoading } = usePharmacistDashboard();
  const { t: tCommon } = useLanguage();

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: getInitialLocation(),
  });

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Supabase client
  const supabase = createClient();

  const onSubmit = async (data: LocationFormValues) => {
    if (!profile?.id) return;

    try {
      // Save to Supabase Profile (combining name and address for now as we lack a specific column)
      // Or just update address and assume Name is the User's name? 
      // Let's store "Pharmacy Name: Address" in the address field to keep it simple but persistent.
      const combinedAddress = `${data.name} || ${data.address}`;

      const updateData: any = { address: combinedAddress };
      if (selectedLocation) {
        updateData.latitude = selectedLocation.lat;
        updateData.longitude = selectedLocation.lng;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: getSuccessMessageTranslation('profileUpdated', t),
      });

      // Location now fully handled by Supabase profile
    } catch (error) {
      console.error("Failed to save location", error);
      toast({
        variant: 'destructive',
        title: getErrorMessageTranslation('profileUpdateFailed', t),
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

    // Load persisted coordinates if they exist
    if ((profile as any).latitude && (profile as any).longitude) {
      setSelectedLocation({
        lat: (profile as any).latitude,
        lng: (profile as any).longitude
      });
    }
  }, [profile, form]);

  if (dashboardLoading) {
    return <div className="p-8 flex justify-center"><p>{tCommon('common.loading')}</p></div>;
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          {t('pharmacist.pharmacistDashboard')}
        </h1>
        <p className="text-muted-foreground">
          {t('pharmacist.welcome', { name: profile?.full_name || 'Pharmacist' })}. {t('pharmacist.managePharmacy')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('pharmacist.inventoryOverview')}</CardTitle>
            <CardDescription>{t('pharmacist.summaryOfCurrentStockStatus')}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
            <div className="rounded-lg border p-4">
              <PackageCheck className="mx-auto h-8 w-8 text-green-600" />
              <p className="mt-2 text-2xl font-bold">{stats.inStock}</p>
              <p className="text-sm text-muted-foreground">{t('pharmacist.inStock')}</p>
            </div>
            <div className="rounded-lg border p-4">
              <Package className="mx-auto h-8 w-8 text-yellow-600" />
              <p className="mt-2 text-2xl font-bold">{stats.lowStock}</p>
              <p className="text-sm text-muted-foreground">{t('pharmacist.lowStock')}</p>
            </div>
            <div className="rounded-lg border p-4">
              <PackageX className="mx-auto h-8 w-8 text-red-600" />
              <p className="mt-2 text-2xl font-bold">{stats.outOfStock}</p>
              <p className="text-sm text-muted-foreground">{t('pharmacist.outOfStock')}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Link href={`/${locale}/dashboard/pharmacist/inventory`} className="w-full">
              <Button variant="outline" className="w-full">{t('pharmacist.manageInventoryButton')}</Button>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>{t('pharmacist.pharmacyLocation')}</CardTitle>
                <CardDescription>
                  {t('pharmacist.enterPreciseAddressForDeliveryLogistics')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('pharmacist.pharmacyName')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('pharmacist.pharmacyNamePlaceholder')} {...field} />
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
                      <FormLabel>{t('pharmacist.fullAddress')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('pharmacist.fullAddressPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location Picker Map */}
                <div className="space-y-2">
                  <FormLabel>Pin Exact Location</FormLabel>
                  <p className="text-xs text-muted-foreground">Click on the map to set your pharmacy's exact location.</p>
                  <div className="h-[300px] w-full rounded-lg overflow-hidden border">
                    <LeafletMap
                      className="h-full w-full"
                      center={selectedLocation ? { latitude: selectedLocation.lat, longitude: selectedLocation.lng } : { latitude: 19.314962, longitude: 84.794091 }}
                      locations={selectedLocation ? [{
                        id: 'selected',
                        latitude: selectedLocation.lat,
                        longitude: selectedLocation.lng,
                        title: 'Selected Location',
                        type: 'pharmacy'
                      }] : []}
                      onLocationSelect={(lat, lng) => setSelectedLocation({ lat, lng })}
                      interactive={true}
                    />
                  </div>
                  {selectedLocation && (
                    <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Location set: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                    </p>
                  )}
                </div>

              </CardContent>
              <CardFooter className="mt-auto">
                <Button type="submit" className="w-full">
                  <Save className="mr-2 h-4 w-4" /> {t('pharmacist.saveLocation')}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
