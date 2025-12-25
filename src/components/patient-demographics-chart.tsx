
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { AgeGroupData } from '@/app/dashboard/doctor/page';


const chartConfig = {
  patients: {
    label: 'Patients',
    color: 'hsl(var(--primary))',
  },
};

export function PatientDemographicsChart({ chartData }: { chartData: AgeGroupData[] }) {
  if (!chartData || chartData.every(d => d.patients === 0)) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center rounded-lg border-2 border-dashed">
        <p className="text-muted-foreground">No patient data available to display chart.</p>
      </div>
    );
  }
  
  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <XAxis
          dataKey="age"
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
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="patients" fill="var(--color-patients)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
