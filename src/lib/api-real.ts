import type {
  AttendanceEntry,
  Porter,
  Location,
  Carrier,
  CommuteCost,
  Template,
  DashboardStats,
  MonthlyReport,
  CarrierType,
} from '@/types';
import { apiRequest, tokenManager } from './api-client';

// Auth
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    
    if (data.success) {
      tokenManager.setTokens(data.data.accessToken, data.data.refreshToken);
      return data.data;
    }
    throw new Error(data.message || 'Login failed');
  },
  
  logout: async () => {
    await apiRequest('/auth/logout', { method: 'POST' });
    tokenManager.clearTokens();
  },
};

// Dashboard
export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    const response: any = await apiRequest('/reports/dashboard');
    // Transform backend response to match frontend interface
    return {
      totalEntries: response.currentMonth?.totalEntries || 0,
      totalCost: response.currentMonth?.totalCost || 0,
      activePorters: response.currentMonth?.activePorters || 0,
      totalPorters: response.totalPorters || 0,
    };
  },
};

// Attendance
export const attendanceAPI = {
  getAll: async (month?: string): Promise<AttendanceEntry[]> => {
    const url = month ? `/attendance?month=${month}&limit=1000` : '/attendance?limit=1000';
    const response: any = await apiRequest(url);
    return response.attendance || [];
  },
  
  getByDate: async (date: string): Promise<AttendanceEntry[]> => {
    const response: any = await apiRequest(`/attendance?startDate=${date}&endDate=${date}`);
    return response.attendance || [];
  },
  
  create: async (data: Omit<AttendanceEntry, 'id' | 'createdAt' | 'porterName' | 'cost'>): Promise<AttendanceEntry> => {
    const response: any = await apiRequest('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.attendance;
  },
  
  update: async (id: string, data: Partial<AttendanceEntry>): Promise<AttendanceEntry> => {
    const response: any = await apiRequest(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.attendance;
  },
  
  delete: async (id: string): Promise<void> => {
    await apiRequest(`/attendance/${id}`, { method: 'DELETE' });
  },
};

// Porters
export const portersAPI = {
  getAll: async (): Promise<Porter[]> => {
    const response: any = await apiRequest('/porters?limit=1000');
    return response.porters || [];
  },
  
  getById: async (id: string): Promise<Porter> => {
    const response: any = await apiRequest(`/porters/${id}`);
    return response.porter;
  },
  
  create: async (data: Omit<Porter, 'id' | 'createdAt'>): Promise<Porter> => {
    const response: any = await apiRequest('/porters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.porter;
  },
  
  update: async (id: string, data: Partial<Porter>): Promise<Porter> => {
    const response: any = await apiRequest(`/porters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.porter;
  },
  
  delete: async (id: string): Promise<void> => {
    await apiRequest(`/porters/${id}`, { method: 'DELETE' });
  },
};

// Locations
export const locationsAPI = {
  getAll: async (): Promise<Location[]> => {
    const response: any = await apiRequest('/locations');
    return response.locations || [];
  },
  
  create: async (data: Omit<Location, 'id'>): Promise<Location> => {
    const response: any = await apiRequest('/locations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.location;
  },
  
  update: async (id: string, data: Partial<Location>): Promise<Location> => {
    const response: any = await apiRequest(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.location;
  },
  
  delete: async (id: string): Promise<void> => {
    await apiRequest(`/locations/${id}`, { method: 'DELETE' });
  },
};

// Carriers
export const carriersAPI = {
  getAll: async (): Promise<Carrier[]> => {
    const response: any = await apiRequest('/carriers');
    return response.carriers || [];
  },
};

// Commute Costs
export const commuteCostsAPI = {
  getAll: async (): Promise<CommuteCost[]> => {
    const response: any = await apiRequest('/commute-costs?limit=1000');
    return response.commuteCosts || [];
  },
  
  getCost: async (fromLocationId: string, toLocationId: string, carrierId: string): Promise<{ cost: number }> => {
    const response: any = await apiRequest(
      `/commute-costs/find?fromLocationId=${fromLocationId}&toLocationId=${toLocationId}&carrierId=${carrierId}`
    );
    return { cost: response.commuteCost?.cost || 0 };
  },
  
  create: async (data: Omit<CommuteCost, 'id'>): Promise<CommuteCost> => {
    const response: any = await apiRequest('/commute-costs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.commuteCost;
  },
  
  update: async (id: string, data: Partial<CommuteCost>): Promise<CommuteCost> => {
    const response: any = await apiRequest(`/commute-costs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.commuteCost;
  },
  
  delete: async (id: string): Promise<void> => {
    await apiRequest(`/commute-costs/${id}`, { method: 'DELETE' });
  },
};

// Templates
export const templatesAPI = {
  getAll: async (): Promise<Template[]> => {
    // Templates API not yet implemented
    return [];
  },
  
  upload: async (file: File): Promise<Template> => {
    // Templates API not yet implemented
    return {} as Template;
  },
};

// Reports
export const reportsAPI = {
  getMonthlySalaries: async (month: string): Promise<MonthlyReport[]> => {
    const response: any = await apiRequest(`/payroll?month=${month}`);
    return response.payroll || [];
  },
  
  exportCSV: async (month: string): Promise<Blob> => {
    // Export functionality not yet implemented
    return new Blob([''], { type: 'text/csv' });
  },
  
  exportPDF: async (month: string): Promise<Blob> => {
    // Export functionality not yet implemented
    return new Blob([''], { type: 'application/pdf' });
  },
};

