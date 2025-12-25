'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Bell, Search, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';

interface HealthAlert {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Active' | 'Resolved';
  created_at: string;
}

export default function PatientAlertsPage() {
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  // Fetch alerts from health_alerts table
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('health_alerts')
        .select('*')
        .eq('status', 'Active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (err: any) {
      console.error('Error fetching alerts:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load alerts',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch alerts on mount
  useEffect(() => {
    fetchAlerts();
  }, []);

  // Real-time subscription to alerts
  useEffect(() => {
    const subscription = supabase
      .channel('health_alerts_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'health_alerts',
        },
        (payload) => {
          console.log('Alert update received:', payload);
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
    toast({
      title: 'Refreshed',
      description: 'Alerts updated',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High':
        return '🔴';
      case 'Medium':
        return '🟡';
      case 'Low':
        return '🔵';
      default:
        return '⚪';
    }
  };

  const filteredAlerts = alerts.filter(
    (alert) =>
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
          <Bell className="h-8 w-8 text-primary" />
          Health Alerts
        </h1>
        <p className="text-muted-foreground mt-2">
          Stay informed about important health updates and alerts from your health officials
        </p>
      </div>

      {/* Search and Refresh */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Display */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              Loading alerts...
            </div>
          </CardContent>
        </Card>
      ) : filteredAlerts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No alerts match your search' : 'No active alerts at this time'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAlerts.map((alert) => (
            <Card
              key={alert.id}
              className={`border-l-4 ${
                alert.priority === 'High'
                  ? 'border-l-red-500'
                  : alert.priority === 'Medium'
                  ? 'border-l-yellow-500'
                  : 'border-l-blue-500'
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getPriorityIcon(alert.priority)}</span>
                      <div>
                        <CardTitle className="text-xl">{alert.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {format(new Date(alert.created_at), 'PPpp')}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                  <Badge className={getPriorityColor(alert.priority)}>
                    {alert.priority} Priority
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-foreground">
                  {alert.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>Status: {alert.status}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      {!loading && alerts.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {alerts.filter((a) => a.priority === 'High').length}
                </div>
                <div className="text-sm text-muted-foreground">High Priority</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {alerts.filter((a) => a.priority === 'Medium').length}
                </div>
                <div className="text-sm text-muted-foreground">Medium Priority</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {alerts.filter((a) => a.priority === 'Low').length}
                </div>
                <div className="text-sm text-muted-foreground">Low Priority</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
