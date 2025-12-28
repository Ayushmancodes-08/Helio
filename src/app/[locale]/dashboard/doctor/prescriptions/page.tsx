'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { PlusCircle, FileSearch, Loader2, X } from 'lucide-react';
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
import { useLanguage } from '@/hooks/useLanguage';

const medicineSchema = z.object({
  medication: z.string().min(1, 'Medication name is required.'),
  dosage: z.string().min(1, 'Dosage is required.'),
  instructions: z.string().min(1, 'Instructions are required.'),
});

const prescriptionSchema = z.object({
  patientId: z.string().min(1, 'Please select a patient.'),
  medicines: z.array(medicineSchema).min(1, 'At least one medicine is required.'),
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
  const { t } = useLanguage();

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
      medicines: [{ medication: '', dosage: '', instructions: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'medicines',
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
      // Combine all medicines into a single prescription
      const medicinesData = JSON.stringify(data.medicines);

      const result = await createPrescription({
        doctor_id: profile.id,
        patient_id: data.patientId,
        medication: medicinesData, // Store as JSON string
        dosage: `${data.medicines.length} medicine(s)`, // Summary info
        instructions: 'See prescription details for individual medicine instructions',
        status: 'Issued',
        appointment_id: null,
      });

      if (result) {
        toast({
          title: 'Prescription Created',
          description: `Successfully issued prescription with ${data.medicines.length} medicine(s).`,
        });
        form.reset({
          patientId: '',
          medicines: [{ medication: '', dosage: '', instructions: '' }],
        });
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
            {t('doctor.managePrescriptions')}
          </h1>
          <p className="text-muted-foreground">
            {t('doctor.createNewPrescriptions')}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('doctor.createNewPrescription')}</CardTitle>
          <CardDescription>
            {t('doctor.selectPatientFillMedication')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Patient Selection */}
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.patient')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('common.select')} />
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
                            {t('common.noPatients')}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Medicine Rows */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Medicines</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ medication: '', dosage: '', instructions: '' })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Medicine
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="relative p-4 border rounded-lg bg-muted/30">
                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name={`medicines.${index}.medication`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medicine Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Paracetamol" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`medicines.${index}.dosage`}
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
                        name={`medicines.${index}.instructions`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instructions</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Twice daily" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button type="submit" disabled={prescriptionsLoading}>
                {prescriptionsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('doctor.issuePrescription')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>{t('doctor.recentPrescriptions')}</CardTitle>
              <CardDescription>
                {t('doctor.mostRecentlyIssued')}
              </CardDescription>
            </div>
            <div className="relative">
              <FileSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('doctor.searchByPatientMedication')}
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
                  <TableHead>{t('common.patient')}</TableHead>
                  <TableHead>{t('doctor.medication')}</TableHead>
                  <TableHead>{t('doctor.date')}</TableHead>
                  <TableHead>{t('doctor.status')}</TableHead>
                  <TableHead className="text-right">{t('doctor.viewDetails')}</TableHead>
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
                      <Badge>{t('doctor.issued')}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(presc)}>
                        {t('common.view')}
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      {t('doctor.noPrescriptionsFound')}
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
            <DialogTitle>{t('doctor.prescriptionDetails')}</DialogTitle>
            <DialogDescription>
              {t('doctor.viewingPrescriptionFor', { patient: selectedPrescription?.patient?.full_name, date: selectedPrescription?.issued_date ? format(new Date(selectedPrescription.issued_date), 'PPP') : '' })}
            </DialogDescription>
          </DialogHeader>
          {selectedPrescription && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">{t('common.patient')}</h4>
                <p>{selectedPrescription.patient?.full_name}</p>
              </div>
              <div>
                <h4 className="font-semibold">{t('doctor.medication')}</h4>
                <p>{selectedPrescription.medication_name}</p>
              </div>
              <div>
                <h4 className="font-semibold">{t('doctor.dosage')}</h4>
                <p>{selectedPrescription.dosage}</p>
              </div>
              <div>
                <h4 className="font-semibold">{t('doctor.frequency')}</h4>
                <p>{selectedPrescription.frequency}</p>
              </div>
              <div>
                <h4 className="font-semibold">{t('doctor.notes')}</h4>
                <p>{selectedPrescription.notes}</p>
              </div>
              <div>
                <h4 className="font-semibold">{t('doctor.status')}</h4>
                <Badge variant={getStatusVariant(selectedPrescription.status)}>
                  {selectedPrescription.status}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
