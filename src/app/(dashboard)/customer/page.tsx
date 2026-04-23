"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/store/useAuth';
import { api } from '@/lib/api';
import { Meter, Alert, Telemetry } from '@/types';
import { KPICard } from '@/components/shared/KPICard';
import { UsageChart } from '@/components/dashboard/UsageChart';
import { Activity, Droplets, AlertTriangle, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [meters, setMeters] = useState<Meter[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [telemetryHistory, setTelemetryHistory] = useState<Telemetry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [customerMeters, customerAlerts] = await Promise.all([
          api.meters.getByCustomer(user.id),
          api.alerts.getByCustomer(user.id)
        ]);
        
        setMeters(customerMeters);
        setAlerts(customerAlerts);

        if (customerMeters.length > 0) {
          // Get history for the first meter as a representation
          const history = await api.telemetry.getHistoryForMeter(customerMeters[0].id, 12);
          setTelemetryHistory(history.reverse()); // Chronological order
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Calculate aggregates
  const activeAlerts = alerts.filter(a => a.status === 'active');
  const latestUsage = telemetryHistory.length > 0 ? telemetryHistory[telemetryHistory.length - 1].waterUsageLitres : 0;
  const latestPressure = telemetryHistory.length > 0 ? telemetryHistory[telemetryHistory.length - 1].pressureKPa : 0;
  const totalEnergy = telemetryHistory.reduce((sum, t) => sum + t.energyKWh, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Customer Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">Overview of your utility usage and current system status.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard 
          title="Current Water Usage" 
          value={`${latestUsage.toLocaleString()} L`} 
          icon={Droplets}
          trend={{ value: 2.4, label: "vs last hour", isPositive: false }}
        />
        <KPICard 
          title="Average Pressure" 
          value={`${latestPressure} kPa`} 
          icon={Activity}
          description="Within normal parameters"
        />
        <KPICard 
          title="Energy Consumption" 
          value={`${Math.round(totalEnergy)} kWh`} 
          icon={Zap}
          trend={{ value: 5.1, label: "vs yesterday", isPositive: true }}
        />
        <KPICard 
          title="Active Alerts" 
          value={activeAlerts.length} 
          icon={AlertTriangle}
          className={activeAlerts.length > 0 ? "border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10" : ""}
          description={activeAlerts.length > 0 ? "Requires attention" : "All systems normal"}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <UsageChart 
          title="Water Usage Trend (Last 12 Hours)" 
          description="Aggregate usage across your primary meters"
          data={telemetryHistory} 
          dataKey="waterUsageLitres" 
          unit="L"
        />

        <Card className="col-span-1 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Latest system notifications</CardDescription>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No recent alerts.</div>
            ) : (
              <div className="space-y-4">
                {alerts.slice(0, 4).map(alert => (
                  <div key={alert.id} className="flex flex-col gap-1 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-4 w-4 ${
                          alert.severity === 'critical' ? 'text-rose-500' : 
                          alert.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'
                        }`} />
                        <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">{alert.type.replace('_', ' ')}</span>
                      </div>
                      <Badge variant={alert.status === 'active' ? 'destructive' : 'secondary'} className="text-[10px]">
                        {alert.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 pl-6">{alert.message}</p>
                    <span className="text-[10px] text-slate-400 pl-6">{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>My Meters</CardTitle>
          <CardDescription>Current status of your registered smart meters</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meter ID</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meters.map(meter => (
                <TableRow key={meter.id}>
                  <TableCell className="font-medium">{meter.id}</TableCell>
                  <TableCell>{meter.location}</TableCell>
                  <TableCell className="capitalize">{meter.type}</TableCell>
                  <TableCell>
                    <Badge variant={meter.status === 'online' ? 'default' : meter.status === 'offline' ? 'destructive' : 'secondary'}
                           className={meter.status === 'online' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                      {meter.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-slate-500">
                    {new Date(meter.lastUpdated).toLocaleTimeString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
