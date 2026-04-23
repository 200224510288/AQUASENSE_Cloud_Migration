"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/store/useAuth';
import { 
  LayoutDashboard, 
  Activity, 
  AlertTriangle, 
  Users, 
  FileText, 
  CreditCard, 
  Headset, 
  WifiOff, 
  Settings,
  Droplets
} from 'lucide-react';

const adminLinks = [
  { title: 'System Overview', href: '/admin', icon: LayoutDashboard },
  { title: 'All Meters', href: '/meters', icon: Activity },
  { title: 'Alerts & Incidents', href: '/alerts', icon: AlertTriangle },
  { title: 'Customers', href: '/customers', icon: Users },
  { title: 'Reports', href: '/reports', icon: FileText },
  { title: 'Billing Overview', href: '/billing', icon: CreditCard },
  { title: 'Support Tickets', href: '/support', icon: Headset },
  { title: 'Outages', href: '/outages', icon: WifiOff },
  { title: 'Settings', href: '/settings', icon: Settings },
];

const customerLinks = [
  { title: 'My Dashboard', href: '/customer', icon: LayoutDashboard },
  { title: 'My Meters', href: '/meters', icon: Activity },
  { title: 'Alerts', href: '/alerts', icon: AlertTriangle },
  { title: 'Usage Reports', href: '/reports', icon: FileText },
  { title: 'My Bills', href: '/billing', icon: CreditCard },
  { title: 'Customer Care', href: '/support', icon: Headset },
  { title: 'Service Status', href: '/outages', icon: WifiOff },
  { title: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();
  
  const links = role === 'admin' ? adminLinks : customerLinks;

  if (!role) return null;

  return (
    <aside className="fixed inset-y-0 left-0 z-20 w-64 border-r border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 flex flex-col transition-all duration-300">
      <div className="flex h-16 items-center px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Droplets className="h-5 w-5 text-white" />
          </div>
          Aqua<span className="text-blue-600">Sense</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="space-y-1">
          <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {role === 'admin' ? 'Admin Operations' : 'Customer Portal'}
          </p>
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors relative group",
                  isActive 
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
                )}
                <link.icon className={cn("h-4 w-4", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300")} />
                {link.title}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">System Status</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">All Systems Operational</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
