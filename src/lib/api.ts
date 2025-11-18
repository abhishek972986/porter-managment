import type {
  AttendanceEntry,
  Porter,
  Location,
  Carrier,
  CommuteCost,
  Template,
  DashboardStats,
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
    return apiRequest<DashboardStats>('/reports/dashboard');
  },
};

// Attendance
export const attendanceAPI = {
  getAll: async (month?: string): Promise<AttendanceEntry[]> => {
    const url = month ? `/attendance?month=${month}` : '/attendance';
    const response = await apiRequest<{ attendance: AttendanceEntry[] }>(url);
    return response.attendance;
  },
  getByDate: async (date: string): Promise<AttendanceEntry[]> => {
    const response = await apiRequest<{ attendance: AttendanceEntry[] }>(`/attendance?date=${date}`);
    return response.attendance;
  },
  create: async (
    data: Omit<AttendanceEntry, 'id' | 'createdAt' | 'computedCost'>
  ): Promise<AttendanceEntry> => {
    const response = await apiRequest<{ attendance: AttendanceEntry }>('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.attendance;
  },
  update: async (id: string, data: Partial<AttendanceEntry>): Promise<AttendanceEntry> => {
    const response = await apiRequest<{ attendance: AttendanceEntry }>(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.attendance;
  },
  delete: async (id: string): Promise<void> => {
    await apiRequest<void>(`/attendance/${id}`, { method: 'DELETE' });
  },
};

// Porters
export const portersAPI = {
  getAll: async (
    params?: { search?: string; field?: 'name' | 'uid' | 'designation'; active?: boolean }
  ): Promise<Porter[]> => {
    const qs: string[] = [];
    if (params?.search) qs.push(`search=${encodeURIComponent(params.search)}`);
    if (params?.field) qs.push(`field=${encodeURIComponent(params.field)}`);
    if (typeof params?.active === 'boolean') qs.push(`active=${params.active}`);
    const url = `/porters${qs.length ? `?${qs.join('&')}` : ''}`;
    const response = await apiRequest<{ porters: Porter[] }>(url);
    return response.porters;
  },
  getById: async (id: string): Promise<Porter> => {
    const response = await apiRequest<{ porter: Porter }>(`/porters/${id}`);
    return response.porter;
  },
  create: async (data: Omit<Porter, 'id' | 'createdAt'>): Promise<Porter> => {
    const response = await apiRequest<{ porter: Porter }>('/porters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.porter;
  },
  update: async (id: string, data: Partial<Porter>): Promise<Porter> => {
    const response = await apiRequest<{ porter: Porter }>(`/porters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.porter;
  },
  delete: async (id: string): Promise<void> => {
    await apiRequest<void>(`/porters/${id}`, { method: 'DELETE' });
  },
};

// Locations
export const locationsAPI = {
  getAll: async (): Promise<Location[]> => {
    const response = await apiRequest<{ locations: Location[] }>('/locations');
    return response.locations;
  },
  create: async (data: Omit<Location, 'id'>): Promise<Location> => {
    const response = await apiRequest<{ location: Location }>('/locations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.location;
  },
  update: async (id: string, data: Partial<Location>): Promise<Location> => {
    const response = await apiRequest<{ location: Location }>(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.location;
  },
  delete: async (id: string): Promise<void> => {
    await apiRequest<void>(`/locations/${id}`, { method: 'DELETE' });
  },
};

// Carriers
export const carriersAPI = {
  getAll: async (): Promise<Carrier[]> => {
    const response = await apiRequest<{ carriers: Carrier[] }>('/carriers');
    return response.carriers;
  },
  create: async (data: Omit<Carrier, 'id'>): Promise<Carrier> => {
    const response = await apiRequest<{ carrier: Carrier }>('/carriers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.carrier;
  },
  update: async (id: string, data: Partial<Carrier>): Promise<Carrier> => {
    const response = await apiRequest<{ carrier: Carrier }>(`/carriers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.carrier;
  },
  delete: async (id: string): Promise<void> => {
    await apiRequest<void>(`/carriers/${id}`, { method: 'DELETE' });
  },
};

// Commute Costs
export const commuteCostsAPI = {
  getAll: async (): Promise<CommuteCost[]> => {
    const response = await apiRequest<{ commuteCosts: CommuteCost[] }>('/commute-costs');
    return response.commuteCosts;
  },
  findCost: async (
    fromLocationId: string,
    toLocationId: string,
    carrierId: string
  ): Promise<{ cost: number }> => {
    const response = await apiRequest<{ commuteCost: { cost: number } | null }>(
      `/commute-costs/find?fromLocationId=${fromLocationId}&toLocationId=${toLocationId}&carrierId=${carrierId}`
    );
    return { cost: response.commuteCost?.cost ?? 0 };
  },
  create: async (data: Omit<CommuteCost, 'id'>): Promise<CommuteCost> => {
    const response = await apiRequest<{ commuteCost: CommuteCost }>('/commute-costs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.commuteCost;
  },
  update: async (id: string, data: Partial<CommuteCost>): Promise<CommuteCost> => {
    const response = await apiRequest<{ commuteCost: CommuteCost }>(`/commute-costs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.commuteCost;
  },
  delete: async (id: string): Promise<void> => {
    await apiRequest<void>(`/commute-costs/${id}`, { method: 'DELETE' });
  },
};

// Templates
export const templatesAPI = {
  getAll: async (): Promise<Template[]> => {
    return apiRequest<Template[]>('/templates');
  },
  upload: async (file: File): Promise<Template> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest<Template>('/templates', {
      method: 'POST',
      body: formData,
    });
  },
};

// Reports
export const reportsAPI = {
  getMonthlyReport: async (month: string) => {
    return apiRequest<{
      summary: {
        month: string;
        monthName: string;
        totalPorters: number;
        totalPayroll: number;
        totalTrips: number;
        generatedAt: string;
      };
      porters: Array<{
        _id: string;
        porterUid: string;
        porterName: string;
        designation: string;
        totalSalary: number;
        totalTrips: number;
        trips: Array<{
          date: string;
          carrier: string;
          from: string;
          to: string;
          task?: string;
          cost: number;
        }>;
      }>;
      statistics: {
        carriers: Array<{
          _id: string;
          carrierName: string;
          count: number;
          totalCost: number;
        }>;
        topFromLocations: Array<{
          _id: string;
          locationName: string;
          count: number;
        }>;
        topToLocations: Array<{
          _id: string;
          locationName: string;
          count: number;
        }>;
      };
    }>(`/reports/generate?month=${month}`);
  },
};

// Activities
export type Activity = {
  _id: string;
  type:
    | 'attendance_created'
    | 'attendance_updated'
    | 'attendance_deleted'
    | 'porter_created'
    | 'porter_updated'
    | 'porter_deleted'
    | 'location_created'
    | 'location_updated'
    | 'location_deleted'
    | 'carrier_created'
    | 'carrier_updated'
    | 'carrier_deleted'
    | 'commute_cost_created'
    | 'commute_cost_updated'
    | 'commute_cost_deleted'
    | 'user_login'
    | 'report_generated'
    | 'payroll_paid'
    | 'payroll_unpaid';
  description: string;
  user?: { name?: string; email?: string } | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export const activitiesAPI = {
  getAll: async (limit = 20): Promise<Activity[]> => {
    const response = await apiRequest<{ activities: Activity[] }>(`/activities?limit=${limit}`);
    return response.activities;
  },
};

// Payroll
export const payrollAPI = {
  getPorterPayroll: async (
    porterId: string,
    month: string
  ): Promise<{
    porter: { id: string; uid: string; name: string; designation?: string };
    month: string;
    totalSalary: number;
    totalTrips: number;
    trips: unknown[];
    payment: { isPaid: boolean; amount: number; paidAt: string | null; notes: string };
  }> => {
    return apiRequest(`/payroll/${porterId}?month=${month}`);
  },
  setPaymentStatus: async (
    porterId: string,
    payload: { month: string; isPaid: boolean; amount?: number; notes?: string }
  ): Promise<{ payment: { isPaid: boolean; amount: number; paidAt: string | null; notes: string } }> => {
    return apiRequest(`/payroll/${porterId}/payment`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};

