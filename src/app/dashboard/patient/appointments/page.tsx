'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Video, Building, Loader2, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useDoctors } from '@/hooks/useDoctors';
import { useAppointments } from '@/hooks/useAppointments';

const availableTimeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM",
];

const appointmentSchema = z.object({
  department: z.string().min(1, 'Please select a department.'),
  doctorId: z.string().min(1, 'Please select a doctor.'),
  appointmentDate: z.string().min(1, 'Please select a date.'),
  appointmentTime: z.string().min(1, 'Please select a time slot.'),
  consultationType: z.enum(['Video', 'In-Person'], { required_error: 'Please select a consultation type.' }),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export default function AppointmentsPage() {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const { profile, loading: authLoading } = useAuth();
  const { doctors, loading: doctorsLoading } = useDoctors();
  const { createAppointment, loading: bookingLoading } = useAppointments();

  // Dynamically get departments from doctors who have specializations
  const availableDepartments = useMemo(() => {
    const specializations = doctors
      .filter(d => d.specialization && d.specialization.trim() !== '')
      .map(d => d.specialization as string);

    // Get unique specializations
    const uniqueSpecializations = Array.from(new Set(specializations)).sort();

    console.log('Available departments from doctors:', uniqueSpecializations);
    return uniqueSpecializations;
  }, [doctors]);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      consultationType: 'Video',
      department: '',
      doctorId: '',
      appointmentDate: format(new Date(), 'yyyy-MM-dd'),
      appointmentTime: '',
    },
  });

  const onSelectDepartment = (dept: string) => {
    setSelectedDepartment(dept);
    form.setValue('department', dept);
    form.setValue('doctorId', ''); // Reset doctor selection
  };

  const onSubmit = async (data: AppointmentFormValues) => {
    if (!profile?.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to book an appointment.',
      });
      return;
    }

    const selectedDoctor = doctors.find(d => d.id === data.doctorId);
    if (!selectedDoctor) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Selected doctor not found.',
      });
      return;
    }

    const result = await createAppointment({
      patient_id: profile.id,
      doctor_id: data.doctorId,
      appointment_date: new Date(data.appointmentDate),
      appointment_time: data.appointmentTime,
      consultation_type: data.consultationType,
      status: 'Upcoming',
      notes: '',
    });

    if (result) {
      toast({
        title: 'Appointment Booked!',
        description: `Your ${data.consultationType} appointment with Dr. ${selectedDoctor.full_name} has been scheduled for ${format(new Date(data.appointmentDate), 'PPP')} at ${data.appointmentTime}.`,
      });
      form.reset();
      setSelectedDepartment('');
    } else {
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: 'Unable to book appointment. Please try again.',
      });
    }
  };

  // Filter doctors by selected department
  const filteredDoctors = selectedDepartment
    ? doctors.filter(d => d.specialization === selectedDepartment)
    : [];

  // Debug logging
  console.log('All doctors:', doctors);
  console.log('Selected department:', selectedDepartment);
  console.log('Filtered doctors:', filteredDoctors);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Book an Appointment</h1>
        <p className="text-muted-foreground">Choose your preferred doctor, date, and time for your consultation.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Appointment Details</CardTitle>
          <CardDescription>Fill out the form below to schedule your next visit.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Department Selection */}
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Department/Specialization</FormLabel>
                      <Select onValueChange={onSelectDepartment} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              doctorsLoading
                                ? "Loading departments..."
                                : availableDepartments.length === 0
                                  ? "No doctors available"
                                  : "Choose a specialization..."
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableDepartments.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">
                              No departments available
                            </div>
                          ) : (
                            availableDepartments.map(dept => (
                              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Consultation Type */}
                <FormField
                  control={form.control}
                  name="consultationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consultation Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Video" id="video" />
                            <label htmlFor="video" className="flex items-center cursor-pointer">
                              <Video className="mr-2 h-4 w-4" />
                              Video Consultation
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="In-Person" id="in-person" />
                            <label htmlFor="in-person" className="flex items-center cursor-pointer">
                              <Building className="mr-2 h-4 w-4" />
                              In-Person Visit
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Doctor Selection */}
                <FormField
                  control={form.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Doctor</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedDepartment || doctorsLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              !selectedDepartment
                                ? "Select a specialization first"
                                : doctorsLoading
                                  ? "Loading doctors..."
                                  : "Choose a doctor..."
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredDoctors.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">
                              No doctors available in this specialty
                            </div>
                          ) : (
                            filteredDoctors.map(doctor => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                Dr. {doctor.full_name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Appointment Date */}
                <FormField
                  control={form.control}
                  name="appointmentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appointment Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} min={format(new Date(), 'yyyy-MM-dd')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Time Slot */}
                <FormField
                  control={form.control}
                  name="appointmentTime"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Available Time Slots</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableTimeSlots.map(slot => (
                            <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={bookingLoading} className="w-full md:w-auto">
                {bookingLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Booking...</>
                ) : (
                  <><Calendar className="mr-2 h-4 w-4" /> Confirm Appointment</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
