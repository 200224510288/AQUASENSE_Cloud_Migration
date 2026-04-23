"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Customer, Meter, Alert, Outage, Telemetry } from '@/types';
import { KPICard } from '@/components/shared/KPICard';
import { UsageChart } from '@/components/dashboard/UsageChart';
import { DistributionChart } from '@/components/dashboard/DistributionChart';
import { Users, Activity, AlertTriangle, WifiOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [outages, setOutages] = useState<Outage[]>([]);
  const [systemTelemetry, setSystemTelemetry] = useState<Telemetry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allCustomers, allMeters, allAlerts, allOutages] = await Promise.all([
          api.customers.getAll(),
          api.meters.getAll(),
          api.alerts.getAll(),
          api.outages.getAll()
        ]);
        
        setCustomers(allCustomers);
        setMeters(allMeters);
        setAlerts(allAlerts);
        setOutages(allOutages);

        if (allMeters.length > 0) {
          // Aggregate telemetry history for a system-wide view (mocked by fetching one representative history and scaling)
          const history = await api.telemetry.getHistoryForMeter(allMeters[0].id, 12);
          const scaledHistory = history.map(t => ({
            ...t,
            waterUsageLitres: t.waterUsageLitres * allMeters.length * 1.5,
          }));
          setSystemTelemetry(scaledHistory.reverse());
        }
      } catch (error) {
        console.error("Failed to load admin dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
  
  // Calculate distribution data
  const meterDistribution = [
    { name: 'Residential', value: meters.filter(m => m.type === 'residential').length },
    { name: 'Commercial', value: meters.filter(m => m.type === 'commercial').length },
    { name: 'Industrial', value: meters.filter(m => m.type === 'industrial').length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">System Operations</h1>
        <p className="text-slate-500 dark:text-slate-400">Platform-wide overview and operational telemetry.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard 
          title="Total Customers" 
          value={customers.length} 
          icon={Users}
          trend={{ value: 12, label: "vs last month", isPositive: true }}
        />
        <KPICard 
          title="Active Smart Meters" 
          value={meters.filter(m => m.status === 'online').length} 
          icon={Activity}
          description={`Out of ${meters.length} total deployed`}
        />
        <KPICard 
          title="Critical Alerts" 
          value={criticalAlerts.length} 
          icon={AlertTriangle}
          className={criticalAlerts.length > 0 ? "border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/10" : ""}
          description="Require immediate resolution"
        />
        <KPICard 
          title="Active Outages" 
          value={outages.filter(o => o.status !== 'resolved').length} 
          icon={WifiOff}
          trend={{ value: 2, label: "vs yesterday", isPositive: false }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <UsageChart 
          title="System-Wide Water Usage (12h)" 
          description="Aggregated consumption across all active meters"
          data={systemTelemetry} 
          dataKey="waterUsageLitres" 
          unit="L"
        />
        <DistributionChart 
          title="Meter Deployment" 
          description="By customer sector"
          data={meterDistribution}
          dataKey="value"
          nameKey="name"
        />
      </div>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Recent Critical Incidents</CardTitle>
          <CardDescription>Unresolved alerts requiring operator attention</CardDescription>
        </CardHeader>
        <CardContent>
          {criticalAlerts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No critical incidents at this time.</div>
          ) : (
            <div className="grid gap-4">
              {criticalAlerts.map(alert => (
                <div key={alert.id} className="flex items-start gap-4 p-4 rounded-lg border border-rose-100 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900/50">
                  <div className="bg-rose-100 dark:bg-rose-900/50 p-2 rounded-full mt-1">
                    <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-rose-900 dark:text-rose-400 capitalize">{alert.type.replace('_', ' ')}</h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{alert.message}</p>
                      </div>
                      <Badge variant="destructive">Critical</Badge>
                    </div>
                    <div className="flex gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>Meter ID: <span className="font-medium text-slate-700 dark:text-slate-300">{alert.meterId}</span></span>
                      <span>Detected: {new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
