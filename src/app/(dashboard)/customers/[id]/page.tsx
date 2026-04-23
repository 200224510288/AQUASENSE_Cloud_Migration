"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Customer, Meter, Alert, Bill } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, MapPin, Calendar, Activity, AlertTriangle, CreditCard } from 'lucide-react';
import { useAuth } from '@/lib/store/useAuth';

export default function CustomerDetailsPage() {
  const { role } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  // Layout handles auth, but adding extra check
  useEffect(() => {
    if (role !== 'admin') {
      router.replace('/customer');
      return;
    }
    
    if (!id) return;

    const fetchDetails = async () => {
      try {
        const [customerData, metersData, alertsData, billsData] = await Promise.all([
          api.customers.getById(id),
          api.meters.getByCustomer(id),
          api.alerts.getByCustomer(id),
          api.billing.getByCustomer(id)
        ]);
        
        if (customerData) setCustomer(customerData);
        setMeters(metersData);
        setAlerts(alertsData);
        setBills(billsData);
      } catch (error) {
        console.error("Failed to load customer details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, role, router]);

  if (role !== 'admin') return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Customer Not Found</h2>
        <p className="text-slate-500 mb-6">The customer you are looking for does not exist.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{customer.name}</h1>
            <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}
                   className={customer.status === 'active' ? 'bg-emerald-500 text-white' : ''}>
              {customer.status}
            </Badge>
          </div>
          <p className="text-slate-500 dark:text-slate-400">Customer ID: {customer.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Profile Info */}
        <Card className="col-span-1 border-slate-200 dark:border-slate-800 h-fit">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 text-sm">
              <Mail className="h-4 w-4 text-slate-400 mt-0.5" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-slate-500">{customer.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
              <div>
                <p className="font-medium">Billing Address</p>
                <p className="text-slate-500">{customer.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
              <div>
                <p className="font-medium">Customer Since</p>
                <p className="text-slate-500">{new Date(customer.joinedDate).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <div className="col-span-1 md:col-span-3">
          <Tabs defaultValue="meters" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="meters" className="flex gap-2"><Activity className="h-4 w-4" /> Meters</TabsTrigger>
              <TabsTrigger value="alerts" className="flex gap-2"><AlertTriangle className="h-4 w-4" /> Alerts</TabsTrigger>
              <TabsTrigger value="billing" className="flex gap-2"><CreditCard className="h-4 w-4" /> Billing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="meters" className="mt-0">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle>Assigned Meters</CardTitle>
                  <CardDescription>All smart meters registered to this customer.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">Meter ID</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right pr-6">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {meters.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-6 text-slate-500">No meters found.</TableCell></TableRow>
                      ) : (
                        meters.map(meter => (
                          <TableRow key={meter.id}>
                            <TableCell className="font-medium pl-6">{meter.id}</TableCell>
                            <TableCell>{meter.location}</TableCell>
                            <TableCell className="capitalize">{meter.type}</TableCell>
                            <TableCell>
                              <Badge variant={meter.status === 'online' ? 'default' : meter.status === 'offline' ? 'destructive' : 'secondary'}
                                     className={meter.status === 'online' ? 'bg-emerald-500' : ''}>
                                {meter.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <Button variant="ghost" size="sm" onClick={() => router.push(`/meters/${meter.id}`)}>View</Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="mt-0">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle>Customer Alerts</CardTitle>
                  <CardDescription>Alert history for this customer's meters.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">Type</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alerts.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-6 text-slate-500">No alerts found.</TableCell></TableRow>
                      ) : (
                        alerts.map(alert => (
                          <TableRow key={alert.id}>
                            <TableCell className="font-medium capitalize pl-6">{alert.type.replace('_', ' ')}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={
                                alert.severity === 'critical' ? 'border-rose-500 text-rose-600' : 
                                alert.severity === 'warning' ? 'border-amber-500 text-amber-600' : 'border-blue-500 text-blue-600'
                              }>
                                {alert.severity}
                              </Badge>
                            </TableCell>
                            <TableCell>{alert.status}</TableCell>
                            <TableCell className="text-sm text-slate-500">{new Date(alert.timestamp).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="mt-0">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>Recent invoices and payment status.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">Invoice ID</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right pr-6">Due Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bills.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-6 text-slate-500">No bills found.</TableCell></TableRow>
                      ) : (
                        bills.map(bill => (
                          <TableRow key={bill.id}>
                            <TableCell className="font-medium pl-6">{bill.id}</TableCell>
                            <TableCell className="text-sm text-slate-500">{bill.periodStart} - {bill.periodEnd}</TableCell>
                            <TableCell className="font-medium">${bill.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant={bill.status === 'paid' ? 'default' : bill.status === 'overdue' ? 'destructive' : 'secondary'}
                                     className={bill.status === 'paid' ? 'bg-emerald-500' : ''}>
                                {bill.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-sm text-slate-500 pr-6">{bill.dueDate}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
}
