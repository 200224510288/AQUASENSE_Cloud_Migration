"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store/useAuth';
import { api } from '@/lib/api';
import { Customer } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, User } from 'lucide-react';

export default function CustomersPage() {
  const { role } = useAuth();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Role protection is handled by layout, but add safety check
  useEffect(() => {
    if (role !== 'admin') {
      router.replace('/customer');
      return;
    }

    const fetchCustomers = async () => {
      try {
        const data = await api.customers.getAll();
        setCustomers(data);
      } catch (error) {
        console.error("Failed to load customers", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [role, router]);

  if (role !== 'admin') return null;

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Customers</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage customer accounts and access details.
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">Add Customer</Button>
      </div>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <CardTitle>Customer Directory</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  type="search"
                  placeholder="Search customers..."
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
                <TableHead className="pl-6">Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-center pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                    No customers found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map(customer => (
                  <TableRow key={customer.id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50" onClick={() => router.push(`/customers/${customer.id}`)}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                          <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{customer.name}</div>
                          <div className="text-xs text-slate-500">{customer.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{customer.email}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">{customer.address}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}
                             className={customer.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {new Date(customer.joinedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center pr-6">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/customers/${customer.id}`); }}>
                        View Profile
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
