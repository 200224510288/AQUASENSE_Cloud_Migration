import { Customer, Meter, Alert, Outage, Bill, SupportTicket, Telemetry } from '@/types';
import { mockCustomers, mockMeters, mockBaseTelemetry, mockAlerts, mockOutages, mockBills, mockTickets } from '../mock-data/seed';

// Utility for simulating network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // === Customers ===
  customers: {
    getAll: async (): Promise<Customer[]> => {
      await delay(500);
      return [...mockCustomers];
    },
    getById: async (id: string): Promise<Customer | undefined> => {
      await delay(300);
      return mockCustomers.find(c => c.id === id);
    }
  },

  // === Meters ===
  meters: {
    getAll: async (): Promise<Meter[]> => {
      await delay(600);
      return [...mockMeters];
    },
    getByCustomer: async (customerId: string): Promise<Meter[]> => {
      await delay(400);
      return mockMeters.filter(m => m.customerId === customerId);
    },
    getById: async (id: string): Promise<Meter | undefined> => {
      await delay(300);
      return mockMeters.find(m => m.id === id);
    }
  },

  // === Telemetry (Dynamic) ===
  telemetry: {
    getLatestForMeter: async (meterId: string): Promise<Telemetry | undefined> => {
      await delay(200);
      const base = mockBaseTelemetry.find(t => t.meterId === meterId);
      if (!base) return undefined;
      
      // Simulate live variation
      const jitter = (val: number, percent: number) => {
        const variation = val * (percent / 100);
        return val + (Math.random() * variation * 2 - variation);
      };

      return {
        ...base,
        timestamp: new Date().toISOString(),
        waterUsageLitres: Math.max(0, Math.round(jitter(base.waterUsageLitres, 5))),
        pressureKPa: Math.max(0, Math.round(jitter(base.pressureKPa, 2))),
        energyKWh: Math.max(0, Math.round(jitter(base.energyKWh, 3))),
      };
    },
    getHistoryForMeter: async (meterId: string, hours: number = 24): Promise<Telemetry[]> => {
      await delay(500);
      const base = mockBaseTelemetry.find(t => t.meterId === meterId);
      if (!base) return [];

      const history: Telemetry[] = [];
      const now = Date.now();
      
      for (let i = hours; i >= 0; i--) {
        history.push({
          ...base,
          timestamp: new Date(now - i * 3600000).toISOString(),
          waterUsageLitres: Math.max(0, Math.round(base.waterUsageLitres * (0.8 + Math.random() * 0.4))),
          pressureKPa: Math.max(0, Math.round(base.pressureKPa * (0.95 + Math.random() * 0.1))),
          energyKWh: Math.max(0, Math.round(base.energyKWh * (0.8 + Math.random() * 0.4))),
        });
      }
      return history;
    }
  },

  // === Alerts ===
  alerts: {
    getAll: async (): Promise<Alert[]> => {
      await delay(400);
      return [...mockAlerts];
    },
    getByCustomer: async (customerId: string): Promise<Alert[]> => {
      await delay(300);
      const customerMeterIds = mockMeters.filter(m => m.customerId === customerId).map(m => m.id);
      return mockAlerts.filter(a => customerMeterIds.includes(a.meterId));
    }
  },

  // === Outages ===
  outages: {
    getAll: async (): Promise<Outage[]> => {
      await delay(400);
      return [...mockOutages];
    }
  },

  // === Billing ===
  billing: {
    getByCustomer: async (customerId: string): Promise<Bill[]> => {
      await delay(500);
      return mockBills.filter(b => b.customerId === customerId);
    },
    getAll: async (): Promise<Bill[]> => {
      await delay(500);
      return [...mockBills];
    }
  },

  // === Support ===
  support: {
    getByCustomer: async (customerId: string): Promise<SupportTicket[]> => {
      await delay(300);
      return mockTickets.filter(t => t.customerId === customerId);
    },
    getAll: async (): Promise<SupportTicket[]> => {
      await delay(500);
      return [...mockTickets];
    }
  }
};
