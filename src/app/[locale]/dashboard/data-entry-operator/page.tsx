'use client';

import { useState } from 'react';
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
import { Users, Building, Truck, Server, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useHealthMetrics } from '@/hooks/useHealthMetrics';


import { useDataEntryDashboard } from '@/hooks/useDataEntryOperatorDashboard';


export default function DataEntryOperatorDashboardPage() {
  const { t, locale } = useLanguage();
  const { profile, metrics, loading: dashboardLoading } = useDataEntryDashboard();

  const totalPopulation = metrics.reduce((sum, r) => sum + (r.population || 0), 0);
  const totalDistricts = metrics.length;
  const totalAmbulances = metrics.reduce((sum, r) => sum + (r.total_ambulances || 0), 0);
  const districtsWithMissingData = metrics.filter(r => !r.population || !r.total_beds).length;

  const getOccupancyStatus = (occupancy: number) => {
    if (occupancy >= 95) return { text: t('dataEntryOperator.critical'), variant: 'destructive' as const };
    if (occupancy >= 80) return { text: t('dataEntryOperator.strained'), variant: 'default' as const };
    return { text: t('dataEntryOperator.stable'), variant: 'secondary' as const };
  };

  if (dashboardLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          {t('dataEntryOperator.deoTitle')}
        </h1>
        <p className="text-muted-foreground">
          {t('dataEntryOperator.welcome', { name: profile?.full_name || 'Operator' })}. {t('dataEntryOperator.dataManagement')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dataEntryOperator.totalPopulationCovered')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalPopulation / 1_000_000).toFixed(2)}M</div>
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
            <div className="text-2xl font-bold">{totalDistricts}</div>
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
            <div className="text-2xl font-bold">{totalAmbulances}</div>
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
            <div className="text-2xl font-bold">{districtsWithMissingData > 0 ? <span className="text-destructive">{districtsWithMissingData}</span> : t('common.ok')}</div>
            <p className="text-xs text-muted-foreground">
              {districtsWithMissingData > 0 ? t('dataEntryOperator.districtsWithIncompleteInfo') : t('dataEntryOperator.allDistrictsHaveBasicData')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('dataEntryOperator.regionalDataOverview')}</CardTitle>
          <CardDescription>
            {t('dataEntryOperator.summaryOfLatestData')} <Link href={`/${locale}/dashboard/data-entry-operator/regional-data`} className="text-primary underline">{t('dataEntryOperator.updateThisData')}</Link>.
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
              {metrics.length > 0 ? metrics.map(res => {
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
                    <p className="text-muted-foreground text-sm">{t('dataEntryOperator.pleaseGoToRegionalData')} <Link href={`/${locale}/dashboard/data-entry-operator/regional-data`} className="text-primary underline">{t('dataEntryOperator.regionalData')}</Link> {t('common.ok')}.</p>
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
