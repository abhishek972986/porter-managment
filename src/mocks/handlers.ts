// @ts-nocheck
import { http, HttpResponse } from 'msw';
import type { AttendanceEntry, Porter, Location, Carrier, CommuteCost, Template, DashboardStats, MonthlyReport } from '@/types';

// Mock Data
let porters: Porter[] = [
  { id: '1', name: 'John Doe', phone: '+1234567890', email: 'john@example.com', status: 'active', createdAt: '2024-01-01' },
  { id: '2', name: 'Jane Smith', phone: '+1234567891', email: 'jane@example.com', status: 'active', createdAt: '2024-01-02' },
  { id: '3', name: 'Bob Johnson', phone: '+1234567892', email: 'bob@example.com', status: 'active', createdAt: '2024-01-03' },
  { id: '4', name: 'Alice Brown', phone: '+1234567893', email: 'alice@example.com', status: 'active', createdAt: '2024-01-04' },
];

let locations: Location[] = [
  { id: '1', name: 'Main Factory', address: '123 Factory St', type: 'factory' },
  { id: '2', name: 'Warehouse A', address: '456 Warehouse Ave', type: 'warehouse' },
  { id: '3', name: 'Construction Site B', address: '789 Site Rd', type: 'site' },
  { id: '4', name: 'Storage Depot', address: '321 Depot Ln', type: 'warehouse' },
];

const carriers: Carrier[] = [
  { id: '1', type: 'porter', displayName: 'Porter', description: 'Human porter carrying items' },
  { id: '2', type: 'small_donkey', displayName: 'Small Donkey', description: 'Small donkey cart' },
  { id: '3', type: 'pickup_truck', displayName: 'Pickup Truck', description: 'Small pickup truck' },
];

let commuteCosts: CommuteCost[] = [
  { id: '1', fromLocationId: '1', toLocationId: '2', carrierType: 'porter', cost: 25, distance: 2 },
  { id: '2', fromLocationId: '1', toLocationId: '2', carrierType: 'small_donkey', cost: 40, distance: 2 },
  { id: '3', fromLocationId: '1', toLocationId: '2', carrierType: 'pickup_truck', cost: 60, distance: 2 },
  { id: '4', fromLocationId: '1', toLocationId: '3', carrierType: 'porter', cost: 35, distance: 3 },
  { id: '5', fromLocationId: '1', toLocationId: '3', carrierType: 'small_donkey', cost: 55, distance: 3 },
  { id: '6', fromLocationId: '1', toLocationId: '3', carrierType: 'pickup_truck', cost: 80, distance: 3 },
  { id: '7', fromLocationId: '1', toLocationId: '4', carrierType: 'porter', cost: 30, distance: 2.5 },
  { id: '8', fromLocationId: '1', toLocationId: '4', carrierType: 'small_donkey', cost: 45, distance: 2.5 },
  { id: '9', fromLocationId: '1', toLocationId: '4', carrierType: 'pickup_truck', cost: 70, distance: 2.5 },
];

let attendanceEntries: AttendanceEntry[] = [
  {
    id: '1',
    porterId: '1',
    porterName: 'John Doe',
    carrier: 'porter',
    date: '2025-11-17',
    locationFrom: '1',
    locationTo: '2',
    task: 'Delivered construction materials',
    cost: 25,
    createdAt: '2025-11-17T08:00:00Z',
  },
  {
    id: '2',
    porterId: '2',
    porterName: 'Jane Smith',
    carrier: 'small_donkey',
    date: '2025-11-17',
    locationFrom: '1',
    locationTo: '3',
    task: 'Transported tools and equipment',
    cost: 55,
    createdAt: '2025-11-17T09:00:00Z',
  },
  {
    id: '3',
    porterId: '1',
    porterName: 'John Doe',
    carrier: 'porter',
    date: '2025-11-16',
    locationFrom: '1',
    locationTo: '2',
    task: 'Moved boxes',
    cost: 25,
    createdAt: '2025-11-16T10:00:00Z',
  },
];

let templates: Template[] = [
  {
    id: '1',
    name: 'Monthly Salary Report',
    description: 'Template for monthly salary calculations',
    content: '<h1>{{month}} Salary Report</h1><p>Porter: {{porter_name}}</p><p>Total: {{total_cost}}</p>',
    placeholders: ['month', 'porter_name', 'total_cost'],
    type: 'html',
    createdAt: '2024-01-01',
  },
];

export const handlers = [
  // Auth
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    if (body.email && body.password) {
      return HttpResponse.json({ token: 'mock-jwt-token', user: { id: '1', name: 'Admin', email: body.email } });
    }
    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),

  // Dashboard
  http.get('/api/dashboard/stats', () => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = attendanceEntries.filter(e => e.date === today);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthEntries = attendanceEntries.filter(e => e.date.startsWith(thisMonth));
    
    const stats: DashboardStats = {
      totalCommutesToday: todayEntries.length,
      totalCostThisMonth: monthEntries.reduce((sum, e) => sum + e.cost, 0),
      pendingDocuments: 3,
      activePorters: porters.filter(p => p.status === 'active').length,
    };
    return HttpResponse.json(stats);
  }),

  // Attendance
  http.get('/api/attendance', ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const month = url.searchParams.get('month');
    
    let filtered = attendanceEntries;
    if (date) {
      filtered = attendanceEntries.filter(e => e.date === date);
    } else if (month) {
      filtered = attendanceEntries.filter(e => e.date.startsWith(month));
    }
    return HttpResponse.json(filtered);
  }),

  http.post('/api/attendance', async ({ request }) => {
    const body = await request.json() as Omit<AttendanceEntry, 'id' | 'createdAt' | 'porterName' | 'cost'>;
    const porter = porters.find(p => p.id === body.porterId);
    const costData = commuteCosts.find(
      c => c.fromLocationId === body.locationFrom && 
           c.toLocationId === body.locationTo && 
           c.carrierType === body.carrier
    );
    
    const newEntry: AttendanceEntry = {
      ...body,
      id: String(Date.now()),
      porterName: porter?.name || 'Unknown',
      cost: costData?.cost || 0,
      createdAt: new Date().toISOString(),
    };
    attendanceEntries.push(newEntry);
    return HttpResponse.json(newEntry);
  }),

  http.delete('/api/attendance/:id', ({ params }) => {
    const { id } = params;
    attendanceEntries = attendanceEntries.filter(e => e.id !== id);
    return HttpResponse.json({ success: true });
  }),

  // Porters
  http.get('/api/porters', () => {
    return HttpResponse.json(porters);
  }),

  http.get('/api/porters/:id', ({ params }) => {
    const porter = porters.find(p => p.id === params.id);
    return porter ? HttpResponse.json(porter) : HttpResponse.json({ error: 'Not found' }, { status: 404 });
  }),

  http.post('/api/porters', async ({ request }) => {
    const body = await request.json() as Omit<Porter, 'id' | 'createdAt'>;
    const newPorter: Porter = {
      ...body,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
    };
    porters.push(newPorter);
    return HttpResponse.json(newPorter);
  }),

  http.put('/api/porters/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<Porter>;
    const index = porters.findIndex(p => p.id === params.id);
    if (index !== -1) {
      porters[index] = { ...porters[index], ...body };
      return HttpResponse.json(porters[index]);
    }
    return HttpResponse.json({ error: 'Not found' }, { status: 404 });
  }),

  http.delete('/api/porters/:id', ({ params }) => {
    porters = porters.filter(p => p.id !== params.id);
    return HttpResponse.json({ success: true });
  }),

  // Locations
  http.get('/api/locations', () => {
    return HttpResponse.json(locations);
  }),

  http.post('/api/locations', async ({ request }) => {
    const body = await request.json() as Omit<Location, 'id'>;
    const newLocation: Location = {
      ...body,
      id: String(Date.now()),
    };
    locations.push(newLocation);
    return HttpResponse.json(newLocation);
  }),

  http.put('/api/locations/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<Location>;
    const index = locations.findIndex(l => l.id === params.id);
    if (index !== -1) {
      locations[index] = { ...locations[index], ...body };
      return HttpResponse.json(locations[index]);
    }
    return HttpResponse.json({ error: 'Not found' }, { status: 404 });
  }),

  http.delete('/api/locations/:id', ({ params }) => {
    locations = locations.filter(l => l.id !== params.id);
    return HttpResponse.json({ success: true });
  }),

  // Carriers
  http.get('/api/carriers', () => {
    return HttpResponse.json(carriers);
  }),

  // Commute Costs
  http.get('/api/commute-costs', () => {
    return HttpResponse.json(commuteCosts);
  }),

  http.get('/api/commute-costs/calculate', ({ request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const carrier = url.searchParams.get('carrier');
    
    const cost = commuteCosts.find(
      c => c.fromLocationId === from && c.toLocationId === to && c.carrierType === carrier
    );
    return HttpResponse.json({ cost: cost?.cost || 0 });
  }),

  http.post('/api/commute-costs', async ({ request }) => {
    const body = await request.json() as Omit<CommuteCost, 'id'>;
    const newCost: CommuteCost = {
      ...body,
      id: String(Date.now()),
    };
    commuteCosts.push(newCost);
    return HttpResponse.json(newCost);
  }),

  http.put('/api/commute-costs/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<CommuteCost>;
    const index = commuteCosts.findIndex(c => c.id === params.id);
    if (index !== -1) {
      commuteCosts[index] = { ...commuteCosts[index], ...body };
      return HttpResponse.json(commuteCosts[index]);
    }
    return HttpResponse.json({ error: 'Not found' }, { status: 404 });
  }),

  http.delete('/api/commute-costs/:id', ({ params }) => {
    commuteCosts = commuteCosts.filter(c => c.id !== params.id);
    return HttpResponse.json({ success: true });
  }),

  // Templates
  http.get('/api/templates', () => {
    return HttpResponse.json(templates);
  }),

  // Reports
  http.get('/api/reports/monthly-salaries', ({ request }) => {
    const url = new URL(request.url);
    const month = url.searchParams.get('month') || new Date().toISOString().slice(0, 7);
    
    const monthEntries = attendanceEntries.filter(e => e.date.startsWith(month));
    const reportMap = new Map<string, MonthlyReport>();
    
    monthEntries.forEach(entry => {
      if (!reportMap.has(entry.porterId)) {
        reportMap.set(entry.porterId, {
          porterId: entry.porterId,
          porterName: entry.porterName,
          totalCommutes: 0,
          totalCost: 0,
          month,
        });
      }
      const report = reportMap.get(entry.porterId)!;
      report.totalCommutes++;
      report.totalCost += entry.cost;
    });
    
    return HttpResponse.json(Array.from(reportMap.values()));
  }),

  http.get('/api/reports/export-csv', () => {
    return HttpResponse.text('Porter,Commutes,Cost\nJohn Doe,10,250\nJane Smith,8,200', {
      headers: { 'Content-Type': 'text/csv' },
    });
  }),

  http.get('/api/reports/export-pdf', () => {
    return HttpResponse.arrayBuffer(new ArrayBuffer(8), {
      headers: { 'Content-Type': 'application/pdf' },
    });
  }),
];

