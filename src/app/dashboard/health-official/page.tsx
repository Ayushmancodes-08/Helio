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
import {
  Users,
  Siren,
  Building,
  Loader2
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis } from 'recharts';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useHealthMetrics } from '@/hooks/useHealthMetrics';
import { useHealthAlerts } from '@/hooks/useHealthAlerts';

const chartConfig = {
  cases: {
    label: 'Cases',
    color: 'hsl(var(--destructive))',
  },
};

export default function HealthOfficialDashboardPage() {
  const { profile } = useAuth();
  const { metrics, diseaseReports, loading: metricsLoading } = useHealthMetrics();
  const { alerts, loading: alertsLoading } = useHealthAlerts();

  const formattedDiseaseData = metrics.map(region => {
    // Sum cases for this region from diseaseReports
    // Assuming diseaseReports has a 'district_name' field
    const regionCases = diseaseReports
      .filter(d => d.district_name === region.district_name)
      .reduce((total, report) => total + report.case_count, 0);

    return {
      region: region.district_name,
      cases: regionCases
    };
  });

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'High': return 'destructive' as const;
      case 'Medium': return 'default' as const;
      case 'Low': return 'secondary' as const;
      default: return 'outline' as const;
    }
  }

  const activeAlertsCount = alerts.filter(a => a.status === 'Active').length;
  const totalPopulation = metrics.reduce((sum, r) => sum + (r.population || 0), 0);
  const hospitalsAtCapacity = metrics.filter(r => r.total_beds > 0 && (r.occupied_beds / r.total_beds) >= 0.95).length;

  if (metricsLoading || alertsLoading) {
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
          Public Health Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome, {profile?.full_name || 'Official'}. Monitor regional health trends and resource
          allocation via real-time data.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Population Coverage
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalPopulation / 1_000_000).toFixed(2)}M</div>
            <p className="flex items-center text-xs text-muted-foreground">
              Across all monitored districts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Health Alerts
            </CardTitle>
            <Siren className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAlertsCount}</div>
            <p className="text-xs text-muted-foreground">
              Total active alerts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hospitals At Capacity
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hospitalsAtCapacity}/{metrics.length}</div>
            <p className="text-xs text-muted-foreground">
              Districts with high occupancy
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Disease Incidence by Region</CardTitle>
            <CardDescription>Total reported communicable disease cases.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart accessibilityLayer data={formattedDiseaseData}>
                <XAxis
                  dataKey="region"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                  allowDecimals={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="cases" fill="var(--color-cases)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resource Allocation</CardTitle>
            <CardDescription>Current status of key resources across districts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>District</TableHead>
                  <TableHead>Bed Occupancy</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.length > 0 ? metrics.map(res => {
                  const occupancy = res.total_beds > 0 ? (res.occupied_beds / res.total_beds) * 100 : 0;
                  const status = occupancy >= 95 ? 'Critical' : 'Stable';
                  return (
                    <TableRow key={res.district_name}>
                      <TableCell className="font-medium">{res.district_name}</TableCell>
                      <TableCell>{res.occupied_beds}/{res.total_beds}</TableCell>
                      <TableCell>
                        <Badge variant={status === 'Critical' ? 'destructive' : 'secondary'}>{status}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">No data available.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Public Health Alerts</CardTitle>
          <CardDescription>
            Active alerts and advisories issued.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alert Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date Issued</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.length > 0 ? alerts.filter(a => a.status === 'Active').slice(0, 5).map(alert => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">{alert.title}</TableCell>
                  <TableCell>
                    <Badge variant={getPriorityVariant(alert.priority)}>{alert.priority}</Badge>
                  </TableCell>
                  <TableCell>{new Date(alert.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{alert.status}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No active alerts.
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
