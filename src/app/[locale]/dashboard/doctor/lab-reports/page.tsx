'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileSearch, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { useLabReports } from '@/hooks/useLabReports';

const labReportSchema = z.object({
  patientId: z.string().min(1, 'Please select a patient.'),
  reportName: z.string().min(1, 'Report name is required.'),
  // In a real app, validation for file object would be stricter.
  // For now, checking if FileList has length > 0
  reportFile: z.any().optional(),
});

type LabReportFormValues = z.infer<typeof labReportSchema>;

export default function LabReportsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const { profile } = useAuth();
  const { appointments } = useAppointments(); // To get patient list
  const { labReports, createLabReport, loading: reportsLoading } = useLabReports();

  // Derive unique patients from appointments
  const myPatients = useMemo(() => {
    if (!appointments) return [];

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

  const form = useForm<LabReportFormValues>({
    resolver: zodResolver(labReportSchema),
    defaultValues: {
      patientId: '',
      reportName: '',
      reportFile: undefined,
    },
  });

  const onSubmit = async (data: LabReportFormValues) => {
    if (!profile?.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to upload a report.',
      });
      return;
    }

    // Handle File Upload
    const file = data.reportFile && data.reportFile.length > 0 ? data.reportFile[0] : null;

    if (!file) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a file to upload.',
      });
      return;
    }

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const fileExt = file.name.split('.').pop();
      const fileName = `${data.reportName.replace(/\s+/g, '_')}_${Date.now()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`; // Organize by doctor ID

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('reports')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('reports')
        .getPublicUrl(filePath);

      // 3. Create Record in Database
      const result = await createLabReport({
        doctor_id: profile.id,
        patient_id: data.patientId,
        report_name: data.reportName,
        file_name: fileName,
        report_date: new Date(),
        file_url: publicUrl,
        status: 'Available',
      });

      if (result) {
        toast({
          title: 'Lab Report Uploaded',
          description: `Report '${data.reportName}' has been uploaded successfully.`,
        });
        form.reset();
        const fileInput = document.getElementById('reportFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error('Failed to create database record');
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    }
  };

  const handleDownload = (report: any) => {
    // If we had a real file URL, we would open it.
    // For now, since we might have fake URLs, we can alert or try to open.
    if (report.file_url && report.file_url.includes('example.com')) {
      alert("This is a simulated deployment. In production, this would download the real file from Supabase Storage.");
    } else if (report.file_url) {
      window.open(report.file_url, '_blank');
    } else {
      alert("No file attached to this report.");
    }
  };

  const getStatusVariant = (status: string) => {
    return status === 'Available' ? 'secondary' : 'outline';
  };

  const filteredReports = useMemo(() => {
    if (!labReports) return [];
    return labReports.filter(
      (report) =>
        (report.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.report_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [labReports, searchTerm]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Manage Lab Reports</h1>
        <p className="text-muted-foreground">Upload new reports and view patient history.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload New Lab Report</CardTitle>
          <CardDescription>Select a patient and the report file to upload.</CardDescription>
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
                              No patients found.
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
                  name="reportName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Report Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Complete Blood Count" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reportFile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Report File</FormLabel>
                      <FormControl>
                        <Input
                          id="reportFile"
                          type="file"
                          onChange={(e) => field.onChange(e.target.files)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={reportsLoading}>
                {reportsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Upload className="mr-2 h-4 w-4" />
                Upload Report
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Recent Lab Reports</CardTitle>
              <CardDescription>A list of the most recently uploaded reports.</CardDescription>
            </div>
            <div className="relative">
              <FileSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by patient or report name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 md:w-64 lg:w-80"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length > 0 ? filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.patient_name || 'Unknown'}</TableCell>
                    <TableCell>{report.report_name}</TableCell>
                    <TableCell>{format(new Date(report.report_date), 'PPP')}</TableCell>
                    <TableCell>
                      <Badge>Completed</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleDownload(report)}>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground h-24">No lab reports found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
