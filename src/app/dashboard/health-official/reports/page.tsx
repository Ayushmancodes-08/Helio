
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDistricts } from '@/hooks/useHealthData';

const reportTypes = {
  'disease-summary': 'Weekly Disease Summary',
  'resource-utilization': 'Monthly Resource Utilization',
};

const reportSchema = z.object({
  reportType: z.string().min(1, 'Please select a report type.'),
  region: z.string().min(1, 'Please select a region.'),
  startDate: z.string().min(1, 'Please select a start date.'),
  endDate: z.string().min(1, 'Please select an end date.'),
}).refine(data => new Date(data.startDate) <= new Date(data.endDate), {
  message: 'Start date cannot be after end date.',
  path: ['startDate'],
});

type ReportFormValues = z.infer<typeof reportSchema>;
type GeneratedReport = {
  title: string;
  parameters: string;
  content: string;
};

export default function ReportsPage() {
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const { toast } = useToast();

  // Use Supabase for districts
  const { districts, loading: districtsLoading } = useDistricts();
  const regions = ['all', ...districts.map(d => d.name.toLowerCase())];

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reportType: 'disease-summary',
      region: 'all',
      startDate: format(new Date(new Date().setDate(new Date().getDate() - 7)), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const generateReportContent = (data: ReportFormValues) => {
    const regionName = data.region === 'all' ? 'All Regions' : data.region.charAt(0).toUpperCase() + data.region.slice(1);
    const startDate = format(new Date(data.startDate), 'PPP');
    const endDate = format(new Date(data.endDate), 'PPP');

    let content = '';
    const availableRegions = regions.filter(r => r !== 'all');
    const criticalDistrict = availableRegions.length > 0 ? availableRegions[Math.floor(Math.random() * availableRegions.length)] : 'a district';

    if (data.reportType === 'disease-summary') {
      const cases = Math.floor(Math.random() * 500) + 50;
      const trend = Math.random() > 0.5 ? 'increased' : 'decreased';
      const percentage = (Math.random() * 25 + 5).toFixed(1);
      content = `Between ${startDate} and ${endDate}, a total of ${cases} communicable disease cases were reported in ${regionName}. The overall trend has ${trend} by ${percentage}% compared to the previous period. The most prevalent illness was the Flu, particularly in the ${criticalDistrict} district if 'All Regions' is selected.`;
    } else if (data.reportType === 'resource-utilization') {
      const occupancy = (Math.random() * 40 + 50).toFixed(1);
      content = `For the period of ${startDate} to ${endDate} in ${regionName}, the average hospital bed occupancy was ${occupancy}%. The ${criticalDistrict} district experienced the highest strain with occupancy peaking at 95%. Staffing levels remained adequate, but ambulance deployment times saw a minor increase of 5%.`;
    }

    return {
      title: reportTypes[data.reportType as keyof typeof reportTypes],
      parameters: `Region: ${regionName} | Period: ${startDate} to ${endDate}`,
      content: content,
    };
  };

  const onSubmit = (data: ReportFormValues) => {
    const report = generateReportContent(data);
    setGeneratedReport(report);
    setIsDetailDialogOpen(true);
  };

  const handleDownload = () => {
    if (!generatedReport) return;

    const fileContent = `Report Title: ${generatedReport.title}\nParameters: ${generatedReport.parameters}\n\n${generatedReport.content}`;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedReport.title.toLowerCase().replace(/\s/g, '_')}_${format(new Date(), 'yyyyMMdd')}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast({
      title: 'Report Downloaded',
      description: `${generatedReport.title} has been downloaded.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Generate Health Reports</h1>
        <p className="text-muted-foreground">
          Create custom, dynamic reports on public health metrics.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Parameters</CardTitle>
          <CardDescription>Select the criteria for your report.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="reportType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Report Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a report type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(reportTypes).map(([key, value]) => (
                            <SelectItem key={key} value={key}>{value}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a region" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {regions.map(region => (
                            <SelectItem key={region} value={region} className="capitalize">
                              {region === 'all' ? 'All Regions' : region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit">
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Report Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{generatedReport?.title}</DialogTitle>
            <DialogDescription>
              {generatedReport?.parameters}
            </DialogDescription>
          </DialogHeader>
          {generatedReport && (
            <div className="prose prose-sm max-w-none rounded-lg border bg-secondary/50 p-4">
              <p>{generatedReport.content}</p>
            </div>
          )}
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Download Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

