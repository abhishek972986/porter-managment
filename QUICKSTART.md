# Quick Start Guide

## 🎯 First Time Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the dev server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Go to `http://localhost:5173`

4. **Login:**
   - Email: `admin@porter.com`
   - Password: `password123` (or anything)

## 🗺️ Navigation Guide

### Dashboard (`/dashboard`)
- See today's commutes and monthly costs
- Click quick action cards to navigate

### Attendance Calendar (`/attendance`)
- **View**: Month view with colored entries
- **Add Entry**: Click any date → Opens drawer → Fill form at bottom
- **Cost Calculation**: Select carrier + destination → Cost appears automatically

### Porters (`/porters`)
- List of all porters
- Click any porter to see their profile and earnings

### Reports (`/reports`)
- Select month from dropdown
- View salary calculations
- Export CSV or PDF

### Documents (`/documents`)
- Select template
- Map placeholders to fields
- Generate documents

### Admin / Master Data (`/admin`)
- **Porters Tab**: Add/Edit/Delete porters
- **Locations Tab**: Manage locations
- **Commute Costs Tab**: Set prices for routes

## 🎨 Key Features to Try

### 1. Add Daily Entry
1. Go to Attendance Calendar
2. Click today's date
3. Scroll down in drawer
4. Fill form:
   - Select porter (e.g., "John Doe")
   - Choose carrier (e.g., "Porter")
   - Pick destination (e.g., "Warehouse A")
   - Write task description
   - See cost appear automatically!
5. Click "Add Entry"

### 2. View Porter Profile
1. Go to Porters page
2. Click on any porter card
3. See their monthly earnings and recent work

### 3. Generate Monthly Report
1. Go to Reports
2. Select current month
3. See all porter salaries
4. Click "Export CSV" or "Export PDF"

### 4. Manage Master Data
1. Go to Admin page
2. Add a new location (Locations tab)
3. Add cost for that location (Commute Costs tab)
4. Now it's available in the entry form!

## 🎯 Sample Workflow

**Scenario: Record John's delivery today**

1. **Navigate**: Click "Attendance Calendar" from dashboard
2. **Select Date**: Click today's date
3. **Add Entry**:
   - Porter: John Doe
   - Carrier: Small Donkey
   - To: Construction Site B
   - Task: "Delivered 50 cement bags"
   - Cost: $55.00 (calculated automatically)
4. **Submit**: Click "Add Entry"
5. **Verify**: See new entry in calendar with green color (small donkey)

## 🔍 What Each Carrier Type Means

- **Porter** (Blue): Human porter carrying items
- **Small Donkey** (Green): Donkey cart for medium loads
- **Pickup Truck** (Orange): Vehicle for heavy/large items

## 💡 Pro Tips

- Calendar entries are **color-coded by carrier type**
- Click any existing entry to see details
- Multiple entries can be added for the same day
- The "From" location is always the factory (default)
- Costs are calculated based on distance and carrier type

## 🐛 Troubleshooting

**Issue: Blank page after login**
- Solution: Check browser console for errors, refresh page

**Issue: Calendar not showing entries**
- Solution: Make sure you're viewing the current month

**Issue: Cost not calculating**
- Solution: Ensure from/to locations and carrier are all selected

## 📱 Mobile Usage

- Tap hamburger menu (☰) in top-left to open sidebar
- Calendar converts to list view on mobile
- All forms are touch-friendly

## 🚀 Next Steps

1. Explore all pages
2. Add multiple entries
3. Generate a monthly report
4. Try the admin functions
5. Customize for your needs!

---

**Need help?** Check the main README.md or open an issue on GitHub.
