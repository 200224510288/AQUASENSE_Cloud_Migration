"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/store/useAuth';
import { api } from '@/lib/api';
import { Outage } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WifiOff, ShieldAlert, MapPin, Clock } from 'lucide-react';

export default function OutagesPage() {
  const { role } = useAuth();
  const [outages, setOutages] = useState<Outage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOutages = async () => {
      try {
        const data = await api.outages.getAll();
        setOutages(data);
      } catch (error) {
        console.error("Failed to load outages", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOutages();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Service Status</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {role === 'admin' ? 'Manage network outages and dispatch crews.' : 'Check for known outages in your area.'}
          </p>
        </div>
        {role === 'admin' && (
          <Button className="bg-rose-600 hover:bg-rose-700 gap-2">
            <ShieldAlert className="h-4 w-4" />
            Declare Outage
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : outages.length === 0 ? (
          <Card className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/10">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-full mb-4">
                <WifiOff className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-400">No Active Outages</h3>
              <p className="text-emerald-700 dark:text-emerald-500 mt-2">All utility services are operating normally across all regions.</p>
            </CardContent>
          </Card>
        ) : (
          outages.map(outage => (
            <Card key={outage.id} className="border-rose-200 dark:border-rose-900/50 overflow-hidden">
              <div className={`h-2 w-full ${
                outage.severity === 'high' ? 'bg-rose-500' : 
                outage.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
              }`}></div>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ShieldAlert className={`h-5 w-5 ${
                        outage.severity === 'high' ? 'text-rose-500' : 
                        outage.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'
                      }`} />
                      Outage in {outage.region}
                    </CardTitle>
                    <CardDescription className="mt-1">Incident ID: {outage.id}</CardDescription>
                  </div>
                  <Badge variant={outage.status === 'resolved' ? 'secondary' : 'destructive'}>
                    {outage.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <MapPin className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Affected Region</p>
                      <p className="text-sm text-slate-500">{outage.region}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <WifiOff className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Customers Affected</p>
                      <p className="text-sm text-slate-500">{outage.affectedCustomers} properties</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <Clock className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Est. Resolution</p>
                      <p className="text-sm text-slate-500">{new Date(outage.estimatedResolution).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                {role === 'admin' && (
                  <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button variant="outline">Update Status</Button>
                    <Button>Dispatch Crew</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
