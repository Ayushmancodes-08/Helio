'use client';

import { useMemo } from 'react';
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { IndianRupee, Pill, CalendarDays, Loader2 } from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';
import { useSales } from '@/hooks/useSales';
import { useLanguage } from '@/hooks/useLanguage';

const chartConfig = {
  sales: {
    label: 'Sales (₹)',
    color: 'hsl(var(--primary))',
  },
};

export default function PharmacistReportsPage() {
  const { sales, loading } = useSales();
  const { formatCurrency, t } = useLanguage();

  const totalRevenue = useMemo(() => sales.reduce((sum, t) => sum + t.total_amount, 0), [sales]);
  const totalPrescriptions = sales.length;

  // Prepare data for the sales chart (last 7 days)
  const salesData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(new Date(), i);
      const dateString = format(date, 'yyyy-MM-dd');
      // Sales records have full ISO string, we need to match YYYY-MM-DD part
      const daySales = sales
        .filter(t => t.sale_date.startsWith(dateString))
        .reduce((sum, t) => sum + t.total_amount, 0);
      return {
        date: format(date, 'E'), // e.g., 'Mon'
        sales: daySales,
      };
    }).reverse();
  }, [sales]);

  const busiestDayData = useMemo(() =>
    salesData.reduce((max, day) => day.sales > max.sales ? day : max, salesData[0] || { date: 'N/A', sales: 0 })
    , [salesData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">{t('pharmacist.salesReports')}</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pharmacist.totalRevenue')}</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {t('pharmacist.fromAllRecordedTransactions')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pharmacist.prescriptionsFilled')}</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalPrescriptions}</div>
            <p className="text-xs text-muted-foreground">
              {t('pharmacist.totalPrescriptionsRecorded')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pharmacist.busiestDay')}</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{busiestDayData.date}</div>
            <p className="text-xs text-muted-foreground">
              {t('pharmacist.basedOnSalesVolumeThisWeek')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('pharmacist.thisWeeksSales')}</CardTitle>
          <CardDescription>
            {t('pharmacist.visualSummaryOfSalesActivity')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart accessibilityLayer data={salesData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
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
                tickFormatter={(value) => formatCurrency(value)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('pharmacist.recentTransactions')}</CardTitle>
          <CardDescription>
            {t('pharmacist.listOfLatestSalesRecorded')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('pharmacist.medicine')}</TableHead>
                <TableHead>{t('pharmacist.date')}</TableHead>
                <TableHead className="text-right">{t('pharmacist.amount')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length > 0 ? sales.slice(0, 10).map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.medicine_name}</TableCell>
                  <TableCell>{format(new Date(transaction.sale_date), 'PPP')}</TableCell>
                  <TableCell className="text-right">{formatCurrency(transaction.total_amount)}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                    No transactions recorded yet.
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
