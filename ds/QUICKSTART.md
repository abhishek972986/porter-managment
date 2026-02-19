# 🚀 Quick Start Guide

## Step-by-Step Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

This will install:
- Express (web server)
- CORS (cross-origin requests)
- Puppeteer (PDF generation - ~300MB download including Chromium)

### 2. Start Backend Server

```bash
npm start
```

You should see:
```
🚀 PDF Generator API running on http://localhost:3001
📄 POST to http://localhost:3001/generate-pdf to generate PDFs
```

### 3. Start Frontend (in a new terminal)

```bash
cd ..
npm run dev
```

### 4. Test the Application

1. Open browser to `http://localhost:5173`
2. Fill out the form:
   - Infantry Brigade: `121 (Independent) Infantry Brigade`
   - Unit Name: `UnitNameKaraj`
   - Financial Year: `2024-25`
   - Brigade Group: `NAME OF Bde Gp`
   - Letter Number: `508/Q/S&S/1`
   - Date: Pick any date
   - Remarks: (optional)
3. Click **Submit**
4. PDF should automatically download!

## Verification Checklist

✅ Backend server running on port 3001  
✅ Frontend running on port 5173  
✅ No console errors  
✅ PDF downloads successfully  
✅ PDF contains your filled-in data  

## Common Issues

**Backend won't start:**
```bash
# Make sure you're in the backend directory
cd backend
npm install
npm start
```

**"Failed to generate PDF" alert:**
- Check backend terminal - is server running?
- Check browser console for errors
- Verify URL is `http://localhost:3001/generate-pdf`

**Puppeteer fails to install:**
```bash
# Manual Chromium installation
cd backend
npx puppeteer browsers install chrome
```

## File Structure Created

```
ds/
├── backend/
│   ├── server.js               ✅ Express API
│   ├── pdf.js                  ✅ PDF generator
│   ├── package.json            ✅ Dependencies
│   └── templates/
│       └── works.template.html ✅ Template with placeholders
│
├── src/
│   └── App.tsx                 ✅ Updated to call API
│
└── SETUP_README.md             ✅ Full documentation
```

## What Changed

### Before (Old Implementation)
- React generated HTML from scratch
- Downloaded HTML file
- Lost original PDF styling

### After (New Implementation)
- React sends data to backend API
- Backend injects data into pdf2htmlEX template
- Puppeteer converts to PDF
- Downloads professional-looking PDF
- **Preserves exact original layout!**

## Next Steps

- Customize form fields in [App.tsx](src/App.tsx)
- Add more placeholders to template
- Deploy backend to production server
- Configure CORS for production domain

---

**Need Help?** Check [SETUP_README.md](SETUP_README.md) for detailed documentation.
