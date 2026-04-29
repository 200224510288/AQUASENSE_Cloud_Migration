"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/store/useAuth';
import { User, Role } from '@/types';
import { Droplets, Shield, User as UserIcon, Mail, Lock, ArrowRight, Building2 } from 'lucide-react';

function extractDomain(email: string): string {
  const parts = email.split('@');
  return parts.length === 2 ? parts[1] : '';
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const domain = extractDomain(email);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const role: Role = domain === 'aquasense.io' ? 'admin' : 'customer';
    
    let mockUser: User;
    if (role === 'admin') {
      mockUser = { id: 'ADM-001', name: 'System Administrator', email, role: 'admin' };
    } else {
      mockUser = { id: 'CUST-001', name: 'Acme Corp Factory', email, role: 'customer' };
    }

    login(mockUser);
    
    if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/customer');
    }
  };

  const handleDemoLogin = async (role: Role) => {
    setIsLoading(true);
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
          <CardHeader className="space-y-1 pb-4 text-center">
            <CardTitle className="text-2xl font-semibold tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-slate-500">
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
              
              {domain && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Signing in to <span className="font-medium">{domain}</span>
                  </span>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign in <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/80 dark:bg-slate-800/80 px-2 text-slate-500 backdrop-blur-xl">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                onClick={() => handleDemoLogin('customer')}
                disabled={isLoading}
              >
                <UserIcon className="h-5 w-5" />
                <span>Customer</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-2 hover:border-slate-800 hover:text-slate-900 hover:bg-slate-100 dark:hover:border-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700 transition-all"
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
              >
                <Shield className="h-5 w-5" />
                <span>Admin</span>
              </Button>
            </div>
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
