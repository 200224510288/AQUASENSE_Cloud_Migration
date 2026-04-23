import { Customer, Meter, Alert, Outage, Bill, SupportTicket, Telemetry } from '@/types';

export const mockCustomers: Customer[] = [
  { id: 'CUST-001', name: 'Acme Corp Factory', email: 'billing@acmecorp.com', status: 'active', address: '100 Industrial Way, Sector 4', joinedDate: '2023-01-15' },
  { id: 'CUST-002', name: 'John Doe Residence', email: 'johndoe@email.com', status: 'active', address: '42 Maple Street, Suburbia', joinedDate: '2024-05-10' },
  { id: 'CUST-003', name: 'City Mall Plaza', email: 'admin@citymall.com', status: 'active', address: '1 Downtown Blvd', joinedDate: '2022-11-01' },
];

export const mockMeters: Meter[] = [
  { id: 'MTR-1001', customerId: 'CUST-001', siteId: 'SITE-A1', location: 'Main Valve Room', type: 'industrial', status: 'online', lastUpdated: new Date().toISOString() },
  { id: 'MTR-1002', customerId: 'CUST-001', siteId: 'SITE-A2', location: 'Cooling Tower Intake', type: 'industrial', status: 'maintenance', lastUpdated: new Date().toISOString() },
  { id: 'MTR-2001', customerId: 'CUST-002', siteId: 'SITE-B1', location: 'Front Yard', type: 'residential', status: 'online', lastUpdated: new Date().toISOString() },
  { id: 'MTR-3001', customerId: 'CUST-003', siteId: 'SITE-C1', location: 'North Wing Basement', type: 'commercial', status: 'online', lastUpdated: new Date().toISOString() },
  { id: 'MTR-3002', customerId: 'CUST-003', siteId: 'SITE-C2', location: 'Food Court Supply', type: 'commercial', status: 'offline', lastUpdated: new Date().toISOString() },
];

export const mockBaseTelemetry: Telemetry[] = [
  { meterId: 'MTR-1001', timestamp: new Date().toISOString(), waterUsageLitres: 45000, pressureKPa: 420, energyKWh: 120, leakageRisk: 'low' },
  { meterId: 'MTR-1002', timestamp: new Date().toISOString(), waterUsageLitres: 0, pressureKPa: 0, energyKWh: 0, leakageRisk: 'low' },
  { meterId: 'MTR-2001', timestamp: new Date().toISOString(), waterUsageLitres: 450, pressureKPa: 300, energyKWh: 12, leakageRisk: 'low' },
  { meterId: 'MTR-3001', timestamp: new Date().toISOString(), waterUsageLitres: 12500, pressureKPa: 380, energyKWh: 45, leakageRisk: 'medium' },
  { meterId: 'MTR-3002', timestamp: new Date().toISOString(), waterUsageLitres: 0, pressureKPa: 0, energyKWh: 0, leakageRisk: 'high' },
];

export const mockAlerts: Alert[] = [
  { id: 'ALT-901', meterId: 'MTR-3001', type: 'leak_detected', severity: 'warning', status: 'active', timestamp: new Date(Date.now() - 3600000).toISOString(), message: 'Unusual usage pattern detected during off-hours.' },
  { id: 'ALT-902', meterId: 'MTR-3002', type: 'offline', severity: 'critical', status: 'active', timestamp: new Date(Date.now() - 86400000).toISOString(), message: 'Meter lost connection to the network.' },
  { id: 'ALT-903', meterId: 'MTR-1002', type: 'pressure_drop', severity: 'info', status: 'resolved', timestamp: new Date(Date.now() - 172800000).toISOString(), message: 'Pressure dropped below threshold. Scheduled maintenance.' },
];

export const mockOutages: Outage[] = [
  { id: 'OUT-001', region: 'Sector 4 Industrial', status: 'repairing', affectedCustomers: 42, estimatedResolution: new Date(Date.now() + 14400000).toISOString(), severity: 'high' },
];

export const mockBills: Bill[] = [
  { id: 'INV-101', customerId: 'CUST-001', amount: 4500.50, status: 'paid', dueDate: '2026-03-15', periodStart: '2026-02-01', periodEnd: '2026-02-28' },
  { id: 'INV-102', customerId: 'CUST-001', amount: 4200.75, status: 'pending', dueDate: '2026-04-15', periodStart: '2026-03-01', periodEnd: '2026-03-31' },
  { id: 'INV-201', customerId: 'CUST-002', amount: 85.20, status: 'overdue', dueDate: '2026-04-01', periodStart: '2026-02-15', periodEnd: '2026-03-15' },
];

export const mockTickets: SupportTicket[] = [
  { id: 'TCK-501', customerId: 'CUST-002', subject: 'Billing discrepancy for March', status: 'open', priority: 'medium', createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: 'TCK-502', customerId: 'CUST-003', subject: 'Requesting calibration for Food Court meter', status: 'in_progress', priority: 'high', createdAt: new Date(Date.now() - 86400000).toISOString() },
];
