"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Meter, Telemetry } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UsageChart } from '@/components/dashboard/UsageChart';
import { ArrowLeft, Activity, MapPin, Tag, RefreshCcw } from 'lucide-react';

export default function MeterDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [meter, setMeter] = useState<Meter | null>(null);
  const [telemetry, setTelemetry] = useState<Telemetry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchDetails = async () => {
      try {
        const [meterData, historyData] = await Promise.all([
          api.meters.getById(id),
          api.telemetry.getHistoryForMeter(id, 24)
        ]);
        
        if (meterData) setMeter(meterData);
        setTelemetry(historyData.reverse());
      } catch (error) {
        console.error("Failed to load meter details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
    
    // Simulate real-time updates every 10 seconds for the demo
    const interval = setInterval(async () => {
      const latest = await api.telemetry.getLatestForMeter(id);
      if (latest) {
        setTelemetry(prev => {
          const newHistory = [...prev, latest];
          if (newHistory.length > 24) newHistory.shift();
          return newHistory;
        });
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!meter) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Meter Not Found</h2>
        <p className="text-slate-500 mb-6">The meter you are looking for does not exist or you don't have access.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const currentReading = telemetry.length > 0 ? telemetry[telemetry.length - 1] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Meter {meter.id}</h1>
            <Badge variant={meter.status === 'online' ? 'default' : meter.status === 'offline' ? 'destructive' : 'secondary'}
                   className={meter.status === 'online' ? 'bg-emerald-500 text-white' : ''}>
              {meter.status}
            </Badge>
          </div>
          <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
            <MapPin className="h-3 w-3" /> {meter.location}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Device Information */}
        <Card className="col-span-1 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Device Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 flex items-center gap-2"><Tag className="h-4 w-4" /> Type</span>
              <span className="font-medium capitalize">{meter.type}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 flex items-center gap-2"><Activity className="h-4 w-4" /> Site ID</span>
              <span className="font-medium">{meter.siteId}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 flex items-center gap-2"><RefreshCcw className="h-4 w-4" /> Last Sync</span>
              <span className="font-medium">{new Date(meter.lastUpdated).toLocaleTimeString()}</span>
            </div>
            
            {currentReading && (
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 -mx-6 px-6 -mb-6 pb-6 rounded-b-xl">
                <h4 className="text-sm font-semibold mb-4 text-slate-900 dark:text-slate-100">Live Telemetry</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Flow Rate</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{currentReading.waterUsageLitres} L/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Pressure</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{currentReading.pressureKPa} kPa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Leakage Risk</span>
                    <Badge variant="outline" className={
                      currentReading.leakageRisk === 'high' ? 'border-rose-500 text-rose-500' : 
                      currentReading.leakageRisk === 'medium' ? 'border-amber-500 text-amber-500' : 'border-emerald-500 text-emerald-500'
                    }>
                      {currentReading.leakageRisk.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <UsageChart 
            title="Water Usage (24h)" 
            description="Liters per hour consumption"
            data={telemetry} 
            dataKey="waterUsageLitres" 
            unit="L"
            color="#2563eb"
          />
          <UsageChart 
            title="Pressure Dynamics (24h)" 
            description="System pressure at meter location"
            data={telemetry} 
            dataKey="pressureKPa" 
            unit="kPa"
            color="#059669"
          />
        </div>
      </div>
    </div>
  );
}
