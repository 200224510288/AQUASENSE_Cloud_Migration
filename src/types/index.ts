export type Role = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  address: string;
  joinedDate: string;
}

export interface Meter {
  id: string;
  customerId: string;
  siteId: string;
  location: string;
  type: 'residential' | 'commercial' | 'industrial';
  status: 'online' | 'offline' | 'maintenance';
  lastUpdated: string;
}

export interface Telemetry {
  meterId: string;
  timestamp: string;
  waterUsageLitres: number;
  pressureKPa: number;
  energyKWh: number;
  leakageRisk: 'low' | 'medium' | 'high';
}

export interface Alert {
  id: string;
  meterId: string;
  type: 'leak_detected' | 'pressure_drop' | 'offline' | 'high_usage';
  severity: 'critical' | 'warning' | 'info';
  status: 'active' | 'resolved';
  timestamp: string;
  message: string;
}

export interface Outage {
  id: string;
  region: string;
  status: 'investigating' | 'repairing' | 'resolved';
  affectedCustomers: number;
  estimatedResolution: string;
  severity: 'high' | 'medium' | 'low';
}

export interface Bill {
  id: string;
  customerId: string;
  amount: number;
  status: 'paid' | 'overdue' | 'pending';
  dueDate: string;
  periodStart: string;
  periodEnd: string;
}

export interface SupportTicket {
  id: string;
  customerId: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}
