'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, FileText, Pill, Calendar, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import { useLabReports } from '@/hooks/useLabReports';
import { useLanguage } from '@/hooks/useLanguage';
import { useTranslations } from 'next-intl';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function HealthRecordsPage() {
  const { profile, loading: authLoading } = useAuth();
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { prescriptions, loading: prescriptionsLoading } = usePrescriptions();
  const { labReports, loading: reportsLoading } = useLabReports();
  const { formatDate, formatCurrency } = useLanguage();
  const t = useTranslations('patient');
  const tCommon = useTranslations('common');

  // Filter completed or cancelled appointments (consultations)
  const consultations = appointments.filter(
    appt => appt.status === 'Completed' || appt.status === 'Cancelled'
  );

  const handleDownloadPDF = (prescription: any) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 116, 166); // Primary Color
    doc.text("Grameen Swasthya Setu", 105, 20, { align: "center" });

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Official Prescription", 105, 30, { align: "center" });

    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    // Doctor & Patient Info
    doc.setFontSize(12);
    doc.text(`Doctor: Dr. ${prescription.doctor_name || 'N/A'}`, 20, 50);
    doc.text(`Date: ${format(new Date(prescription.issued_date), 'PPP')}`, 140, 50);

    doc.text(`Patient: ${profile?.full_name || 'N/A'}`, 20, 60);
    doc.text(`Patient ID: ${profile?.user_id || 'N/A'}`, 140, 60); // Assuming user_id exists or utilize ID

    // Prescription Details Table
    autoTable(doc, {
      startY: 75,
      head: [['Medication', 'Dosage', 'Instructions']],
      body: [
        [prescription.medication, prescription.dosage, prescription.instructions || '-']
      ],
      theme: 'grid',
      headStyles: { fillColor: [40, 116, 166] },
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 30;
    doc.setFontSize(10);
    doc.text("This is a computer-generated prescription.", 105, finalY, { align: "center" });
    doc.text("Helpline: 1800-123-4567 | Visit: www.gs-setu.org", 105, finalY + 7, { align: "center" });

    doc.save(`Prescription_${prescription.medication}_${format(new Date(prescription.issued_date), 'yyyy-MM-dd')}.pdf`);
  };

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
        <h1 className="font-headline text-3xl font-bold">{t('healthRecords')}</h1>
        <p className="text-muted-foreground">
          {t('healthRecordsDesc')}
        </p>
      </div>

      <Tabs defaultValue="consultations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="consultations">
            <Calendar className="mr-2 h-4 w-4" />
            {t('consultations')}
          </TabsTrigger>
          <TabsTrigger value="prescriptions">
            <Pill className="mr-2 h-4 w-4" />
            {t('prescriptions')}
          </TabsTrigger>
          <TabsTrigger value="lab-reports">
            <FileText className="mr-2 h-4 w-4" />
            {t('labReports')}
          </TabsTrigger>
        </TabsList>

        {/* Consultations Tab */}
        <TabsContent value="consultations">
          <Card>
            <CardHeader>
              <CardTitle>{t('pastConsultations')}</CardTitle>
              <CardDescription>{t('pastConsultationsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">{t('loadingConsultations')}</p>
                </div>
              ) : consultations.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">{t('noPastConsultations')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{tCommon('date')}</TableHead>
                      <TableHead>{tCommon('doctor')}</TableHead>
                      <TableHead>{t('type')}</TableHead>
                      <TableHead>{tCommon('status')}</TableHead>
                      <TableHead>{t('notes')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consultations.map((consultation) => (
                      <TableRow key={consultation.id}>
                        <TableCell>{consultation.appointment_date ? formatDate(new Date(consultation.appointment_date), 'long') : t('dateNotSet')}</TableCell>
                        <TableCell>Dr. {consultation.doctor_name}</TableCell>
                        <TableCell>{consultation.consultation_type}</TableCell>
                        <TableCell>
                          <Badge variant={consultation.status === 'Completed' ? 'default' : 'secondary'}>
                            {consultation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{consultation.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle>{t('yourPrescriptions')}</CardTitle>
              <CardDescription>{t('yourPrescriptionsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {prescriptionsLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">{t('loadingPrescriptions')}</p>
                </div>
              ) : prescriptions.length === 0 ? (
                <div className="text-center py-12">
                  <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">{t('noPrescriptionsFound')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{tCommon('date')}</TableHead>
                      <TableHead>{t('medication')}</TableHead>
                      <TableHead>{t('dosage')}</TableHead>
                      <TableHead>{tCommon('doctor')}</TableHead>
                      <TableHead>{t('instructions')}</TableHead>
                      <TableHead className="text-right">{tCommon('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescriptions.map((prescription) => (
                      <TableRow key={prescription.id}>
                        <TableCell>{formatDate(new Date(prescription.issued_date), 'long')}</TableCell>
                        <TableCell className="font-medium">{prescription.medication}</TableCell>
                        <TableCell>{prescription.dosage}</TableCell>
                        <TableCell>Dr. {prescription.doctor_name}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {prescription.instructions || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(prescription)}>
                            <Download className="mr-2 h-4 w-4" /> {tCommon('download')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lab Reports Tab */}
        <TabsContent value="lab-reports">
          <Card>
            <CardHeader>
              <CardTitle>{t('labReports')}</CardTitle>
              <CardDescription>{t('labReportsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">{t('loadingReports')}</p>
                </div>
              ) : labReports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">{t('noLabReportsFound')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{tCommon('date')}</TableHead>
                      <TableHead>{t('reportName')}</TableHead>
                      <TableHead>{tCommon('doctor')}</TableHead>
                      <TableHead>{tCommon('status')}</TableHead>
                      <TableHead className="text-right">{tCommon('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {labReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{formatDate(new Date(report.report_date), 'long')}</TableCell>
                        <TableCell className="font-medium">{report.report_name}</TableCell>
                        <TableCell>
                          {report.doctor_name ? `Dr. ${report.doctor_name}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={report.status === 'Available' ? 'default' : 'secondary'}>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {report.status === 'Available' && report.file_url ? (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={report.file_url} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                {tCommon('download')}
                              </a>
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">{t('pending')}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
