'use client';

import { useParams, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Download, FileText, Calendar, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useAppointments } from '@/hooks/useAppointments';
import { useLabReports } from '@/hooks/useLabReports';
import { createClient } from '@/lib/supabase/client';

type PatientDetails = {
  id: string;
  name: string;
  age: number | string;
  lastVisit: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
}

export default function PatientHistoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const patientId = params.patientId as string;

  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { labReports, loading: reportsLoading } = useLabReports();
  const supabase = createClient();

  useEffect(() => {
    async function fetchPatientProfile() {
      if (!patientId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', patientId)
          .single();

        if (data) {
          // Calculate last visit from appointments
          const patientApps = appointments.filter(a => a.patient_id === patientId);
          let lastVisitStr = 'N/A';
          if (patientApps.length > 0) {
            const sorted = [...patientApps].sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());
            lastVisitStr = format(new Date(sorted[0].appointment_date), 'PPP');
          }

          setPatient({
            id: data.id,
            name: data.full_name,
            age: 'N/A', // Age is not in profile schema yet, use placeholder
            lastVisit: lastVisitStr,
            avatarUrl: data.photo || undefined,
            email: data.email,
            phone: data.phone,
          });
        }
      } catch (e) {
        console.error("Error fetching patient profile", e);
      } finally {
        setLoading(false);
      }
    }

    fetchPatientProfile();
  }, [patientId, appointments]); // Re-run when appointments load to update last visit

  const patientAppointments = appointments
    .filter(a => a.patient_id === patientId && a.status !== 'Upcoming')
    .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());

  const patientReports = labReports
    .filter(r => r.patient_id === patientId)
    .sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime());

  // Also include Upcoming appointments? The old code filtered them out. Keeping it consistent.
  // Actually, showing history usually implies completed/past interactions. 

  const isLoading = loading || appointmentsLoading || reportsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-2xl font-bold">Patient not found</h1>
        <p className="text-muted-foreground">The requested patient record could not be found.</p>
        <Link href="/dashboard/doctor/patients">
          <Button variant="outline" className="mt-4">Back to Patients List</Button>
        </Link>
      </div>
    );
  }

  const handleDownload = (fileName: string) => {
    // In a real app, this would use a signed URL from Supabase Storage
    alert(`Downloading ${fileName}... (Feature to be implemented with Storage)`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col items-start gap-4 sm:flex-row">
          <Avatar className="h-20 w-20">
            {patient.avatarUrl && (
              <AvatarImage
                src={patient.avatarUrl}
                alt={patient.name}
              />
            )}
            <AvatarFallback className="text-3xl">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-3xl font-bold">{patient.name}</CardTitle>
            <CardDescription className="text-base text-muted-foreground flex gap-4 mt-2">
              <span>ID: {patient.id.slice(0, 8)}...</span>
              <span>&bull;</span>
              <span>Last Visit: {patient.lastVisit}</span>
              {patient.email && (
                <>
                  <span>&bull;</span>
                  <span>{patient.email}</span>
                </>
              )}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Consultation History
          </CardTitle>
          <CardDescription>
            A log of past appointments and clinical notes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patientAppointments.map((consult, index) => (
              <div key={index} className="flex gap-4 rounded-lg border bg-secondary/50 p-4">
                <div className="flex flex-col items-center min-w-[60px]">
                  <p className="font-bold">{new Date(consult.appointment_date).getDate()}</p>
                  <p className="text-xs uppercase">{new Date(consult.appointment_date).toLocaleString('default', { month: 'short' })}</p>
                  <p className="text-xs text-muted-foreground">{new Date(consult.appointment_date).getFullYear()}</p>
                </div>
                <div className="border-l pl-4">
                  <p className="font-semibold">{consult.consultation_type} Consultation with {consult.doctor_name || 'Doctor'}</p>
                  <p className="text-sm mt-1">{consult.notes || "No notes for this consultation."}</p>
                </div>
              </div>
            ))}
            {patientAppointments.length === 0 && (
              <p className="text-center text-muted-foreground h-24 flex items-center justify-center">No past consultation history available.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lab Reports
          </CardTitle>
          <CardDescription>
            Downloadable copies of past laboratory test results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patientReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.report_name}</TableCell>
                  <TableCell>{format(new Date(report.report_date), 'PPP')}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => report.file_name && handleDownload(report.file_name)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {patientReports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                    No lab reports available for this patient.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
