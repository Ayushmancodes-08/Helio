'use client';

import { useMemo, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
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
import { Badge } from '@/components/ui/badge';
import { Users, Building, Truck, Server, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useDistricts, useHospitals } from '@/hooks/useHealthData';
import { DEODashboardSkeleton } from '@/components/dashboard/deo-dashboard-skeleton';

export default function DataEntryOperatorDashboardPage() {
  const { t, locale } = useLanguage();
  
  // Fetch from local state instead of API
  const { districts, loading: districtsLoading } = useDistricts();
  const { hospitals, loading: hospitalsLoading } = useHospitals();

  const loading = districtsLoading || hospitalsLoading;

  // Memoize calculations from local hospitals data
  const stats = useMemo(() => {
    // Group hospitals by district
    const districtMetrics = new Map<string, any>();
    
    hospitals.forEach((hospital: any) => {
      const districtId = hospital.district_id;
      const district = districts.find(d => d.id === districtId);
      const districtName = district?.name || 'Unknown';
      
      if (!districtMetrics.has(districtId)) {
        districtMetrics.set(districtId, {
          id: districtId,
          district_name: districtName,
          total_beds: 0,
          occupied_beds: 0,
          total_ambulances: 0,
          population: 0,
          doctors: 0,
          nurses: 0,
          hospital_count: 0
        });
      }
      
      const metric = districtMetrics.get(districtId);
      metric.total_beds += hospital.total_beds || 0;
      metric.occupied_beds += hospital.occupied_beds || 0;
      metric.total_ambulances += hospital.ambulances || 0;
      metric.population += hospital.population || 0;
      metric.doctors += hospital.doctors || 0;
      metric.nurses += hospital.nurses || 0;
      metric.hospital_count += 1;
    });

    const metrics = Array.from(districtMetrics.values());

    return {
      metrics,
      totalPopulation: metrics.reduce((sum, r) => sum + (r.population || 0), 0),
      totalDistricts: metrics.length,
      totalAmbulances: metrics.reduce((sum, r) => sum + (r.total_ambulances || 0), 0),
      totalDoctors: metrics.reduce((sum, r) => sum + (r.doctors || 0), 0),
      totalNurses: metrics.reduce((sum, r) => sum + (r.nurses || 0), 0),
      districtsWithMissingData: metrics.filter(r => !r.population || !r.total_beds).length,
    };
  }, [hospitals, districts]);

  const getOccupancyStatus = (occupancy: number) => {
    if (occupancy >= 95) return { text: t('dataEntryOperator.critical'), variant: 'destructive' as const };
    if (occupancy >= 80) return { text: t('dataEntryOperator.strained'), variant: 'default' as const };
    return { text: t('dataEntryOperator.stable'), variant: 'secondary' as const };
  };

  if (loading) {
    return <DEODashboardSkeleton />;
  }

  // Show setup guide if no districts exist
  const hasNoData = stats.totalDistricts === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          {t('dataEntryOperator.deoTitle')}
        </h1>
        <p className="text-muted-foreground">
          {t('dataEntryOperator.welcome', { name: 'Operator' })}. {t('dataEntryOperator.dataManagement')}
        </p>
      </div>

      {/* Setup Guide Alert */}
      {hasNoData && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <CardTitle className="text-blue-900">Getting Started</CardTitle>
                <CardDescription className="text-blue-800 mt-1">
                  No districts or hospitals have been set up yet. Follow these steps to get started:
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold flex-shrink-0">1</div>
                <div>
                  <p className="font-medium text-sm">Create Districts & Hospitals</p>
                  <p className="text-sm text-muted-foreground">Set up your district infrastructure and add hospitals</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold flex-shrink-0">2</div>
                <div>
                  <p className="font-medium text-sm">Enter Hospital Data</p>
                  <p className="text-sm text-muted-foreground">Update population, beds, ambulances, doctors, and nurses for each hospital</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold flex-shrink-0">3</div>
                <div>
                  <p className="font-medium text-sm">View Dashboard</p>
                  <p className="text-sm text-muted-foreground">See aggregated metrics and district-level summaries</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Link href={`/${locale}/dashboard/data-entry-operator/districts-hospitals`}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Building className="mr-2 h-4 w-4" />
                  Set Up Districts & Hospitals
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dataEntryOperator.totalPopulationCovered')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.totalPopulation / 1_000_000).toFixed(2)}M</div>
            <p className="text-xs text-muted-foreground">
              {t('dataEntryOperator.acrossAllMonitoredDistricts')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dataEntryOperator.monitoredDistricts')}
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDistricts}</div>
            <p className="text-xs text-muted-foreground">
              {t('dataEntryOperator.totalDistrictsWithUpdatedData')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dataEntryOperator.totalAmbulances')}
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAmbulances}</div>
            <p className="text-xs text-muted-foreground">
              {t('dataEntryOperator.availableForDispatch')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dataEntryOperator.dataQuality')}
            </CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.districtsWithMissingData > 0 ? <span className="text-destructive">{stats.districtsWithMissingData}</span> : t('common.ok')}</div>
            <p className="text-xs text-muted-foreground">
              {stats.districtsWithMissingData > 0 ? t('dataEntryOperator.districtsWithIncompleteInfo') : t('dataEntryOperator.allDistrictsHaveBasicData')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('dataEntryOperator.regionalDataOverview')}</CardTitle>
          <CardDescription>
            {t('dataEntryOperator.summaryOfLatestData')} {!hasNoData && <Link href={`/${locale}/dashboard/data-entry-operator/hospital-infrastructure`} className="text-primary underline">{t('dataEntryOperator.updateThisData')}</Link>}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('dataEntryOperator.district')}</TableHead>
                <TableHead>{t('dataEntryOperator.population')}</TableHead>
                <TableHead>{t('dataEntryOperator.bedOccupancy')}</TableHead>
                <TableHead>{t('dataEntryOperator.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.metrics.length > 0 ? stats.metrics.map(res => {
                const occupancy = res.total_beds > 0 ? (res.occupied_beds / res.total_beds) * 100 : 0;
                const status = getOccupancyStatus(occupancy);
                return (
                  <TableRow key={res.district_name}>
                    <TableCell className="font-medium">{res.district_name}</TableCell>
                    <TableCell>{(res.population || 0) > 0 ? (res.population || 0).toLocaleString() : <span className="text-muted-foreground">{t('dataEntryOperator.noData')}</span>}</TableCell>
                    <TableCell>{res.total_beds > 0 ? `${res.occupied_beds}/${res.total_beds}` : <span className="text-muted-foreground">{t('dataEntryOperator.noData')}</span>}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.text}</Badge>
                    </TableCell>
                  </TableRow>
                )
              }) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    <p className="font-semibold">{t('dataEntryOperator.noDataEntered')}</p>
                    <p className="text-muted-foreground text-sm">
                      {hasNoData 
                        ? 'Set up districts and hospitals first, then enter data.'
                        : `${t('dataEntryOperator.pleaseGoToRegionalData')} `
                      }
                      {!hasNoData && <Link href={`/${locale}/dashboard/data-entry-operator/hospital-infrastructure`} className="text-primary underline">{t('dataEntryOperator.regionalData')}</Link>}
                    </p>
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
