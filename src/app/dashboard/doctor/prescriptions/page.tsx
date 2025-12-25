'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, FileSearch, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { usePrescriptions } from '@/hooks/usePrescriptions';

const prescriptionSchema = z.object({
  patientId: z.string().min(1, 'Please select a patient.'),
  medication: z.string().min(1, 'Medication name is required.'),
  dosage: z.string().min(1, 'Dosage is required.'),
  instructions: z.string().min(1, 'Instructions are required.'),
});

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;

// Helper function to map database prescription to UI type if needed, 
// but we should try to use the hook's type directly.
// For now, let's look at what usePrescriptions returns.

export default function PrescriptionsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null);

  const { profile } = useAuth();
  const { appointments } = useAppointments(); // To get patient list
  const { prescriptions, createPrescription, loading: prescriptionsLoading } = usePrescriptions();

  // Derive unique patients from appointments to populate dropdown
  const myPatients = useMemo(() => {
    if (!appointments) return [];

    // Create a map of unique patients
    const unique = new Map();
    appointments.forEach(appt => {
      if (appt.patient_id && appt.patient_name) {
        unique.set(appt.patient_id, appt.patient_name);
      }
    });

    return Array.from(unique.entries()).map(([id, name]) => ({
      id,
      name
    }));
  }, [appointments]);

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientId: '',
      medication: '',
      dosage: '',
      instructions: '',
    },
  });

  const onSubmit = async (data: PrescriptionFormValues) => {
    if (!profile?.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to create a prescription.',
      });
      return;
    }

    try {
      const result = await createPrescription({
        doctor_id: profile.id,
        patient_id: data.patientId,
        medication: data.medication,
        dosage: data.dosage,
        instructions: data.instructions,
        // Remove unused/mismatched fields
      });

      if (result) {
        toast({
          title: 'Prescription Created',
          description: `A new prescription has been issued successfully.`,
        });
        form.reset();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to create prescription.',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred.',
      });
    }
  };

  const handleViewDetails = (prescription: any) => {
    setSelectedPrescription(prescription);
    setIsDetailDialogOpen(true);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Filled':
        return 'secondary'; // Green-ish usually or gray
      case 'Active':
      case 'Pending':
        return 'default'; // Primary color
      default:
        return 'outline';
    }
  };

  const filteredPrescriptions = useMemo(() => {
    if (!prescriptions) return [];
    return prescriptions.filter(
      (presc) =>
        (presc.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        presc.medication.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [prescriptions, searchTerm]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">
            Manage Prescriptions
          </h1>
          <p className="text-muted-foreground">
            Create new prescriptions and view recent history.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Prescription</CardTitle>
          <CardDescription>
            Select a patient and fill in the medication details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a patient" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {myPatients.length > 0 ? (
                            myPatients.map((patient) => (
                              <SelectItem key={patient.id} value={patient.id}>
                                {patient.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground">
                              No patients found from appointments.
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="medication"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medication Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Paracetamol" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dosage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosage</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 500mg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Take one tablet twice a day after meals."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={prescriptionsLoading}>
                {prescriptionsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <PlusCircle className="mr-2 h-4 w-4" />
                Issue Prescription
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Recent Prescriptions</CardTitle>
              <CardDescription>
                A list of the most recently issued prescriptions.
              </CardDescription>
            </div>
            <div className="relative">
              <FileSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by patient or medication..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 md:w-64 lg:w-80"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {prescriptionsLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Medication</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.length > 0 ? filteredPrescriptions.map((presc) => (
                  <TableRow key={presc.id}>
                    <TableCell className="font-medium">
                      {presc.patient_name || 'Unknown'}
                    </TableCell>
                    <TableCell>{presc.medication} {presc.dosage}</TableCell>
                    <TableCell>{format(new Date(presc.issued_date), 'PPP')}</TableCell>
                    <TableCell>
                      <Badge>Issued</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(presc)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No prescriptions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Prescription Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogDescription>
              Viewing prescription for {selectedPrescription?.patient?.full_name} issued on {selectedPrescription?.issued_date ? format(new Date(selectedPrescription.issued_date), 'PPP') : ''}.
            </DialogDescription>
          </DialogHeader>
          {selectedPrescription && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Patient</h4>
                <p>{selectedPrescription.patient?.full_name}</p>
              </div>
              <div>
                <h4 className="font-semibold">Medication</h4>
                <p>{selectedPrescription.medication_name}</p>
              </div>
              <div>
                <h4 className="font-semibold">Dosage</h4>
                <p>{selectedPrescription.dosage}</p>
              </div>
              <div>
                <h4 className="font-semibold">Frequency/Instructions</h4>
                <p>{selectedPrescription.frequency}</p>
              </div>
              <div>
                <h4 className="font-semibold">Notes</h4>
                <p>{selectedPrescription.notes}</p>
              </div>
              <div>
                <h4 className="font-semibold">Status</h4>
                <Badge variant={getStatusVariant(selectedPrescription.status)}>
                  {selectedPrescription.status}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
