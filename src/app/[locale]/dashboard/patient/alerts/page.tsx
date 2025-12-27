'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Loader2 } from 'lucide-react';
import { useHealthAlerts } from '@/hooks/useHealthAlerts';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';

export default function PatientAlertsPage() {
  const { alerts, loading } = useHealthAlerts();
  const t = useTranslations('patient');
  const tCommon = useTranslations('common');

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'destructive' as const;
      case 'Medium':
        return 'default' as const;
      case 'Low':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const getStatusVariant = (status: string) => {
    return status === 'Active' ? 'default' as const : 'secondary' as const;
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeAlerts = alerts.filter((a) => a.status === 'Active');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          {tCommon('navigation.healthAlerts')}
        </h1>
        <p className="text-muted-foreground">
          {t('healthAlertsDesc')}
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>{t('activeHealthAlerts')}</CardTitle>
            </div>
            <CardDescription>
              {activeAlerts.length} {t('activeAlertsInRegion', { count: activeAlerts.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeAlerts.length > 0 ? (
              <div className="space-y-4">
                {activeAlerts.map((alert) => (
                  <Card key={alert.id} className="border-l-4 border-l-primary">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{alert.title}</CardTitle>
                          <CardDescription className="mt-2">
                            {alert.description}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <Badge variant={getPriorityVariant(alert.priority)}>
                            {alert.priority} {t('priority')}
                          </Badge>
                          <Badge variant={getStatusVariant(alert.status)}>
                            {alert.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        Issued: {format(new Date(alert.created_at), 'PPp')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-semibold">{t('noActiveAlerts')}</h3>
                <p className="text-muted-foreground mt-2">
                  {t('noActiveAlertsDesc')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {alerts.filter((a) => a.status === 'Resolved').length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('resolvedAlerts')}</CardTitle>
              <CardDescription>{t('resolvedAlertsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts
                  .filter((a) => a.status === 'Resolved')
                  .slice(0, 5)
                  .map((alert) => (
                    <Card key={alert.id} className="opacity-60">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base">{alert.title}</CardTitle>
                            <CardDescription className="mt-1 text-sm">
                              {alert.description}
                            </CardDescription>
                          </div>
                          <Badge variant={getStatusVariant(alert.status)}>
                            {alert.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">
                          Issued: {format(new Date(alert.created_at), 'PPp')}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
