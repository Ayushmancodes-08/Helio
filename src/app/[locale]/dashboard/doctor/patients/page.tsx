'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FileText, UserSearch, Loader2, Calendar, Phone } from 'lucide-react';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { useLanguage } from '@/hooks/useLanguage';

type PatientSummary = {
  id: string; // This will be the profile id
  name: string;
  phone: string;
  age: number | null;
  lastVisit: Date;
  visitCount: number;
  type: 'Video' | 'In-Person';
  avatarId: string;
}

function PatientsPageComponent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const { profile, loading: authLoading } = useAuth();
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { t } = useLanguage();

  // Derive unique patients from appointments
  const myPatients = useMemo(() => {
    if (!appointments || appointments.length === 0) return [];

    const patientsMap = new Map<string, PatientSummary>();

    appointments.forEach(appt => {
      // Skip if no patient ID
      if (!appt.patient_id) return;

      const existing = patientsMap.get(appt.patient_id);
      const apptDate = new Date(appt.appointment_date);

      if (!existing) {
        patientsMap.set(appt.patient_id, {
          id: appt.patient_id,
          name: appt.patient_name || 'Unknown Patient',
          phone: '', // Phone would need a separate profile fetch or join if critical
          age: null,
          lastVisit: apptDate,
          visitCount: 1,
          type: appt.consultation_type,
          avatarId: 'avatar-patient',
        });
      } else {
        // Update stats
        existing.visitCount++;
        if (apptDate > existing.lastVisit) {
          existing.lastVisit = apptDate;
          existing.type = appt.consultation_type;
        }
      }
    });

    return Array.from(patientsMap.values());
  }, [appointments]);

  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  const filteredPatients = useMemo(() => {
    if (!searchTerm) return myPatients;

    // Use language-aware search that works across language variants
    const normalizedSearch = searchTerm.toLowerCase().trim();
    return myPatients.filter(p =>
      p.name.toLowerCase().includes(normalizedSearch)
    );
  }, [myPatients, searchTerm]);

  if (authLoading || appointmentsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">{t('doctor.myPatients')}</h1>
          <p className="text-muted-foreground">
            {t('doctor.viewManageRecords', { count: myPatients.length })}
          </p>
        </div>
        <div className="relative">
          <UserSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 md:w-64 lg:w-80"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('doctor.recentPatients')}</CardTitle>
          <CardDescription>
            {t('doctor.listOfPatients')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.patient')}</TableHead>
                <TableHead>{t('doctor.lastVisit')}</TableHead>
                <TableHead>{t('doctor.totalVisits')}</TableHead>
                <TableHead>{t('doctor.latestConsultation')}</TableHead>
                {/* <TableHead className="text-right">Actions</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage
                            src={PlaceHolderImages.find((img) => img.id === patient.avatarId)?.imageUrl}
                            alt={patient.name}
                          />
                          <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{patient.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {format(patient.lastVisit, 'PPP')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="pl-4 font-medium">{patient.visitCount}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${patient.type === 'Video' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                        {patient.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/doctor/patients/${patient.id}`}>
                          <FileText className="mr-2 h-4 w-4" /> {t('doctor.viewRecords')}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    {appointments.length === 0
                      ? t('doctor.noPatients')
                      : t('doctor.noPatientMatch')}
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

export default function PatientsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PatientsPageComponent />
    </Suspense>
  );
}
