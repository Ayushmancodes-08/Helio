'use client';

import { useState } from 'react';
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


export default function DataEntryOperatorDashboardPage() {
  const { profile } = useAuth();
  const { metrics, loading: metricsLoading } = useHealthMetrics();

  const totalPopulation = metrics.reduce((sum, r) => sum + (r.population || 0), 0);
  const totalDistricts = metrics.length;
  const totalAmbulances = metrics.reduce((sum, r) => sum + (r.total_ambulances || 0), 0);
  const districtsWithMissingData = metrics.filter(r => !r.population || !r.total_beds).length;

  const getOccupancyStatus = (occupancy: number) => {
    if (occupancy >= 95) return { text: 'Critical', variant: 'destructive' as const };
    if (occupancy >= 80) return { text: 'Strained', variant: 'default' as const };
    return { text: 'Stable', variant: 'secondary' as const };
  };

  if (metricsLoading) {
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
          Data Entry Operator Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome, {profile?.full_name || 'Operator'}. Manage and update regional health metrics directly in the central database.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Population Covered
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalPopulation / 1_000_000).toFixed(2)}M</div>
            <p className="text-xs text-muted-foreground">
              Across all monitored districts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monitored Districts
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDistricts}</div>
            <p className="text-xs text-muted-foreground">
              Total districts with updated data
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Ambulances
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAmbulances}</div>
            <p className="text-xs text-muted-foreground">
              Available for dispatch
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Data Quality
            </CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{districtsWithMissingData > 0 ? <span className="text-destructive">{districtsWithMissingData}</span> : 'Good'}</div>
            <p className="text-xs text-muted-foreground">
              {districtsWithMissingData > 0 ? 'Districts with incomplete info' : 'All districts have basic data'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Regional Data Overview</CardTitle>
          <CardDescription>
            A summary of the latest data for each district. <Link href="/dashboard/data-entry-operator/regional-data" className="text-primary underline">Update this data</Link>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>District</TableHead>
                <TableHead>Population</TableHead>
                <TableHead>Bed Occupancy</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.length > 0 ? metrics.map(res => {
                const occupancy = res.total_beds > 0 ? (res.occupied_beds / res.total_beds) * 100 : 0;
                const status = getOccupancyStatus(occupancy);
                return (
                  <TableRow key={res.district_name}>
                    <TableCell className="font-medium">{res.district_name}</TableCell>
                    <TableCell>{res.population > 0 ? res.population.toLocaleString() : <span className="text-muted-foreground">No data</span>}</TableCell>
                    <TableCell>{res.total_beds > 0 ? `${res.occupied_beds}/${res.total_beds}` : <span className="text-muted-foreground">No data</span>}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.text}</Badge>
                    </TableCell>
                  </TableRow>
                )
              }) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    <p className="font-semibold">No data entered yet.</p>
                    <p className="text-muted-foreground text-sm">Please go to the <Link href="/dashboard/data-entry-operator/regional-data" className="text-primary underline">Regional Data</Link> page to begin.</p>
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
