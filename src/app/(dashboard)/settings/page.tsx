"use client";

import { useAuth } from '@/lib/store/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Bell, Shield, Key } from 'lucide-react';

export default function SettingsPage() {
  const { user, role } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage your account preferences and system configurations.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 shrink-0">
          <Tabs defaultValue="profile" orientation="vertical" className="w-full flex flex-col md:flex-row gap-6">
            <TabsList className="flex flex-col w-full h-auto bg-transparent space-y-1 items-stretch p-0">
              <TabsTrigger value="profile" className="justify-start px-4 py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400">
                <User className="mr-2 h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="justify-start px-4 py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="justify-start px-4 py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400">
                <Shield className="mr-2 h-4 w-4" />
                Security
              </TabsTrigger>
              {role === 'admin' && (
                <TabsTrigger value="api" className="justify-start px-4 py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400">
                  <Key className="mr-2 h-4 w-4" />
                  API Keys
                </TabsTrigger>
              )}
            </TabsList>
            
            <div className="flex-1 w-full">
              <TabsContent value="profile" className="mt-0">
                <Card className="border-slate-200 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your account details.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name / Organization</Label>
                      <Input id="name" defaultValue={user.name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" defaultValue={user.email} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Account Role</Label>
                      <Input id="role" value={role?.toUpperCase()} disabled className="bg-slate-50 dark:bg-slate-900" />
                    </div>
                    <div className="pt-4 flex justify-end">
                      <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="mt-0">
                <Card className="border-slate-200 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Choose what alerts you want to receive.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Critical Alerts</Label>
                        <p className="text-sm text-slate-500">Receive immediate notifications for critical system issues.</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Mock Switch */}
                        <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Billing Reminders</Label>
                        <p className="text-sm text-slate-500">Receive emails before invoices are due.</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Weekly Reports</Label>
                        <p className="text-sm text-slate-500">Receive a weekly summary of your usage.</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-pointer">
                          <div className="w-4 h-4 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="mt-0">
                <Card className="border-slate-200 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage your password and security options.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current">Current Password</Label>
                      <Input id="current" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new">New Password</Label>
                      <Input id="new" type="password" />
                    </div>
                    <div className="pt-4 flex justify-end">
                      <Button className="bg-blue-600 hover:bg-blue-700">Update Password</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {role === 'admin' && (
                <TabsContent value="api" className="mt-0">
                  <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader>
                      <CardTitle>API Access</CardTitle>
                      <CardDescription>Manage keys for external integrations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <div>
                          <p className="font-medium">Production API Key</p>
                          <p className="text-xs text-slate-500 font-mono mt-1">aq_prod_************************</p>
                        </div>
                        <Button variant="outline" size="sm">Reveal</Button>
                      </div>
                      <div className="pt-2">
                        <Button variant="outline" className="w-full">Generate New Key</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
