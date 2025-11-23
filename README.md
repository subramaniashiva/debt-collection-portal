# Debt Collection Portal

A web-based platform designed to streamline and automate the debt collection process for property managers handling unpaid service charges.

## Overview

This MVP demonstrates a cost-effective alternative to traditional law firm debt collection services. The platform automates document generation, tracks case progression, and guides property managers through the standard debt recovery workflow - from initial Letters Before Action through to CCJ filing and mortgagee contact.

## Features

### Core Functionality
- **Case Management**: Create and track debt collection cases with unique reference numbers
- **Automated Workflow**: Step-by-step guidance through the standard recovery process
- **Document Generation**: Automatically generate LBA1, LBA2, and mortgagee letters
- **Timeline Tracking**: 28-day and 14-day countdown timers with alerts
- **Cost Calculation**: Automatic tracking of recoverable legal costs
- **Visual Pipeline**: Real-time dashboard showing cases at each stage

### Workflow Stages
1. **New Case** - Initial case creation
2. **LBA1 Sent** - First Letter Before Action (28 days)
3. **LBA2 Sent** - Second Letter Before Action (14 days)
4. **HMLR Requested** - Request office copy from HM Land Registry
5. **Mortgagee Contacted** - Send notice to mortgage lender
6. **CCJ Filed** - County Court Judgment filed
7. **Completed** - Payment received and case closed

## Technology Stack

- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Frontend**: React + React Router
- **Styling**: Custom CSS
- **Date Handling**: date-fns

## Getting Started

### Prerequisites
- Node.js 16+ and npm installed

### Installation

1. Install dependencies for both backend and frontend:
```bash
npm run install-all
```

### Running the Application

**Option 1: Run both together (Recommended)**
```bash
npm run dev
```

**Option 2: Run separately**

Terminal 1 - Backend:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
cd client && PORT=7000 npm start
```

The application will be available at:
- **Frontend**: http://localhost:7000
- **Backend API**: http://localhost:7001

### First Time Setup

The database will be automatically created when you first start the server. You can immediately begin creating cases.

## Usage Guide

### Creating a New Case

1. Click "+ New Case" from the dashboard or navigation
2. Enter debtor details:
   - Debtor name
   - Property address
   - Outstanding debt amount
3. Click "Create Case"

### Managing a Case

Once a case is created, you can:

1. **Generate Documents**: Click the document generation buttons to create template letters
2. **Progress the Case**: Use action buttons to move through workflow stages
3. **Track Costs**: View accumulating legal costs in the sidebar
4. **Monitor Timeline**: See days until next deadline
5. **View Activity**: Check the timeline for all actions taken

### Document Generation

The system generates professional template documents for:
- **LBA1**: First notice with 28-day deadline
- **LBA2**: Final notice with 14-day deadline
- **Mortgagee Letter**: Notice to mortgage lender

Documents can be:
- Copied to clipboard
- Downloaded as text files
- Customized before sending

### Adding Mortgagee Details

After requesting HMLR office copy:
1. Click "Add Mortgagee Details"
2. Enter mortgagee name and address (from HMLR copy)
3. Click "Save & Send Letter" to generate mortgagee notice

## Project Structure

```
portal/
├── server/
│   └── index.js              # Express API server
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── Dashboard.js   # Main dashboard with stats
│       │   ├── CaseDetail.js  # Individual case view
│       │   └── NewCase.js     # Case creation form
│       ├── App.js            # Main app component
│       └── index.js          # React entry point
├── package.json              # Root dependencies
└── debt-collection.db        # SQLite database (auto-created)
```

## API Endpoints

### Cases
- `GET /api/cases` - List all cases
- `GET /api/cases/:id` - Get single case with activities
- `POST /api/cases` - Create new case
- `POST /api/cases/:id/action` - Perform workflow action

### Dashboard
- `GET /api/dashboard/stats` - Get statistics and stage breakdown

### Documents
- `POST /api/cases/:id/documents/generate` - Generate document template

## Database Schema

### Cases Table
- Case reference, debtor details, property address
- Debt amount and total costs
- Current stage and status
- Date tracking for each workflow stage
- Mortgagee information

### Activities Table
- Timeline of all actions taken on a case
- Linked to parent case

### Documents Table
- Generated documents log
- Document type and creation date

## Cost Structure

The platform tracks these standard costs (automatically added at each stage):

- HMLR Office Copy: £45
- LBA1: £225
- LBA2: £150
- Mortgagee Letter: £350
- CCJ Filing: £500

All costs are automatically added to the case and shown in the total recoverable amount.

## Future Enhancements

Potential additions for production version:

- **HMLR API Integration**: Automatic office copy requests
- **Email Integration**: Send letters directly via email
- **Postal Service Integration**: Royal Mail tracked delivery
- **Bulk Import**: Upload cases from Excel
- **Payment Tracking**: Record partial and full payments
- **Reporting**: Generate management reports and statistics
- **User Authentication**: Multi-user support with roles
- **Court Form Generation**: Pre-filled N1 claim forms
- **Mortgagee Database**: Track which lenders pay at which stage
- **Automated Reminders**: Email/SMS notifications for deadlines

## Development Notes

### Adding New Features

The codebase is structured to make extensions easy:

- Add new workflow stages in `server/index.js` (CASE_ACTION handler)
- Add document templates in the document generation endpoint
- Update frontend components to show new actions

### Customizing Costs

Modify the cost values in `server/index.js` in the action handler switch statement.

### Customizing Document Templates

Edit the document generation logic in the `/api/cases/:id/documents/generate` endpoint.

## Support

For questions or issues, please contact the development team.

## License

Proprietary - Internal use only
