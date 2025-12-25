'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Save, PlusCircle, Trash2, Hospital as HospitalIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useDistricts, useHospitals } from '@/hooks/useHealthData';

// This page now interacts directly with Supabase via hooks
// No massive form state needed for "All Data", we just add/remove items transactionally

export default function ManageDistrictsAndHospitalsPage() {
  const { toast } = useToast();
  const [newDistrictName, setNewDistrictName] = useState('');

  const { districts, loading: districtsLoading, addDistrict, deleteDistrict } = useDistricts();
  const { hospitals: allHospitals, loading: hospitalsLoading, addHospital, deleteHospital, refresh: refreshHospitals } = useHospitals();

  const loading = districtsLoading || hospitalsLoading;

  const handleAddDistrict = async () => {
    if (newDistrictName.trim() === '') {
      toast({ variant: 'destructive', title: 'District name cannot be empty.' });
      return;
    }
    const res = await addDistrict(newDistrictName);
    if (res.success) {
      toast({ title: 'District Added', description: `${newDistrictName} created.` });
      setNewDistrictName('');
    } else {
      toast({ variant: 'destructive', title: 'Error', description: res.error });
    }
  };

  const handleDeleteDistrict = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name} and ALL its hospitals?`)) return;
    const res = await deleteDistrict(id);
    if (res.success) {
      toast({ title: 'District Deleted', description: `${name} removed.` });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: res.error });
    }
  }

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Manage Districts & Hospitals</h1>
        <p className="text-muted-foreground">
          Create the hierarchy of Districts and Hospitals here. Use "Hospital Data Entry" to add patient cases.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New District</CardTitle>
          <CardDescription>Enter the name of a new district.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-sm flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              value={newDistrictName}
              onChange={(e) => setNewDistrictName(e.target.value)}
              placeholder="e.g., Lucknow"
            />
            <Button onClick={handleAddDistrict} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Add District
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {districts.map(district => (
          <DistrictCard
            key={district.id}
            district={district}
            hospitals={allHospitals.filter(h => h.district_id === district.id)}
            onDeleteDistrict={() => handleDeleteDistrict(district.id, district.name)}
            onAddHospital={addHospital}
            onDeleteHospital={deleteHospital}
          />
        ))}
        {districts.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No districts found. Add one to get started.</p>
        )}
      </div>
    </div>
  );
}

function DistrictCard({
  district,
  hospitals,
  onDeleteDistrict,
  onAddHospital,
  onDeleteHospital
}: {
  district: any,
  hospitals: any[],
  onDeleteDistrict: () => void,
  onAddHospital: (data: any) => Promise<any>,
  onDeleteHospital: (id: string) => Promise<any>
}) {
  const [newHospitalName, setNewHospitalName] = useState('');
  const { toast } = useToast();

  const handleAddHospital = async () => {
    if (!newHospitalName.trim()) return;

    const res = await onAddHospital({
      name: newHospitalName,
      district_id: district.id,
      // Initialize with zeroes
      population: 0,
      total_beds: 0,
      occupied_beds: 0,
      ambulances: 0,
      doctors: 0,
      nurses: 0
    });

    if (res.success) {
      toast({ title: 'Hospital Added', description: `${newHospitalName} added to ${district.name}.` });
      setNewHospitalName('');
    } else {
      toast({ variant: 'destructive', title: 'Error', description: res.error });
    }
  };

  const handleDeleteHospital = async (id: string) => {
    const res = await onDeleteHospital(id);
    if (!res.success) {
      toast({ variant: 'destructive', title: 'Error', description: res.error });
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">{district.name}</CardTitle>
          <CardDescription>{hospitals.length} Hospitals</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onDeleteDistrict} className="text-destructive hover:text-destructive/90 hover:bg-destructive/10">
          <Trash2 className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 mt-4">
        {hospitals.map(hospital => (
          <div key={hospital.id} className="flex items-center justify-between rounded-md border p-3 bg-muted/20">
            <div className="flex items-center gap-3">
              <HospitalIcon className="h-4 w-4 text-primary" />
              <span className="font-medium">{hospital.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleDeleteHospital(hospital.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={newHospitalName}
            onChange={(e) => setNewHospitalName(e.target.value)}
            placeholder="New Hospital Name"
            className="h-9"
          />
          <Button variant="secondary" size="sm" onClick={handleAddHospital} className="w-full sm:w-auto h-9">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Hospital
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
