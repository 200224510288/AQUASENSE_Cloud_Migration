"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/store/useAuth';
import { api } from '@/lib/api';
import { Bill } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/shared/KPICard';
import { CreditCard, DollarSign, Download, AlertCircle } from 'lucide-react';

export default function BillingPage() {
  const { user, role } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !role) return;

    const fetchBills = async () => {
      try {
        const data = role === 'admin' 
          ? await api.billing.getAll() 
          : await api.billing.getByCustomer(user.id);
        
        // Sort by dueDate descending
        data.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
        setBills(data);
      } catch (error) {
        console.error("Failed to load bills", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [user, role]);

  const totalOutstanding = bills.filter(b => b.status !== 'paid').reduce((sum, b) => sum + b.amount, 0);
  const overdueCount = bills.filter(b => b.status === 'overdue').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Billing & Payments</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {role === 'admin' ? 'System-wide billing overview and revenue tracking.' : 'Manage your invoices, payments, and billing history.'}
          </p>
        </div>
        {!loading && role === 'customer' && totalOutstanding > 0 && (
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
            <CreditCard className="h-4 w-4" />
            Pay Outstanding Balance
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KPICard 
          title="Total Outstanding" 
          value={`$${totalOutstanding.toFixed(2)}`} 
          icon={DollarSign}
          className={totalOutstanding > 0 ? "border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10" : ""}
        />
        <KPICard 
          title="Overdue Invoices" 
          value={overdueCount} 
          icon={AlertCircle}
          className={overdueCount > 0 ? "border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/10" : ""}
        />
        <KPICard 
          title="Total Invoices" 
          value={bills.length} 
          icon={CreditCard}
        />
      </div>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>View and download previous bills.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead className="pl-6">Invoice ID</TableHead>
                {role === 'admin' && <TableHead>Customer ID</TableHead>}
                <TableHead>Billing Period</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right pr-6">Action</TableHead>
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
              ) : bills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={role === 'admin' ? 7 : 6} className="h-24 text-center text-slate-500">
                    No billing records found.
                  </TableCell>
                </TableRow>
              ) : (
                bills.map(bill => (
                  <TableRow key={bill.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <TableCell className="font-medium pl-6">{bill.id}</TableCell>
                    {role === 'admin' && <TableCell className="text-slate-500">{bill.customerId}</TableCell>}
                    <TableCell className="text-sm text-slate-500">{bill.periodStart} to {bill.periodEnd}</TableCell>
                    <TableCell className="font-semibold text-slate-900 dark:text-white">${bill.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={bill.status === 'paid' ? 'default' : bill.status === 'overdue' ? 'destructive' : 'secondary'}
                             className={bill.status === 'paid' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : ''}>
                        {bill.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">{bill.dueDate}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" title="Download PDF">
                        <Download className="h-4 w-4 text-slate-500" />
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
