
'use client';

import { useState } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Megaphone, FileSearch, Loader2, Trash2 } from 'lucide-react';
import { useHealthAlerts } from '@/hooks/useHealthAlerts';
import { useDistricts } from '@/hooks/useHealthData';
import { useLanguage } from '@/hooks/useLanguage';

const alertSchema = z.object({
  title: z.string().min(1, 'Alert title is required.'),
  region: z.string().min(1, 'Please select a region.'),
  priority: z.enum(['Low', 'Medium', 'High']),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
});

type AlertFormValues = z.infer<typeof alertSchema>;

export default function AlertsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { t } = useLanguage();

  // Use Supabase for alerts and districts
  const { alerts, loading: alertsLoading, createAlert, deleteAlert } = useHealthAlerts();
  const { districts, loading: districtsLoading } = useDistricts();

  const loading = alertsLoading || districtsLoading;
  const regions = ['all', ...districts.map(d => d.name.toLowerCase())];

  const form = useForm<AlertFormValues>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      title: '',
      region: 'all',
      priority: 'Medium',
      description: '',
    },
  });

  const onSubmit = async (data: AlertFormValues) => {
    // Find district ID if not "all"
    const targetDistrictId = data.region === 'all'
      ? null
      : districts.find(d => d.name.toLowerCase() === data.region)?.id || null;

    const result = await createAlert({
      title: data.title,
      description: data.description,
      priority: data.priority,
      district_id: targetDistrictId,
    });

    if (result.success) {
      toast({
        title: 'Alert Issued',
        description: `A new ${data.priority} priority alert has been issued for the ${data.region} region.`,
      });
      form.reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Failed to create alert',
      });
    }
  };

  const filteredAlerts = alerts.filter(
    (alert) => alert.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDistrictName = (districtId: string | null) => {
    if (!districtId) return 'All Regions';
    const district = districts.find(d => d.id === districtId);
    return district?.name || 'Unknown';
  };

  const getPriorityVariant = (priority: string): 'destructive' | 'default' | 'secondary' => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'secondary';
    }
  };

  const handleDeleteAlert = async (id: string, title: string) => {
    if (!confirm(`Delete alert "${title}"?`)) {
      return;
    }

    const result = await deleteAlert(id);
    if (result.success) {
      toast({
        title: 'Alert Deleted',
        description: `Alert "${title}" has been deleted.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Failed to delete alert',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">{t('healthOfficial.publicHealthAlerts')}</h1>
        <p className="text-muted-foreground">{t('healthOfficial.issueNewAlertsMonitor')}</p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading alerts...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{t('healthOfficial.issueNewAlert')}</CardTitle>
              <CardDescription>{t('healthOfficial.createAndDispatchNewHealthAdvisory')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('healthOfficial.alertTitle')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('healthOfficial.alertTitlePlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="region"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('healthOfficial.targetRegion')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('healthOfficial.selectRegion')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {regions.map(region => (
                                  <SelectItem key={region} value={region} className="capitalize">
                                    {region === 'all' ? t('healthOfficial.allRegions') : region}
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
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('healthOfficial.priority')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Low">{t('common.low')}</SelectItem>
                                <SelectItem value="Medium">{t('common.medium')}</SelectItem>
                                <SelectItem value="High">{t('common.high')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>{t('healthOfficial.description')}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t('healthOfficial.provideDetailedDescription')}
                              {...field}
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit">
                    <Megaphone className="mr-2 h-4 w-4" />
                    {t('healthOfficial.issueAlert')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>{t('healthOfficial.activeAndRecentAlerts')}</CardTitle>
                  <CardDescription>{t('healthOfficial.logOfRecentlyIssuedPublicHealthAdvisories')}</CardDescription>
                </div>
                <div className="relative">
                  <FileSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={t('healthOfficial.searchByTitle')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 md:w-64 lg:w-80"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('healthOfficial.alertTitle')}</TableHead>
                    <TableHead className="hidden sm:table-cell">{t('healthOfficial.priority')}</TableHead>
                    <TableHead className="hidden md:table-cell">{t('healthOfficial.region')}</TableHead>
                    <TableHead className="hidden md:table-cell">{t('healthOfficial.dateIssued')}</TableHead>
                    <TableHead>{t('healthOfficial.status')}</TableHead>
                    <TableHead className="text-right">{t('healthOfficial.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">{alert.title}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={getPriorityVariant(alert.priority)}>{alert.priority}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell capitalize">
                        {getDistrictName(alert.district_id)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{format(new Date(alert.created_at), 'PPP')}</TableCell>
                      <TableCell>
                        <Badge variant={alert.status === 'Active' ? 'default' : 'outline'}>{alert.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAlert(alert.id, alert.title)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredAlerts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No alerts found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
