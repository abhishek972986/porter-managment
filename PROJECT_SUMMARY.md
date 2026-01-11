# Porter Management System - Project Summary

## Overview
A full-stack web application for managing porter workforce, tracking daily attendance/trips, calculating salaries, and generating reports. Built for logistics/warehouse operations.

## Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB Atlas (online cloud database)
- **Authentication**: JWT with access & refresh tokens
- **Validation**: Zod schemas
- **Logging**: Winston logger with activity tracking
- **Scheduling**: Node-cron for automated tasks
- **Date Handling**: date-fns library (LOCAL timezone, not UTC)

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS with custom components
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Calendar**: react-big-calendar for attendance visualization
- **Routing**: React Router v6
- **Notifications**: Sonner toast notifications

### Deployment
- **Frontend**: Vercel (https://porter-managment-xbii.vercel.app)
- **Backend**: Render (https://porter-managment-1.onrender.com)
- **Database**: MongoDB Atlas (online, accessible from anywhere)

## Database Models

### 1. User (Admin Authentication)
```javascript
{
  email: String (unique),
  password: String (hashed with bcrypt),
  name: String,
  role: String (default: 'admin'),
  active: Boolean,
  lastLogin: Date
}
```

### 2. Porter (Workforce)
```javascript
{
  uid: String (unique, e.g., "P001"),
  name: String (indexed),
  designation: String (e.g., "Senior Porter", "Junior Porter"),
  active: Boolean,
  createdAt: Date
}
```

### 3. Location (Warehouses/Sites)
```javascript
{
  code: String (unique, indexed),
  name: String (indexed),
  active: Boolean
}
```

### 4. Carrier (Transport Types)
```javascript
{
  name: String ('porter', 'small-donkey', 'pickup-truck'),
  capacityKg: Number,
  active: Boolean
}
```

### 5. CommuteCost (Rate Card)
```javascript
{
  fromLocation: ObjectId (ref: Location),
  toLocation: ObjectId (ref: Location),
  carrier: ObjectId (ref: Carrier),
  cost: Number,
  active: Boolean
}
```

### 6. Attendance (Daily Trip Records)
```javascript
{
  porter: ObjectId (ref: Porter),
  date: Date (stored in LOCAL timezone - CRITICAL),
  carrier: ObjectId (ref: Carrier),
  locationFrom: ObjectId (ref: Location),
  locationTo: ObjectId (ref: Location),
  task: String (optional description),
  computedCost: Number (calculated from CommuteCost),
  createdAt: Date
}
```

### 7. Payment (Salary Tracking)
```javascript
{
  porter: ObjectId (ref: Porter),
  year: Number,
  month: Number,
  amount: Number (cumulative paid amount),
  paidAt: Date,
  // Unique index on (porter, year, month)
}
```

### 8. Activity (Audit Log)
```javascript
{
  action: String,
  entity: String,
  entityId: String,
  userId: ObjectId,
  userName: String,
  details: Object,
  timestamp: Date
}
```

## Key Features Implemented

### 1. Authentication & Authorization
- ✅ JWT-based login with access & refresh tokens
- ✅ Token auto-refresh mechanism
- ✅ Protected routes (frontend & backend)
- ✅ Admin user seeding script
- Default login: admin@porter.com / password123

### 2. Porter Management
- ✅ CRUD operations for porters
- ✅ Unique UID system (P001, P002, etc.)
- ✅ Designation tracking
- ✅ Active/Inactive status
- ✅ Search & filter by name, UID, designation
- ✅ Real-time typeahead search

### 3. Location Management
- ✅ CRUD for warehouse/site locations
- ✅ Unique location codes
- ✅ Active/Inactive management

### 4. Carrier Management
- ✅ Three carrier types: Porter, Small Donkey, Pickup Truck
- ✅ Capacity tracking (kg)
- ✅ Fixed carriers, cannot delete (can deactivate)

### 5. Commute Cost (Rate Card)
- ✅ CRUD for route-based pricing
- ✅ From Location → To Location → Carrier = Cost
- ✅ Search by locations or carrier
- ✅ Duplicate detection
- ✅ Auto-calculation of trip costs

### 6. Attendance/Trip Tracking
- ✅ Daily trip entry with auto-cost calculation
- ✅ Calendar view with visual indicators (blue dots for entries)
- ✅ Date filtering and search
- ✅ Edit/Delete trip entries
- ✅ **CRITICAL**: All dates stored in LOCAL timezone (not UTC)
- ✅ Date timezone bug fixed (entries no longer shift by one day)
- ✅ Validation: YYYY-MM-DD or ISO datetime formats

### 7. Payroll System
- ✅ Monthly salary calculation per porter
- ✅ Incremental payment tracking
- ✅ Display: Total Salary | Already Paid | Left to Pay
- ✅ Payment history by month/year
- ✅ Porter profile page with payment management
- ✅ Payment input with cumulative tracking
- ✅ Backend stores total paid amount, frontend adds new payments

### 8. Reports & Analytics
- ✅ Monthly comprehensive reports with MongoDB aggregation
- ✅ Summary statistics:
  - Total porters active in month
  - Total trips
  - Total payroll
  - Average cost per trip
- ✅ Per-porter breakdown:
  - Trip count
  - Total salary
  - Average per trip
  - Designation
- ✅ Carrier usage statistics (trip count & total cost)
- ✅ Top locations (most common origins & destinations)
- ✅ Real-time data with auto-refresh

### 9. Dashboard
- ✅ Quick stats cards
- ✅ Recent attendance entries
- ✅ Active porter count
- ✅ Activity feed (last 15 actions)
- ✅ Auto-refresh every 30 seconds

### 10. Activity Logging
- ✅ Automatic logging of all CRUD operations
- ✅ User tracking (who did what)
- ✅ Timestamp tracking
- ✅ Entity details capture
- ✅ Activity feed on dashboard

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout and clear tokens
- `POST /api/auth/refresh` - Refresh access token

### Porters
- `GET /api/porters` - List all porters (with search & filters)
- `GET /api/porters/:id` - Get porter details
- `POST /api/porters` - Create new porter
- `PUT /api/porters/:id` - Update porter
- `DELETE /api/porters/:id` - Delete porter

### Locations
- `GET /api/locations` - List all locations
- `POST /api/locations` - Create location
- `PUT /api/locations/:id` - Update location
- `DELETE /api/locations/:id` - Delete location

### Carriers
- `GET /api/carriers` - List all carriers
- `PUT /api/carriers/:id` - Update carrier (create/delete disabled)

### Commute Costs
- `GET /api/commute-costs` - List all costs (with filters)
- `GET /api/commute-costs/calculate` - Calculate cost for route
- `POST /api/commute-costs` - Create cost entry
- `PUT /api/commute-costs/:id` - Update cost
- `DELETE /api/commute-costs/:id` - Delete cost

### Attendance
- `GET /api/attendance` - List all entries (with date filters)
- `GET /api/attendance/date/:date` - Get entries for specific date
- `POST /api/attendance` - Create attendance entry
- `PUT /api/attendance/:id` - Update entry
- `DELETE /api/attendance/:id` - Delete entry

### Payroll
- `GET /api/payroll` - Get all porter payrolls for month
- `GET /api/payroll/porter/:porterId` - Get specific porter payroll
- `POST /api/payroll/payment` - Record payment for porter

### Reports
- `GET /api/reports/generate?month=YYYY-MM` - Generate monthly report
- `GET /api/reports/dashboard` - Dashboard statistics

### Activities
- `GET /api/activities?limit=15` - Get recent activity log

## Frontend Pages

1. **Login Page** (`/`)
   - Email/password authentication
   - Form validation
   - Auto-redirect to dashboard on success

2. **Dashboard** (`/dashboard`)
   - Summary statistics cards
   - Recent attendance table
   - Activity feed
   - Quick navigation tiles

3. **Attendance Calendar** (`/attendance`)
   - Monthly calendar view with react-big-calendar
   - Blue dots on days with entries
   - Click date to add entry
   - Entry modal with form
   - Edit/Delete existing entries
   - Auto-cost calculation based on route

4. **Porter Profile** (`/porters/:id`)
   - Porter details
   - Monthly salary calculation
   - Three display boxes: Total Salary | Already Paid | Left to Pay
   - Payment input field with "Pay Amount" button
   - Attendance history for the month
   - Trip details table

5. **Reports** (`/reports`)
   - Month selector
   - Summary cards (porters, trips, payroll, avg/trip)
   - Porter salary table with detailed breakdown
   - Carrier usage statistics
   - Top locations (origins & destinations)
   - Real-time data from backend aggregation

6. **Admin Panel** (`/admin`)
   - Tabbed interface
   - Porter management (CRUD + search)
   - Location management (CRUD)
   - Carrier management (update only)
   - Commute Cost management (CRUD + search)

## Critical Technical Details

### Date Handling (VERY IMPORTANT)
- **Problem**: Initially used UTC midnight storage, caused entries to shift by one day
- **Solution**: Changed to LOCAL timezone throughout
- Backend: `new Date(year, month, day, 0, 0, 0, 0)` (LOCAL, not Date.UTC)
- Frontend: Direct parsing without timezone conversion
- All date filters use local bounds
- Validation accepts YYYY-MM-DD and ISO datetime

### Payment System Logic
- **Problem**: Was showing total salary as "already paid" before payment
- **Solution**: Incremental payment system
- Backend returns `amount: 0` when no payment exists
- Frontend calculates: `newTotal = (existing || 0) + inputAmount`
- Backend stores cumulative total paid amount
- Unique index prevents duplicate payments for same month

### API Client Pattern
- All backend responses wrapped in: `{ success: true, data: {...} }`
- `apiRequest()` utility extracts `data` subtree automatically
- Token auto-refresh on 401 errors
- Automatic retry with new token

### Model Transformations
- All Mongoose models have `toJSON` transformation: `_id` → `id`
- Frontend uses `id`, backend uses `_id` internally
- Consistent interface across frontend/backend

## Environment Configuration

### Backend (.env)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://porteradmin:poterSecure2024@cluster0.xx3zhzb.mongodb.net/porter-management?retryWrites=true&w=majority&appName=Cluster0
JWT_ACCESS_SECRET=<generated-secret>
JWT_REFRESH_SECRET=<generated-secret>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://porter-managment-xbii.vercel.app
ADMIN_EMAIL=admin@porter.com
ADMIN_PASSWORD=password123
ADMIN_NAME=System Administrator
```

### Frontend (.env.local for development)
```
VITE_API_URL=http://localhost:5000/api
```

### Frontend (Production uses hardcoded fallback)
- `api-client.ts`: `API_BASE_URL = import.meta.env.VITE_API_URL || 'https://porter-managment-1.onrender.com/api'`

## Known Issues & Limitations

1. **Render Free Tier**: Backend spins down after 15 min inactivity (30s cold start)
2. **No file uploads**: AWS S3 configured but not implemented
3. **No CSV/PDF export**: Placeholder functions exist
4. **No multi-user support**: Only single admin user
5. **No porter login**: Only admin can access system
6. **No mobile app**: Web-only interface
7. **Duplicate schema index warnings**: Mongoose warnings (safe to ignore)

## Seeded Test Data

When running `npm run seed` in backend:
- 1 admin user (admin@porter.com)
- 3 carriers (Porter, Small Donkey, Pickup Truck)
- 8 porters (P001-P008 with various designations)
- 10 locations (warehouse codes: WH001-WH010)
- 36 commute cost entries (various route combinations)

## Deployment Architecture

```
User Browser
    ↓
Vercel Frontend (React SPA)
    ↓ (HTTPS API calls)
Render Backend (Node.js/Express)
    ↓ (MongoDB connection)
MongoDB Atlas (Cloud Database)
```

## Recent Major Fixes

1. **Date Timezone Fix**: Changed from UTC to local timezone storage (Nov 2025)
2. **Payment UI Redesign**: Incremental payment tracking (Nov 2025)
3. **Reports Real-time Data**: Connected to MongoDB aggregation (Nov 2025)
4. **TypeScript Compilation**: Fixed all errors for Vercel deployment (Nov 2025)
5. **Calendar Day Indicators**: Blue dots for days with entries (Nov 2025)
6. **Search & Filter**: Added OR-based filtering across entities (Nov 2025)

## What to Request for New Features

Provide this summary to ChatGPT and ask for features like:
- Porter mobile app (React Native)
- Attendance bulk import (CSV upload)
- Advanced analytics (charts, graphs)
- Multi-user roles (manager, supervisor, porter)
- Porter self-service portal
- Geolocation tracking
- Photo upload for trip verification
- Expense management
- Leave/absence tracking
- Performance metrics & KPIs
- Automated salary slips (PDF generation)
- SMS/Email notifications
- Shift scheduling
- Vehicle/asset tracking
- Barcode/QR scanning for locations
- Real-time dashboard with WebSocket
- Multi-tenant support (multiple companies)
- Overtime calculation
- Bonus/incentive management
- Custom report builder

---

**Repository**: https://github.com/abhishek972986/porter-managment
**Last Updated**: January 10, 2026
