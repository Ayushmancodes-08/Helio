'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray, Control, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Save, Users, Bed, Ambulance, User, UserCog, Loader2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useDistricts, useHospitals } from '@/hooks/useHealthData';
import { useAuth } from '@/hooks/useAuth';

// Schema Validation
const hospitalSchema = z.object({
  id: z.string(),
  name: z.string(),
  population: z.coerce.number().min(0),
  occupied_beds: z.coerce.number().min(0),
  total_beds: z.coerce.number().min(0),
  ambulances: z.coerce.number().min(0),
  doctors: z.coerce.number().min(0),
  nurses: z.coerce.number().min(0),
});

const districtSchema = z.object({
  id: z.string(),
  districtName: z.string(),
  hospitals: z.array(hospitalSchema),
});

const regionalDataSchema = z.object({
  districts: z.array(districtSchema),
});

type FormValues = z.infer<typeof regionalDataSchema>;

export default function HospitalInfrastructurePage() {
  const { toast } = useToast();
  const { profile } = useAuth();

  // Real DB Hooks
  const { districts, loading: districtsLoading } = useDistricts();
  // We need to fetch hospitals for EACH district. 
  // Optimization: Fetch ALL hospitals once and filter in memory for form mapping?
  // Since we don't have a "fetch all hospitals" hook exposed yet, we rely on the implementation detail 
  // that useHospitals can be used without districtId if we modified it, or we instantiate it per district logic.
  // Actually, useHealthData.ts shows fetchHospitals uses districtId optionally. If I pass nothing, does it fetch all?
  // Looking at previous file view: fetchHospitals... if(districtId) query.eq... else select all. Yes!
  const { hospitals: allHospitals, loading: hospitalsLoading, updateHospital, refresh: refreshHospitals } = useHospitals();

  const loading = districtsLoading || hospitalsLoading;

  const form = useForm<FormValues>({
    resolver: zodResolver(regionalDataSchema),
    defaultValues: {
      districts: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "districts",
  });

  useEffect(() => {
    if (!loading && districts.length > 0) {
      // Map DB data to Form Structure
      const mappedData = districts.map(dist => {
        const distHospitals = allHospitals
          .filter(h => h.district_id === dist.id)
          .map(h => ({
            id: h.id,
            name: h.name,
            population: h.population,
            occupied_beds: h.occupied_beds,
            total_beds: h.total_beds,
            ambulances: h.ambulances,
            doctors: h.doctors,
            nurses: h.nurses
          }));

        return {
          id: dist.id,
          districtName: dist.name,
          hospitals: distHospitals
        };
      });

      replace(mappedData);
    }
  }, [districts, allHospitals, loading, replace]);

  const onSubmit = async (data: FormValues) => {
    // We need to iterate and identify CHANGED hospitals to update.
    // For simplicity efficiently, we can just update all, or check dirty fields if we had them easily.
    // Let's just update all hospitals in the form for now (MVP).

    let successCount = 0;
    let failCount = 0;

    for (const district of data.districts) {
      for (const hospital of district.hospitals) {
        const res = await updateHospital(hospital.id, {
          population: hospital.population,
          occupied_beds: hospital.occupied_beds,
          total_beds: hospital.total_beds,
          ambulances: hospital.ambulances,
          doctors: hospital.doctors,
          nurses: hospital.nurses
        });
        if (res.success) successCount++;
        else failCount++;
      }
    }

    if (failCount === 0 && successCount > 0) {
      toast({
        title: 'Data Saved!',
        description: `Updated infrastructure for ${successCount} hospitals.`,
      });
      refreshHospitals();
    } else if (failCount > 0) {
      toast({
        variant: 'destructive',
        title: 'Update Issues',
        description: `Saved ${successCount}, failed ${failCount}.`,
      });
    } else {
      toast({
        description: 'No hospitals to update.',
      });
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Manage Hospital Infrastructure</h1>
        <p className="text-muted-foreground">
          Update resource metrics for hospitals. Changes reflect immediately on the Dashboard.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {fields.length > 0 ? fields.map((field, index) => (
            <DistrictInfrastructureCard
              key={field.id}
              districtIndex={index}
              control={form.control}
            />
          )) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No districts/hospitals found in the database.</p>
                <p className="text-sm mt-2">Go to "Districts & Hospitals" to set up the infrastructure first.</p>
              </CardContent>
            </Card>
          )}

          {fields.length > 0 && (
            <div className="flex justify-end">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save All Changes
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}

function DistrictInfrastructureCard({ districtIndex, control }: { districtIndex: number; control: Control<FormValues> }) {
  const districtData = useWatch({
    control,
    name: `districts.${districtIndex}`,
  });

  const { fields } = useFieldArray({
    control,
    name: `districts.${districtIndex}.hospitals`,
  });

  // Calculate totals for UI display
  const totals = (districtData.hospitals || []).reduce(
    (acc, hospital) => {
      acc.population += Number(hospital.population) || 0;
      acc.occupied_beds += Number(hospital.occupied_beds) || 0;
      acc.total_beds += Number(hospital.total_beds) || 0;
      acc.ambulances += Number(hospital.ambulances) || 0;
      acc.doctors += Number(hospital.doctors) || 0;
      acc.nurses += Number(hospital.nurses) || 0;
      return acc;
    },
    {
      population: 0,
      occupied_beds: 0,
      total_beds: 0,
      ambulances: 0,
      doctors: 0,
      nurses: 0,
    }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{districtData.districtName}</CardTitle>
        <CardDescription>District Totals (Calculated from Hospitals below)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center mb-6">
          <div className="rounded-lg border p-3">
            <Users className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-1 text-xl font-bold">{totals.population.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Population</p>
          </div>
          <div className="rounded-lg border p-3">
            <Bed className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-1 text-xl font-bold">{totals.occupied_beds}</p>
            <p className="text-xs text-muted-foreground">Occupied Beds</p>
          </div>
          <div className="rounded-lg border p-3">
            <Bed className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-1 text-xl font-bold">{totals.total_beds}</p>
            <p className="text-xs text-muted-foreground">Total Beds</p>
          </div>
          <div className="rounded-lg border p-3">
            <Ambulance className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-1 text-xl font-bold">{totals.ambulances}</p>
            <p className="text-xs text-muted-foreground">Ambulances</p>
          </div>
          <div className="rounded-lg border p-3">
            <User className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-1 text-xl font-bold">{totals.doctors}</p>
            <p className="text-xs text-muted-foreground">Doctors</p>
          </div>
          <div className="rounded-lg border p-3">
            <UserCog className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-1 text-xl font-bold">{totals.nurses}</p>
            <p className="text-xs text-muted-foreground">Nurses</p>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {fields.map((hospitalField, hospitalIndex) => (
            <AccordionItem key={hospitalField.id} value={`item-${hospitalIndex}`}>
              <AccordionTrigger>
                <span className="font-medium">{districtData.hospitals[hospitalIndex].name}</span>
              </AccordionTrigger>
              <AccordionContent>
                <HospitalInfrastructureForm districtIndex={districtIndex} hospitalIndex={hospitalIndex} control={control} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}


function HospitalInfrastructureForm({ districtIndex, hospitalIndex, control }: { districtIndex: number; hospitalIndex: number; control: Control<FormValues> }) {
  return (
    <div className="space-y-4 rounded-md border p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          control={control}
          name={`districts.${districtIndex}.hospitals.${hospitalIndex}.population`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Population Served</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`districts.${districtIndex}.hospitals.${hospitalIndex}.occupied_beds`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Occupied Beds</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`districts.${districtIndex}.hospitals.${hospitalIndex}.total_beds`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Beds</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`districts.${districtIndex}.hospitals.${hospitalIndex}.ambulances`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ambulances</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`districts.${districtIndex}.hospitals.${hospitalIndex}.doctors`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Doctors</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`districts.${districtIndex}.hospitals.${hospitalIndex}.nurses`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nurses</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
