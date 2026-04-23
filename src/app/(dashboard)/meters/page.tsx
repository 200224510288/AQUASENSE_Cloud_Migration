"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store/useAuth';
import { api } from '@/lib/api';
import { Meter } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, Activity } from 'lucide-react';

export default function MetersPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user || !role) return;

    const fetchMeters = async () => {
      try {
        const data = role === 'admin' 
          ? await api.meters.getAll() 
          : await api.meters.getByCustomer(user.id);
        setMeters(data);
      } catch (error) {
        console.error("Failed to load meters", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeters();
  }, [user, role]);

  const filteredMeters = meters.filter(m => 
    m.id.toLowerCase().includes(search.toLowerCase()) || 
    m.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {role === 'admin' ? 'All Meters' : 'My Meters'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage and monitor your smart meter infrastructure.
          </p>
        </div>
        {role === 'admin' && (
          <Button className="bg-blue-600 hover:bg-blue-700">Provision New Meter</Button>
        )}
      </div>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <CardTitle>Meter Inventory</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  type="search"
                  placeholder="Search meters..."
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
                <TableHead className="pl-6">Meter ID</TableHead>
                {role === 'admin' && <TableHead>Customer ID</TableHead>}
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Last Updated</TableHead>
                <TableHead className="text-center pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={role === 'admin' ? 7 : 6} className="h-24 text-center">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredMeters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={role === 'admin' ? 7 : 6} className="h-24 text-center text-slate-500">
                    No meters found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMeters.map(meter => (
                  <TableRow key={meter.id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50" onClick={() => router.push(`/meters/${meter.id}`)}>
                    <TableCell className="font-medium pl-6">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        {meter.id}
                      </div>
                    </TableCell>
                    {role === 'admin' && <TableCell className="text-slate-500">{meter.customerId}</TableCell>}
                    <TableCell>{meter.location}</TableCell>
                    <TableCell className="capitalize">{meter.type}</TableCell>
                    <TableCell>
                      <Badge variant={meter.status === 'online' ? 'default' : meter.status === 'offline' ? 'destructive' : 'secondary'}
                             className={meter.status === 'online' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}>
                        {meter.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-slate-500">
                      {new Date(meter.lastUpdated).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center pr-6">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/meters/${meter.id}`); }}>
                        View Details
                      </Button>
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
