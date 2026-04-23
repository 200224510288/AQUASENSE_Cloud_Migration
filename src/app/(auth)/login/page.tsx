"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/store/useAuth';
import { User, Role } from '@/types';
import { Droplets, Shield, User as UserIcon } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState<Role | null>(null);

  const handleLogin = async (role: Role) => {
    setIsLoading(role);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let mockUser: User;
    if (role === 'admin') {
      mockUser = { id: 'ADM-001', name: 'System Administrator', email: 'admin@aquasense.io', role: 'admin' };
    } else {
      mockUser = { id: 'CUST-001', name: 'Acme Corp Factory', email: 'billing@acmecorp.com', role: 'customer' };
    }

    login(mockUser);
    
    if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/customer');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 -right-40 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-40 left-20 w-96 h-96 bg-slate-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="z-10 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Droplets className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Aqua<span className="text-blue-600">Sense</span>
            </span>
          </div>
        </div>

        <Card className="border-0 shadow-2xl shadow-blue-900/5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-6 text-center">
            <CardTitle className="text-2xl font-semibold tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-slate-500">
              Select your role to access the portal
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                onClick={() => handleLogin('customer')}
                disabled={isLoading !== null}
              >
                {isLoading === 'customer' ? (
                  <div className="h-6 w-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <UserIcon className="h-6 w-6" />
                )}
                <span>Customer Portal</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center gap-2 hover:border-slate-800 hover:text-slate-900 hover:bg-slate-100 dark:hover:border-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700 transition-all"
                onClick={() => handleLogin('admin')}
                disabled={isLoading !== null}
              >
                {isLoading === 'admin' ? (
                  <div className="h-6 w-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Shield className="h-6 w-6" />
                )}
                <span>Admin Portal</span>
              </Button>
            </div>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/80 dark:bg-slate-800/80 px-2 text-slate-500 backdrop-blur-xl">
                  Enterprise SSO
                </span>
              </div>
            </div>
            <Button variant="secondary" className="w-full" disabled={isLoading !== null}>
              Sign in with SAML/SSO
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 mt-2">
            <div className="text-sm text-center text-slate-500">
              Need help signing in? <a href="#" className="text-blue-600 hover:underline">Contact IT Support</a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
