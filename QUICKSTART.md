# Quick Start Guide

## Getting Started in 3 Steps

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Start the Application
```bash
npm run dev
```

### 3. Open Your Browser
Visit **http://localhost:7000**

---

## What You'll See

### Dashboard
The main dashboard shows:
- Statistics (total cases, active cases, debt value)
- Pipeline visualization showing cases at each stage
- Full case list with filtering

### Creating Your First Case

1. Click **"+ New Case"** button
2. Enter:
   - Debtor name (e.g., "John Smith")
   - Property address
   - Debt amount (e.g., 2500)
3. Click **"Create Case"**

### Working Through a Case

Once a case is created, you'll see action buttons for each stage:

**Stage 1: Generate LBA1**
- Click "Generate LBA1" to see the letter
- Copy or download the document
- Click "Mark LBA1 as Sent" to progress

**Stage 2: LBA2 (after 28 days)**
- Generate and send LBA2
- Mark as sent

**Stage 3: HMLR Request**
- Click "Request HMLR Office Copy"
- This simulates requesting property details from HM Land Registry

**Stage 4: Mortgagee Contact**
- Click "Add Mortgagee Details"
- Enter the mortgage lender name and address (from HMLR copy)
- Generate and send mortgagee letter

**Stage 5: CCJ or Payment**
- Either file a CCJ claim
- Or mark as paid if mortgagee settles

### Key Features to Demo

**Cost Tracking**
- Costs automatically accumulate at each stage
- View total recoverable amount in the sidebar

**Timeline**
- Every action is logged with timestamp
- See complete case history

**Document Generation**
- Professional letter templates
- Automatically populated with case details
- Copy to clipboard or download

**Pipeline Dashboard**
- Visual representation of case flow
- See how many cases at each stage
- Filter cases by stage

---

## Demo Flow for Your Team

1. **Create 3-4 sample cases** with different debt amounts
2. **Progress them to different stages** to show the pipeline
3. **Generate documents** to show the letter templates
4. **Show the cost calculation** accumulating through stages
5. **Demonstrate the timeline** tracking all activities

---

## Notes

- Data is stored **in-memory** (resets when server restarts)
- This is an MVP to demonstrate the concept
- For production, you'd add:
  - Persistent database
  - User authentication
  - HMLR API integration
  - Email/postal integration
  - Payment tracking

---

## Troubleshooting

**Port already in use?**
```bash
# Kill existing processes
lsof -ti:7000 | xargs kill -9
lsof -ti:7001 | xargs kill -9
```

**Need to restart?**
```bash
# Stop with Ctrl+C in the terminal
# Then run again
npm run dev
```

**See errors in browser console?**
- Make sure both frontend (7000) and backend (7001) are running
- Check the terminal for any error messages
