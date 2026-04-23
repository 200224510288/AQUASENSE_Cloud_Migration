"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/store/useAuth';
import { api } from '@/lib/api';
import { SupportTicket } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Headset, Plus, MessageSquare } from 'lucide-react';

export default function SupportPage() {
  const { user, role } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !role) return;

    const fetchTickets = async () => {
      try {
        const data = role === 'admin' 
          ? await api.support.getAll() 
          : await api.support.getByCustomer(user.id);
        
        // Sort by createdAt descending
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setTickets(data);
      } catch (error) {
        console.error("Failed to load tickets", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user, role]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Customer Support</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {role === 'admin' ? 'Manage and assign customer service requests.' : 'View your active support tickets or contact us for help.'}
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
          {role === 'admin' ? <Headset className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {role === 'admin' ? 'Manage Queue' : 'Create Ticket'}
        </Button>
      </div>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>Recent inquiries and service requests.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead className="pl-6 w-12"></TableHead>
                <TableHead>Ticket ID</TableHead>
                {role === 'admin' && <TableHead>Customer</TableHead>}
                <TableHead>Subject</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={role === 'admin' ? 8 : 7} className="h-24 text-center">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={role === 'admin' ? 8 : 7} className="h-24 text-center text-slate-500">
                    No support tickets found.
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map(ticket => (
                  <TableRow key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <TableCell className="pl-6">
                      <MessageSquare className="h-4 w-4 text-slate-400" />
                    </TableCell>
                    <TableCell className="font-medium">{ticket.id}</TableCell>
                    {role === 'admin' && <TableCell className="text-slate-500">{ticket.customerId}</TableCell>}
                    <TableCell className="max-w-[300px] truncate">{ticket.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        ticket.priority === 'high' ? 'border-rose-500 text-rose-600' : 
                        ticket.priority === 'medium' ? 'border-amber-500 text-amber-600' : 'border-emerald-500 text-emerald-600'
                      }>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        ticket.status === 'open' ? 'default' : 
                        ticket.status === 'in_progress' ? 'secondary' : 'outline'
                      } className={ticket.status === 'open' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="sm">
                        View Thread
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
