# PDF Dynamic Generator

Template-based PDF generation system using React + TypeScript frontend and Node.js + Puppeteer backend.

## Project Structure

```
ds/
├── backend/
│   ├── server.js              # Express API server
│   ├── pdf.js                 # Puppeteer PDF generation logic
│   ├── package.json           # Backend dependencies
│   └── templates/
│       └── works.template.html # PDF template with {{placeholders}}
│
├── frontend/ (or src/)
│   └── App.tsx                # React form component
│
└── README.md
```

## How It Works

1. **Frontend (React)**: Form collects user data (brigade, unit name, financial year, etc.)
2. **API Call**: Form data sent as JSON to backend `/generate-pdf` endpoint
3. **Backend**: 
   - Loads `works.template.html`
   - Replaces `{{placeholders}}` with actual values
   - Uses Puppeteer to convert HTML → PDF
4. **Download**: PDF automatically downloads to user's browser

## Setup Instructions

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the server
npm start
```

Backend will run on `http://localhost:3001`

### Frontend Setup

```bash
# Navigate to frontend/root directory
cd ..

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173` (or your configured port)

## Usage

1. Start the backend server first (`npm start` in `backend/`)
2. Start the frontend dev server (`npm run dev` in root)
3. Fill out the form with required details
4. Click **Submit**
5. PDF will automatically download with filled data

## Template Placeholders

The `works.template.html` file uses these placeholders:

- `{{brigade}}` - Brigade name
- `{{unitName}}` - Unit name
- `{{financialYear}}` - Financial year (e.g., 2024-25)
- `{{brigadeName}}` - Brigade group name
- `{{letterNo}}` - Letter number
- `{{date}}` - Date (auto-formatted to DD/MM/YYYY)
- `{{remarks}}` - Optional remarks

## Backend API

### POST /generate-pdf

**Request Body:**
```json
{
  "brigade": "121 (Independent) Infantry Brigade",
  "unitName": "UnitNameKaraj",
  "financialYear": "2024-25",
  "brigadeName": "NAME OF Bde Gp",
  "letterNo": "508/Q/S&S/1",
  "date": "2025-03-08",
  "remarks": "Optional notes"
}
```

**Response:**
- Content-Type: `application/pdf`
- Downloads as: `document-{unitName}-{timestamp}.pdf`

### GET /health

Check if backend is running:
```bash
curl http://localhost:3001/health
```

## Dependencies

### Backend
- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `puppeteer` - Headless browser for PDF generation

### Frontend
- React 18 + TypeScript
- Vite (build tool)

## Important Notes

⚠️ **DO NOT** modify the template structure:
- Keep all CSS classes intact
- Do not rename/remove pdf2htmlEX-generated spans
- Only replace visible text with placeholders

✅ **Template is already created** with placeholders - no manual work needed!

## Troubleshooting

**"Failed to generate PDF" error:**
- Ensure backend server is running on port 3001
- Check backend console for errors
- Verify Puppeteer installation completed successfully

**Port conflict:**
- Change port in `backend/server.js` (line 11): `const PORT = 3002;`
- Update frontend API URL in `App.tsx` (line 41)

**Puppeteer installation issues:**
```bash
# Install Chromium manually
cd backend
npx puppeteer browsers install chrome
```

## Production Deployment

1. Build frontend: `npm run build`
2. Serve built files from backend or separate static server
3. Update API URL in production build
4. Set `NODE_ENV=production`
5. Use process manager like PM2 for backend

---

**Original PDF Template**: `works.html` (pdf2htmlEX generated)
**Modified Template**: `backend/templates/works.template.html` (with placeholders)
