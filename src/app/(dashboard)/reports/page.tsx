"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/store/useAuth';
import { api } from '@/lib/api';
import { Telemetry, Meter } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UsageChart } from '@/components/dashboard/UsageChart';
import { DistributionChart } from '@/components/dashboard/DistributionChart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FileText, Download, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
  const { user, role } = useAuth();
  const [meters, setMeters] = useState<Meter[]>([]);
  const [selectedMeter, setSelectedMeter] = useState<string>('all');
  const [telemetry, setTelemetry] = useState<Telemetry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !role) return;

    const fetchMeters = async () => {
      try {
        const data = role === 'admin' 
          ? await api.meters.getAll() 
          : await api.meters.getByCustomer(user.id);
        
        setMeters(data);
        if (data.length > 0) {
          setSelectedMeter(data[0].id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load meters for reports", error);
        setLoading(false);
      }
    };

    fetchMeters();
  }, [user, role]);

  useEffect(() => {
    if (!selectedMeter || selectedMeter === 'all') {
      setLoading(false);
      return;
    }

    const fetchTelemetry = async () => {
      setLoading(true);
      try {
        const history = await api.telemetry.getHistoryForMeter(selectedMeter, 24);
        setTelemetry(history.reverse());
      } catch (error) {
        console.error("Failed to load telemetry", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTelemetry();
  }, [selectedMeter]);

  const riskDistribution = [
    { name: 'Low Risk', value: telemetry.filter(t => t.leakageRisk === 'low').length },
    { name: 'Medium Risk', value: telemetry.filter(t => t.leakageRisk === 'medium').length },
    { name: 'High Risk', value: telemetry.filter(t => t.leakageRisk === 'high').length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Analytics & Reports</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Generate insights, view consumption trends, and export data.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Generate PDF
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Usage Trends</CardTitle>
              <CardDescription>Analyze historical consumption patterns</CardDescription>
            </div>
            <div className="w-full sm:w-64">
              <Select value={selectedMeter} onValueChange={(value) => { if (value) setSelectedMeter(value); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a meter" />
                </SelectTrigger>
                <SelectContent>
                  {meters.map(meter => (
                    <SelectItem key={meter.id} value={meter.id}>
                      Meter: {meter.id} - {meter.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-[300px]">
              <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : telemetry.length === 0 ? (
            <div className="flex justify-center items-center h-[300px] text-slate-500">
              No telemetry data available for the selected meter.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-1 lg:col-span-2">
                <UsageChart 
                  title="24-Hour Consumption" 
                  description="Water usage over the last 24 hours"
                  data={telemetry} 
                  dataKey="waterUsageLitres" 
                  unit="L"
                  color="#2563eb"
                />
              </div>
              <div className="col-span-1 space-y-6">
                <DistributionChart 
                  title="Leakage Risk Assessment" 
                  description="Risk frequency over time period"
                  data={riskDistribution}
                  dataKey="value"
                  nameKey="name"
                />
                <Card className="border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-full">
                        <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">Efficiency Insight</h4>
                        <p className="text-sm text-slate-500 mt-1">
                          Consumption during off-peak hours has decreased by 12% compared to last month. Good job optimizing!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
