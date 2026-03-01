# Porter Management System - Backend API

Complete production-ready backend for Porter Management System built with Node.js, Express, and MongoDB.

## 🌐 Deployed Application

- **Frontend**: [https://porter-managment.vercel.app](https://porter-managment.vercel.app)
- **Backend API**: [https://porter-managment-1.onrender.com](https://porter-managment-1.onrender.com)
- **Repository**: [https://github.com/abhishek972986/porter-managment](https://github.com/abhishek972986/porter-managment)

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with access and refresh tokens
- **Role-Based Access Control**: Admin, Supervisor, and Viewer roles
- **Complete CRUD Operations**: Porters, Carriers, Locations, Commute Costs
- **Attendance Management**: Automatic cost calculation from commute costs
- **Payroll System**: Monthly salary aggregation per porter
- **Reporting**: Comprehensive monthly reports with statistics
- **CSV Import**: Bulk upload commute costs via CSV
- **Security**: Helmet, CORS, input validation with Zod
- **Logging**: Winston logger for all operations
- **Error Handling**: Centralized error handling middleware

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

## 🛠️ Installation

1. **Install dependencies**:
```bash
cd backend
npm install
```

2. **Configure environment variables**:
The `.env` file is already set up with default values. Update if needed:
```env
MONGODB_URI=mongodb://localhost:27017/porter-management
PORT=5000
FRONTEND_URL=http://localhost:5174
```

3. **Seed the database**:
```bash
npm run seed
```

This creates:
- Admin user (admin@porter.com / password123)
- 3 Carriers (porter, small-donkey, pickup-truck)
- 8 Sample porters
- 10 Locations
- Sample commute costs

4. **Start the server**:
```bash
npm run dev
```

Server will run on http://localhost:5000

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── s3.js              # AWS S3 configuration
│   ├── models/
│   │   ├── User.js            # User authentication
│   │   ├── Porter.js          # Porter management
│   │   ├── Carrier.js         # Carrier types
│   │   ├── Location.js        # Location management
│   │   ├── CommuteCost.js     # Route costs
│   │   ├── Attendance.js      # Daily attendance
│   │   ├── DocumentTemplate.js
│   │   └── DocumentInstance.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── porter.controller.js
│   │   ├── carrier.controller.js
│   │   ├── location.controller.js
│   │   ├── commuteCost.controller.js
│   │   ├── attendance.controller.js
│   │   ├── payroll.controller.js
│   │   └── reports.controller.js
│   ├── routes/
│   │   └── *.routes.js        # API routes
│   ├── middlewares/
│   │   ├── auth.js            # JWT verification
│   │   ├── validate.js        # Zod validation
│   │   ├── errorHandler.js    # Error handling
│   │   └── upload.js          # File upload
│   ├── utils/
│   │   └── logger.js          # Winston logger
│   ├── scripts/
│   │   └── seed.js            # Database seeding
│   ├── app.js                 # Express app setup
│   └── server.js              # Server entry point
├── .env                       # Environment variables
├── .env.example               # Environment template
└── package.json
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login
POST   /api/auth/refresh       # Refresh access token
POST   /api/auth/logout        # Logout
GET    /api/auth/profile       # Get user profile
```

### Porters
```
GET    /api/porters            # Get all porters
GET    /api/porters/:id        # Get porter by ID
POST   /api/porters            # Create porter (Admin/Supervisor)
PUT    /api/porters/:id        # Update porter (Admin/Supervisor)
DELETE /api/porters/:id        # Deactivate porter (Admin)
```

### Carriers
```
GET    /api/carriers           # Get all carriers
GET    /api/carriers/:id       # Get carrier by ID
POST   /api/carriers           # Create carrier (Admin)
PUT    /api/carriers/:id       # Update carrier (Admin)
DELETE /api/carriers/:id       # Deactivate carrier (Admin)
```

### Locations
```
GET    /api/locations          # Get all locations
GET    /api/locations/:id      # Get location by ID
POST   /api/locations          # Create location (Admin/Supervisor)
PUT    /api/locations/:id      # Update location (Admin/Supervisor)
DELETE /api/locations/:id      # Deactivate location (Admin)
```

### Commute Costs
```
GET    /api/commute-costs      # Get all costs (with filters)
GET    /api/commute-costs/find # Find cost by route & carrier
GET    /api/commute-costs/:id  # Get cost by ID
POST   /api/commute-costs      # Create cost (Admin/Supervisor)
POST   /api/commute-costs/upload # Upload CSV (Admin/Supervisor)
PUT    /api/commute-costs/:id  # Update cost (Admin/Supervisor)
DELETE /api/commute-costs/:id  # Delete cost (Admin)
```

### Attendance
```
GET    /api/attendance         # Get attendance (filter by month/porter)
GET    /api/attendance/calendar # Get calendar view
GET    /api/attendance/:id     # Get attendance by ID
POST   /api/attendance         # Create attendance (auto-calculates cost)
PUT    /api/attendance/:id     # Update attendance
DELETE /api/attendance/:id     # Delete attendance (Admin)
```

### Payroll
```
GET    /api/payroll?month=YYYY-MM              # Monthly payroll
GET    /api/payroll/:porterId?month=YYYY-MM    # Porter payroll
GET    /api/payroll/summary                    # Payroll summary
```

### Reports
```
GET    /api/reports/generate?month=YYYY-MM     # Generate monthly report
GET    /api/reports/dashboard                  # Dashboard statistics
```

## 🔐 Authentication

All protected routes require Bearer token:
```
Authorization: Bearer <access_token>
```

### Roles & Permissions

**Admin**: Full access to all endpoints
**Supervisor**: Can manage porters, locations, costs, attendance
**Viewer**: Read-only access

## 📊 Business Logic

### Attendance Cost Calculation
When creating attendance entry:
1. System finds commute cost based on: carrier + from location + to location
2. Stores `computedCost` as snapshot (never recalculates historically)
3. If route/carrier changes, cost is recalculated

### Payroll Calculation
```
Monthly Salary = SUM(computedCost) for all attendance entries in month
```

### CSV Import Format
```csv
fromLocationCode,toLocationCode,carrierName,cost
WH01,DC01,porter,50
WH01,DC01,small-donkey,80
```

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@porter.com","password":"password123"}'
```

### Create Attendance
```bash
curl -X POST http://localhost:5000/api/attendance \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-11-17T08:00:00Z",
    "porter": "PORTER_ID",
    "carrier": "CARRIER_ID",
    "locationFrom": "FROM_LOCATION_ID",
    "locationTo": "TO_LOCATION_ID",
    "task": "Deliver goods"
  }'
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment | development |
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection | mongodb://localhost:27017/porter-management |
| JWT_ACCESS_SECRET | Access token secret | (change in production) |
| JWT_REFRESH_SECRET | Refresh token secret | (change in production) |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:5174 |
| ADMIN_EMAIL | Seed admin email | admin@porter.com |
| ADMIN_PASSWORD | Seed admin password | password123 |

## 📝 Logging

Logs are stored in:
- `logs/error.log` - Error logs
- `logs/combined.log` - All logs
- Console output in development

## 🚀 Production Deployment

1. **Set environment**:
```env
NODE_ENV=production
```

2. **Update secrets**:
- Generate strong JWT secrets
- Configure production MongoDB URI

3. **Start server**:
```bash
npm start
```

4. **Optional: PM2**:
```bash
npm install -g pm2
pm2 start src/server.js --name porter-api
```

## 🛡️ Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Helmet for HTTP headers security
- CORS configuration
- Input validation with Zod
- MongoDB injection prevention
- Rate limiting ready (add express-rate-limit)

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **zod**: Schema validation
- **cors**: CORS middleware
- **helmet**: Security headers
- **multer**: File upload
- **csv-parser**: CSV parsing
- **winston**: Logging
- **date-fns**: Date manipulation

## 🤝 Integration with Frontend

The backend is configured to work with the frontend at `http://localhost:5174`.

Update `FRONTEND_URL` in `.env` if your frontend runs on a different port.

## 📞 Support

For issues or questions, check the logs in the `logs/` directory.

## 📄 License

MIT
