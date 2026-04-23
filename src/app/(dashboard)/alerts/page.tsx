"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/store/useAuth';
import { api } from '@/lib/api';
import { Alert } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, AlertTriangle, CheckCircle2, SlidersHorizontal, BellRing } from 'lucide-react';

export default function AlertsPage() {
  const { user, role } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user || !role) return;

    const fetchAlerts = async () => {
      try {
        const data = role === 'admin' 
          ? await api.alerts.getAll() 
          : await api.alerts.getByCustomer(user.id);
        
        // Sort by timestamp descending
        data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setAlerts(data);
      } catch (error) {
        console.error("Failed to load alerts", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [user, role]);

  const filteredAlerts = alerts.filter(a => 
    a.type.toLowerCase().includes(search.toLowerCase()) || 
    a.meterId.toLowerCase().includes(search.toLowerCase()) ||
    a.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Alerts & Incidents</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {role === 'admin' ? 'Monitor system-wide alerts and incidents.' : 'Review notifications and issues affecting your meters.'}
          </p>
        </div>
        <div className="flex gap-2">
          {role === 'admin' && <Button variant="outline">Acknowledge All</Button>}
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
            <BellRing className="h-4 w-4" />
            Alert Settings
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <CardTitle>Incident Log</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  type="search"
                  placeholder="Search alerts..."
                  className="pl-9 w-64 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead className="pl-6 w-12"></TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Meter ID</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredAlerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                    No alerts found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAlerts.map(alert => (
                  <TableRow key={alert.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <TableCell className="pl-6">
                      {alert.status === 'active' ? (
                        <AlertTriangle className={`h-5 w-5 ${
                          alert.severity === 'critical' ? 'text-rose-500' : 
                          alert.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'
                        }`} />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium capitalize">{alert.type.replace('_', ' ')}</TableCell>
                    <TableCell className="text-slate-500">{alert.meterId}</TableCell>
                    <TableCell className="max-w-md truncate" title={alert.message}>{alert.message}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        alert.severity === 'critical' ? 'border-rose-500 text-rose-600' : 
                        alert.severity === 'warning' ? 'border-amber-500 text-amber-600' : 'border-blue-500 text-blue-600'
                      }>
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={alert.status === 'active' ? 'destructive' : 'secondary'}>
                        {alert.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-slate-500 pr-6">
                      {new Date(alert.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
