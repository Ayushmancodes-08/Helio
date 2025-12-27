'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BedDouble, Ambulance, Users, Loader2 } from 'lucide-react';
import { useDistricts, useHospitals } from '@/hooks/useHealthData';
import { useLanguage } from '@/hooks/useLanguage';
import { useMemo } from 'react';

const getOccupancyStatus = (occupancy: number) => {
  if (occupancy >= 95) return { text: 'Critical', variant: 'destructive' as const };
  if (occupancy >= 80) return { text: 'Strained', variant: 'default' as const };
  return { text: 'Stable', variant: 'secondary' as const };
};

export default function ResourcesPage() {
  const { districts, loading: districtsLoading } = useDistricts();
  const { hospitals, loading: hospitalsLoading } = useHospitals();
  const { formatCurrency, t } = useLanguage();

  const loading = districtsLoading || hospitalsLoading;

  // Calculate district-wise resource aggregation
  const resourceData = useMemo(() => {
    return districts.map(district => {
      const districtHospitals = hospitals.filter(h => h.district_id === district.id);

      const totals = districtHospitals.reduce(
        (acc, hospital) => {
          acc.population += hospital.population || 0;
          acc.beds.occupied += hospital.occupied_beds || 0;
          acc.beds.total += hospital.total_beds || 0;
          acc.ambulances += hospital.ambulances || 0;
          acc.staff.doctors += hospital.doctors || 0;
          acc.staff.nurses += hospital.nurses || 0;
          return acc;
        },
        { population: 0, beds: { occupied: 0, total: 0 }, ambulances: 0, staff: { doctors: 0, nurses: 0 } }
      );

      return {
        district: district.name,
        ...totals
      };
    });
  }, [districts, hospitals]);

  const totalBeds = resourceData.reduce((sum, r) => sum + r.beds.total, 0);
  const totalOccupiedBeds = resourceData.reduce((sum, r) => sum + r.beds.occupied, 0);
  const totalAmbulances = resourceData.reduce((sum, r) => sum + r.ambulances, 0);
  const totalStaff = resourceData.reduce((sum, r) => sum + r.staff.doctors + r.staff.nurses, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">{t('healthOfficial.resourceManagement')}</h1>
        <p className="text-muted-foreground">
          {t('healthOfficial.monitorManageHealthcare')}
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading resource data...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('healthOfficial.totalHospitalBeds')}
                </CardTitle>
                <BedDouble className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalBeds.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {totalOccupiedBeds.toLocaleString()} {t('healthOfficial.occupied')} • {t('healthOfficial.acrossDistricts', { count: resourceData.length })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('healthOfficial.availableAmbulances')}
                </CardTitle>
                <Ambulance className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAmbulances}</div>
                <p className="text-xs text-muted-foreground">
                  {t('healthOfficial.readyForDispatch')}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('healthOfficial.totalMedicalStaff')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStaff.toLocaleString()}</div>
                <p className="text-muted-foreground text-xs text-muted-foreground">
                  {t('healthOfficial.doctorsNursesOnDuty')}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('healthOfficial.districtResourceOverview')}</CardTitle>
              <CardDescription>
                {t('healthOfficial.detailedBreakdownOfResources')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('healthOfficial.district')}</TableHead>
                    <TableHead className="w-[300px]">{t('healthOfficial.bedOccupancy')}</TableHead>
                    <TableHead>{t('healthOfficial.ambulances')}</TableHead>
                    <TableHead>{t('healthOfficial.doctors')}</TableHead>
                    <TableHead>{t('healthOfficial.nurses')}</TableHead>
                    <TableHead className="text-right">{t('healthOfficial.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resourceData.map((res) => {
                    const occupancy = res.beds.total > 0 ? (res.beds.occupied / res.beds.total) * 100 : 0;
                    const status = getOccupancyStatus(occupancy);
                    return (
                      <TableRow key={res.district}>
                        <TableCell className="font-medium">{res.district}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <Progress value={occupancy} className="w-full" />
                            <span className="text-xs text-muted-foreground font-mono">
                              {res.beds.occupied}/{res.beds.total}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{res.ambulances}</TableCell>
                        <TableCell>{res.staff.doctors}</TableCell>
                        <TableCell>{res.staff.nurses}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={status.variant}>{status.text}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
