export type CarrierType = 'porter' | 'small_donkey' | 'pickup_truck';

export interface Porter {
  id: string;
  uid: string;
  name: string;
  designation?: string;
  active: boolean;
  createdAt?: string;
}

export interface Location {
  id: string;
  code: string;
  name: string;
  active?: boolean;
}

export interface Carrier {
  id: string;
  name: 'porter' | 'small-donkey' | 'pickup-truck';
  capacityKg: number;
  active?: boolean;
}

export interface CommuteCost {
  id: string;
  fromLocation: string;
  toLocation: string;
  carrier: string;
  cost: number;
  active?: boolean;
}

export interface AttendanceEntry {
  id: string;
  porter: string;
  carrier: string;
  date: string;
  locationFrom: string;
  locationTo: string;
  task: string;
  computedCost: number;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  placeholders: string[];
  type: 'docx' | 'html';
  createdAt: string;
}

export interface DashboardStats {
  totalCommutesToday: number;
  totalCostThisMonth: number;
  pendingDocuments: number;
  activePorters: number;
}

export interface MonthlyReport {
  porterId: string;
  porterName: string;
  totalCommutes: number;
  totalCost: number;
  month: string;
}

