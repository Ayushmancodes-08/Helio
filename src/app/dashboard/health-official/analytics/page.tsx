'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TrendingUp, BedDouble, Users, Download, ChevronDown, Loader2 } from 'lucide-react';
import { format, subDays, parseISO, eachDayOfInterval } from 'date-fns';
import { Input } from '@/components/ui/input';

import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useHealthMetrics } from '@/hooks/useHealthMetrics';
import { useHospitals, useDistricts } from '@/hooks/useHealthData';
import { createClient } from '@/lib/supabase/client';

const PIE_CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const LINE_CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const occupancyChartConfig = {
  occupancy: { label: 'Occupancy', color: 'hsl(var(--destructive))' },
};

const ageChartConfig = {
  "0-18": { label: '0-18', color: PIE_CHART_COLORS[0] },
  "19-45": { label: '19-45', color: PIE_CHART_COLORS[1] },
  "46-65": { label: '46-65', color: PIE_CHART_COLORS[2] },
  "65+": { label: '65+', color: PIE_CHART_COLORS[3] },
};

export default function HealthAnalyticsPage() {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedHospital, setSelectedHospital] = useState('all');
  const [patientDemographics, setPatientDemographics] = useState<{ name: string, value: number }[]>([]);
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 29),
    to: new Date()
  });

  // Supabase Hooks
  const { diseaseReports, loading: reportsLoading } = useHealthMetrics();
  const { hospitals, loading: hospitalsLoading } = useHospitals();
  const { districts, loading: districtsLoading } = useDistricts();

  const supabase = createClient();

  // Fetch Patient Demographics separately as it's not in a standard context hook yet
  const fetchDemographics = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('age')
        .eq('role', 'patient');

      if (error) throw error;

      const ageGroups: { [key: string]: number } = {
        '0-18': 0,
        '19-45': 0,
        '46-65': 0,
        '65+': 0,
      };

      (data || []).forEach((p: any) => {
        const age = p.age || 0;
        if (age <= 0) return;
        if (age <= 18) ageGroups['0-18']++;
        else if (age <= 45) ageGroups['19-45']++;
        else if (age <= 65) ageGroups['46-65']++;
        else ageGroups['65+']++;
      });

      setPatientDemographics(Object.entries(ageGroups).map(([name, value]) => ({ name, value })));

    } catch (e) {
      console.error("Failed to fetch patient demographics", e);
    }
  }, [supabase]);

  useEffect(() => {
    fetchDemographics();
  }, [fetchDemographics]);

  // Derived State
  const availableDiseases = useMemo(() => {
    const all = new Set(diseaseReports.map(r => r.disease_name));
    return Array.from(all).filter(Boolean);
  }, [diseaseReports]);

  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);

  // Update selected diseases when available diseases change (initial load)
  useEffect(() => {
    if (selectedDiseases.length === 0 && availableDiseases.length > 0) {
      setSelectedDiseases(availableDiseases);
    }
  }, [availableDiseases, selectedDiseases.length]);


  const regions = useMemo(() => {
    return ['all', ...districts.map(d => d.name)];
  }, [districts]);

  const availableHospitalOptions = useMemo(() => {
    let filtered = hospitals;
    if (selectedRegion !== 'all') {
      // Find district ID from name (since hook gives districts with ID and Name)
      const district = districts.find(d => d.name === selectedRegion);
      if (district) {
        filtered = hospitals.filter(h => h.district_id === district.id);
      } else {
        filtered = [];
      }
    }
    return [{ label: 'All Hospitals', value: 'all' }, ...filtered.map(h => ({ label: h.name, value: h.name }))]; // Using name as value to match legacy component logic slightly better for display, or stick to ID? 
    // Legacy logic used hospitalName string. Let's stick to name for chart labels, but using ID is safer. 
    // The selector uses 'all' or specific. Let's use Name for the 'value' to filtering easy against disease reports which might have hospital_name joined.
    // Actually diseaseReports form useHealthMetrics has hospital_name.
  }, [hospitals, selectedRegion, districts]);

  useEffect(() => {
    setSelectedHospital('all');
  }, [selectedRegion]);


  // Chart Data Processing
  const dailyCaseData = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return [];

    // Filter Reports
    let filteredReports = diseaseReports;
    if (selectedRegion !== 'all') {
      filteredReports = filteredReports.filter(r => r.district_name === selectedRegion);
    }
    if (selectedHospital !== 'all') {
      filteredReports = filteredReports.filter(r => r.hospital_name === selectedHospital);
    }

    const intervalDays = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });

    return intervalDays.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dailyData: { [key: string]: any } = { date: format(date, 'MMM d') };

      selectedDiseases.forEach(diseaseName => {
        const key = diseaseName.replace(/\s+/g, '-').toLowerCase();
        // Sum cases for this disease on this day
        const total = filteredReports
          .filter(r => r.disease_name === diseaseName && r.report_date === dateStr)
          .reduce((sum, r) => sum + (r.case_count || 0), 0);

        dailyData[key] = total;
      });
      return dailyData;
    });
  }, [diseaseReports, selectedRegion, selectedHospital, selectedDiseases, dateRange]);

  const hospitalOccupancyData = useMemo(() => {
    // If specific region selected, show hospitals in that region
    // If 'all', show aggregation by district? Original logic:
    // "When 'all' regions selected, group by district"

    if (selectedRegion !== 'all') {
      const district = districts.find(d => d.name === selectedRegion);
      if (!district) return [];
      return hospitals
        .filter(h => h.district_id === district.id)
        .map(h => ({
          name: h.name,
          occupied: h.occupied_beds || 0,
          total: h.total_beds || 0,
          occupancy: h.total_beds > 0 ? ((h.occupied_beds || 0) / h.total_beds) * 100 : 0
        }));
    } else {
      // Aggregate by District
      return districts.map(d => {
        const districtHospitals = hospitals.filter(h => h.district_id === d.id);
        const occupied = districtHospitals.reduce((sum, h) => sum + (h.occupied_beds || 0), 0);
        const total = districtHospitals.reduce((sum, h) => sum + (h.total_beds || 0), 0);
        return {
          name: d.name,
          occupied,
          total,
          occupancy: total > 0 ? (occupied / total) * 100 : 0
        };
      });
    }
  }, [selectedRegion, hospitals, districts]);

  const diseaseChartConfig = useMemo(() => {
    return availableDiseases.reduce((config, diseaseName, index) => {
      const key = diseaseName.replace(/\s+/g, '-').toLowerCase();
      config[key] = {
        label: diseaseName,
        color: LINE_CHART_COLORS[index % LINE_CHART_COLORS.length],
      };
      return config;
    }, {} as Record<string, { label: string, color: string }>)
  }, [availableDiseases]);

  const handleDownload = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Health Analytics Report\n`;
    csvContent += `Region: ${selectedRegion}\n`;
    csvContent += `Period: ${format(dateRange.from, 'yyyy-MM-dd')} to ${format(dateRange.to, 'yyyy-MM-dd')}\n\n`;

    csvContent += "Daily Disease Trends\n";
    csvContent += "Date," + selectedDiseases.join(',') + '\n';
    dailyCaseData.forEach(row => {
      const rowData = [row.date, ...selectedDiseases.map(d => row[d.replace(/\s+/g, '-').toLowerCase()] || 0)];
      csvContent += rowData.join(',') + '\n';
    });
    csvContent += "\n";

    csvContent += "Occupancy Data\n";
    csvContent += "Name,Occupied,Total,Occupancy (%)\n";
    hospitalOccupancyData.forEach(row => {
      csvContent += `${row.name},${row.occupied},${row.total},${row.occupancy.toFixed(1)}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `health_report_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'from' | 'to') => {
    const newDate = e.target.value ? parseISO(e.target.value) : (field === 'from' ? subDays(new Date(), 29) : new Date());
    setDateRange(prev => ({ ...prev, [field]: newDate }));
  };

  const handleDiseaseSelectionChange = (diseaseName: string) => {
    setSelectedDiseases(prev => {
      if (prev.includes(diseaseName)) {
        return prev.filter(d => d !== diseaseName);
      } else {
        return [...prev, diseaseName];
      }
    });
  };

  if (reportsLoading || hospitalsLoading || districtsLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold">Health Analytics</h1>
          <p className="text-muted-foreground">
            In-depth analysis of public health data and trends.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map(r => <SelectItem key={r} value={r} className="capitalize">{r === 'all' ? 'All Regions' : r}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={selectedHospital} onValueChange={setSelectedHospital}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select Hospital" />
            </SelectTrigger>
            <SelectContent>
              {availableHospitalOptions.map(h => <SelectItem key={h.value} value={h.value} className="capitalize">{h.label}</SelectItem>)}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-40">
                Diseases <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Show Diseases</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableDiseases.map(disease => (
                <DropdownMenuCheckboxItem
                  key={disease}
                  checked={selectedDiseases.includes(disease)}
                  onCheckedChange={() => handleDiseaseSelectionChange(disease)}
                >
                  {disease}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex w-full items-center gap-2 sm:w-auto flex-1 min-w-[280px]">
            <Input type="date" value={format(dateRange.from, 'yyyy-MM-dd')} onChange={(e) => handleDateChange(e, 'from')} className="w-full sm:w-auto" />
            <span className="text-muted-foreground">to</span>
            <Input type="date" value={format(dateRange.to, 'yyyy-MM-dd')} onChange={(e) => handleDateChange(e, 'to')} className="w-full sm:w-auto" />
          </div>
          <Button onClick={handleDownload} variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Report
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Daily Disease Trends
          </CardTitle>
          <CardDescription>
            Reported cases for {selectedHospital === 'all' ? 'all selected hospitals' : selectedHospital} in {selectedRegion === 'all' ? 'all regions' : selectedRegion}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={diseaseChartConfig} className="h-72 w-full">
            <LineChart
              accessibilityLayer
              data={dailyCaseData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
              <Legend />
              {selectedDiseases.map((disease) => {
                const key = disease.replace(/\s+/g, '-').toLowerCase();
                return <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={`var(--color-${key})`}
                  strokeWidth={2}
                  dot={false}
                  name={disease}
                />
              })}
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BedDouble className="h-5 w-5" />
              Hospital Bed Occupancy
            </CardTitle>
            <CardDescription>
              Percentage of occupied beds in {selectedRegion === 'all' ? 'all regions (grouped by district)' : selectedRegion}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={occupancyChartConfig} className="h-72 w-full">
              <BarChart
                accessibilityLayer
                data={hospitalOccupancyData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="capitalize"
                  width={100}
                  interval={0}
                />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent formatter={(value) => `${(value as number).toFixed(1)}%`} />}
                />
                <Bar dataKey="occupancy" fill="var(--color-occupancy)" radius={4} key="occupancy" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Patient Demographics by Age
            </CardTitle>
            <CardDescription>
              Distribution of registered patients across different age groups.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={ageChartConfig} className="mx-auto aspect-square h-full max-h-[288px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={patientDemographics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      if (percent === 0) return null;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                      const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                      return (
                        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {patientDemographics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
