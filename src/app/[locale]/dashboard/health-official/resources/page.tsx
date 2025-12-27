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
  const { formatCurrency } = useLanguage();

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
        <h1 className="font-headline text-3xl font-bold">Resource Management</h1>
        <p className="text-muted-foreground">
          Monitor and manage healthcare resources across all districts.
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
                  Total Hospital Beds
                </CardTitle>
                <BedDouble className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalBeds.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {totalOccupiedBeds.toLocaleString()} occupied • Across {resourceData.length} districts
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Available Ambulances
                </CardTitle>
                <Ambulance className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAmbulances}</div>
                <p className="text-xs text-muted-foreground">
                  Ready for dispatch
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Medical Staff</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStaff.toLocaleString()}</div>
                <p className="text-muted-foreground text-xs text-muted-foreground">
                  Doctors and nurses on duty
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>District Resource Overview</CardTitle>
              <CardDescription>
                A detailed breakdown of resources in each district.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>District</TableHead>
                    <TableHead className="w-[300px]">Bed Occupancy</TableHead>
                    <TableHead>Ambulances</TableHead>
                    <TableHead>Doctors</TableHead>
                    <TableHead>Nurses</TableHead>
                    <TableHead className="text-right">Status</TableHead>
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

          <Card>
            <CardHeader>
              <CardTitle>Resource Allocation Costs</CardTitle>
              <CardDescription>
                Estimated costs for resource allocation and maintenance by district.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>District</TableHead>
                    <TableHead>Bed Maintenance Cost</TableHead>
                    <TableHead>Ambulance Operations Cost</TableHead>
                    <TableHead>Staff Allocation Cost</TableHead>
                    <TableHead className="text-right">Total Monthly Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resourceData.map((res) => {
                    // Calculate costs based on resources
                    const bedMaintenanceCost = res.beds.total * 5000; // ₹5000 per bed per month
                    const ambulanceOperationsCost = res.ambulances * 15000; // ₹15000 per ambulance per month
                    const staffAllocationCost = res.staff.doctors * 50000 + res.staff.nurses * 25000; // Staff salaries
                    const totalCost = bedMaintenanceCost + ambulanceOperationsCost + staffAllocationCost;
                    
                    return (
                      <TableRow key={`cost-${res.district}`}>
                        <TableCell className="font-medium">{res.district}</TableCell>
                        <TableCell>{formatCurrency(bedMaintenanceCost)}</TableCell>
                        <TableCell>{formatCurrency(ambulanceOperationsCost)}</TableCell>
                        <TableCell>{formatCurrency(staffAllocationCost)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(totalCost)}</TableCell>
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
