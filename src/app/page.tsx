"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store/useAuth';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (role === 'admin') {
      router.replace('/admin');
    } else if (role === 'customer') {
      router.replace('/customer');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, role, router]);

  return (
    <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-blue-600 rounded-full mb-4"></div>
        <div className="text-slate-500 font-medium">Loading AquaSense Platform...</div>
      </div>
    </div>
  );
}
