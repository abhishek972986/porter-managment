# Porter Management System

A complete, production-ready full-stack application for managing porters, attendance tracking, payroll calculation, and reporting.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB v6+
- npm or yarn

### Installation

1. **Backend Setup**:
```bash
cd backend
npm install
npm run seed    # Creates admin user and sample data
npm run dev     # Starts on http://localhost:5000
```

2. **Frontend Setup**:
```bash
cd ..
npm install
npm run dev     # Starts on http://localhost:5174
```

3. **Login**:
- Email: `admin@porter.com`
- Password: `password123`

## 📋 Features

### Frontend
✅ React 19 + TypeScript + Vite
✅ TailwindCSS responsive UI
✅ JWT authentication with role-based access
✅ Interactive attendance calendar
✅ Automatic cost calculation
✅ Monthly payroll reports
✅ Porter & location management
✅ Admin panel for configuration

### Backend
✅ RESTful API with Express.js
✅ MongoDB + Mongoose ODM
✅ JWT access + refresh tokens
✅ Role-based access control (Admin/Supervisor/Viewer)
✅ Automatic attendance cost calculation
✅ CSV import for commute costs
✅ Monthly payroll aggregation
✅ Winston logging + error handling

## 🔌 API Endpoints

See [Backend README](./backend/README.md) for complete API documentation.

Key endpoints:
- `POST /api/auth/login` - Authentication
- `GET /api/porters` - List porters
- `POST /api/attendance` - Create attendance (auto-calculates cost)
- `GET /api/payroll?month=YYYY-MM` - Monthly payroll
- `GET /api/reports/dashboard` - Dashboard statistics

## 📁 Project Structure

```
porter/
├── backend/           # Backend API (Node.js + Express + MongoDB)
├── src/              # Frontend (React + TypeScript)
├── public/           # Static assets
└── README.md         # This file
```

## 💼 Usage Workflow

1. **Setup** (Admin): Add locations, configure commute costs, add porters
2. **Daily** (Supervisor): Record attendance entries with automatic cost calculation
3. **Monthly**: Generate payroll reports and export data

## 🛡️ Security

- Password hashing (bcrypt)
- JWT tokens
- Input validation (Zod)
- CORS + Helmet
- MongoDB injection prevention

## 📦 Tech Stack

**Frontend**: React, TypeScript, Vite, TailwindCSS, React Query, React Hook Form
**Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Winston

## 📄 License

MIT

---

For detailed documentation, see:
- [Backend README](./backend/README.md)
- [API Documentation](./backend/README.md#-api-endpoints)
