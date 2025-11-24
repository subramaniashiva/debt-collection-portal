const express = require('express');
const cors = require('cors');
const path = require('path');
const { addDays, differenceInDays, format } = require('date-fns');

const app = express();
const PORT = process.env.PORT || 7001;

// In-memory database
let cases = [];
let activities = [];
let documents = [];
let caseIdCounter = 1;
let activityIdCounter = 1;
let documentIdCounter = 1;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');

  // Try different possible build paths
  const possiblePaths = [
    path.join(__dirname, '../client/build'),
    path.join(process.cwd(), 'client/build'),
    path.join(__dirname, '../../client/build')
  ];

  let buildPath = null;
  for (const tryPath of possiblePaths) {
    console.log('Checking path:', tryPath);
    if (fs.existsSync(tryPath)) {
      buildPath = tryPath;
      console.log('✓ Build directory found at:', buildPath);
      break;
    }
  }

  if (buildPath) {
    app.use(express.static(buildPath));
  } else {
    console.error('✗ Build directory NOT found in any expected location');
    console.log('Current directory (__dirname):', __dirname);
    console.log('Current working directory (cwd):', process.cwd());
  }
}

// Helper function to generate case reference
const generateCaseReference = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `DC${year}-${random}`;
};

// Helper function to log activity
const logActivity = (caseId, activityType, description) => {
  activities.push({
    id: activityIdCounter++,
    case_id: caseId,
    activity_type: activityType,
    description: description,
    created_at: new Date().toISOString()
  });
};

// API Routes

// Get all cases
app.get('/api/cases', (req, res) => {
  try {
    // Add next action and days until deadline for each case
    const casesWithActions = cases.map(c => {
      let nextAction = '';
      let daysUntilDeadline = null;

      if (c.current_stage === 'NEW') {
        nextAction = 'Send LBA1';
      } else if (c.current_stage === 'LBA1_SENT') {
        const sentDate = new Date(c.lba1_sent_date);
        const deadline = addDays(sentDate, 28);
        daysUntilDeadline = differenceInDays(deadline, new Date());
        nextAction = daysUntilDeadline <= 0 ? 'Send LBA2' : `Wait ${daysUntilDeadline} days`;
      } else if (c.current_stage === 'LBA2_SENT') {
        const sentDate = new Date(c.lba2_sent_date);
        const deadline = addDays(sentDate, 14);
        daysUntilDeadline = differenceInDays(deadline, new Date());
        nextAction = daysUntilDeadline <= 0 ? 'Request HMLR Copy' : `Wait ${daysUntilDeadline} days`;
      } else if (c.current_stage === 'HMLR_REQUESTED') {
        nextAction = 'Send Mortgagee Letter 1';
      } else if (c.current_stage === 'MORTGAGEE_CONTACTED') {
        nextAction = 'Chase Mortgagee / File CCJ';
      } else if (c.current_stage === 'CCJ_FILED') {
        nextAction = 'Send CCJ to Mortgagee';
      } else if (c.current_stage === 'COMPLETED') {
        nextAction = 'Case Closed';
      }

      return {
        ...c,
        nextAction,
        daysUntilDeadline
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(casesWithActions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single case
app.get('/api/cases/:id', (req, res) => {
  try {
    const caseData = cases.find(c => c.id === parseInt(req.params.id));
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const caseActivities = activities
      .filter(a => a.case_id === caseData.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const caseDocuments = documents
      .filter(d => d.case_id === caseData.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      ...caseData,
      activities: caseActivities,
      documents: caseDocuments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new case
app.post('/api/cases', (req, res) => {
  try {
    const { debtor_name, property_address, debt_amount } = req.body;
    const case_reference = generateCaseReference();

    const newCase = {
      id: caseIdCounter++,
      case_reference,
      debtor_name,
      property_address,
      debt_amount,
      status: 'ACTIVE',
      current_stage: 'NEW',
      created_at: new Date().toISOString(),
      lba1_sent_date: null,
      lba2_sent_date: null,
      hmlr_requested_date: null,
      mortgagee_letter1_sent_date: null,
      ccj_filed_date: null,
      mortgagee_name: null,
      mortgagee_address: null,
      total_costs: 0,
      notes: null
    };

    cases.push(newCase);
    logActivity(newCase.id, 'CASE_CREATED', 'Case created');

    res.json(newCase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update case stage
app.post('/api/cases/:id/action', (req, res) => {
  try {
    const { action, data } = req.body;
    const caseId = parseInt(req.params.id);

    const caseIndex = cases.findIndex(c => c.id === caseId);
    if (caseIndex === -1) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const caseData = cases[caseIndex];
    let activityDescription;
    let additionalCosts = 0;

    switch (action) {
      case 'SEND_LBA1':
        caseData.current_stage = 'LBA1_SENT';
        caseData.lba1_sent_date = new Date().toISOString();
        activityDescription = 'LBA1 sent to debtor';
        additionalCosts = 225;
        break;

      case 'SEND_LBA2':
        caseData.current_stage = 'LBA2_SENT';
        caseData.lba2_sent_date = new Date().toISOString();
        activityDescription = 'LBA2 sent to debtor';
        additionalCosts = 150;
        break;

      case 'REQUEST_HMLR':
        caseData.current_stage = 'HMLR_REQUESTED';
        caseData.hmlr_requested_date = new Date().toISOString();
        activityDescription = 'HMLR office copy requested';
        additionalCosts = 45;
        break;

      case 'UPDATE_MORTGAGEE':
        caseData.current_stage = 'MORTGAGEE_CONTACTED';
        caseData.mortgagee_name = data.mortgagee_name;
        caseData.mortgagee_address = data.mortgagee_address;
        caseData.mortgagee_letter1_sent_date = new Date().toISOString();
        activityDescription = `Mortgagee letter sent to ${data.mortgagee_name}`;
        additionalCosts = 350;
        break;

      case 'FILE_CCJ':
        caseData.current_stage = 'CCJ_FILED';
        caseData.ccj_filed_date = new Date().toISOString();
        activityDescription = 'CCJ filed at Bulk Claims Centre';
        additionalCosts = 500;
        break;

      case 'MARK_PAID':
        caseData.current_stage = 'COMPLETED';
        caseData.status = 'CLOSED';
        activityDescription = 'Payment received - case closed';
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    // Update total costs
    if (additionalCosts > 0) {
      caseData.total_costs = (parseFloat(caseData.total_costs) || 0) + additionalCosts;
    }

    logActivity(caseId, action, activityDescription);

    res.json(caseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard statistics
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const activeCases = cases.filter(c => c.status === 'ACTIVE');
    const totalDebtValue = activeCases.reduce((sum, c) => sum + parseFloat(c.debt_amount), 0);

    const stats = {
      totalCases: cases.length,
      activeCases: activeCases.length,
      completedCases: cases.filter(c => c.status === 'CLOSED').length,
      totalDebtValue: totalDebtValue,
      stageBreakdown: {
        new: cases.filter(c => c.current_stage === 'NEW').length,
        lba1: cases.filter(c => c.current_stage === 'LBA1_SENT').length,
        lba2: cases.filter(c => c.current_stage === 'LBA2_SENT').length,
        hmlr: cases.filter(c => c.current_stage === 'HMLR_REQUESTED').length,
        mortgagee: cases.filter(c => c.current_stage === 'MORTGAGEE_CONTACTED').length,
        ccj: cases.filter(c => c.current_stage === 'CCJ_FILED').length
      }
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate document (simplified - returns template text)
app.post('/api/cases/:id/documents/generate', (req, res) => {
  try {
    const { documentType } = req.body;
    const caseData = cases.find(c => c.id === parseInt(req.params.id));

    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    let documentContent = '';
    const today = format(new Date(), 'dd MMMM yyyy');

    switch (documentType) {
      case 'LBA1':
        documentContent = `LETTER BEFORE ACTION - FIRST NOTICE

Date: ${today}
Case Reference: ${caseData.case_reference}

To: ${caseData.debtor_name}
${caseData.property_address}

Dear ${caseData.debtor_name},

RE: OUTSTANDING SERVICE CHARGES - ${caseData.property_address}

We write on behalf of the property management company regarding outstanding service charges for the above property.

AMOUNT OUTSTANDING: £${parseFloat(caseData.debt_amount).toFixed(2)}

This letter serves as formal notice that unless payment is received within 28 days from the date of this letter, we will proceed with further recovery action which may include:

1. Issuing County Court proceedings
2. Contacting your mortgage lender
3. Additional legal costs being added to your account

Current costs: £225.00
Total amount now due: £${(parseFloat(caseData.debt_amount) + 225).toFixed(2)}

Please treat this matter urgently and contact us immediately to arrange payment.

Yours sincerely,
[Property Manager Name]
[Management Company]`;
        break;

      case 'LBA2':
        documentContent = `LETTER BEFORE ACTION - FINAL NOTICE

Date: ${today}
Case Reference: ${caseData.case_reference}

To: ${caseData.debtor_name}
${caseData.property_address}

Dear ${caseData.debtor_name},

RE: FINAL NOTICE - OUTSTANDING SERVICE CHARGES

Further to our letter dated ${caseData.lba1_sent_date ? format(new Date(caseData.lba1_sent_date), 'dd MMMM yyyy') : '[DATE]'}, we have not received payment or any communication from you.

AMOUNT OUTSTANDING: £${parseFloat(caseData.debt_amount).toFixed(2)}
PREVIOUS COSTS: £225.00
ADDITIONAL COSTS: £150.00
TOTAL NOW DUE: £${(parseFloat(caseData.debt_amount) + 375).toFixed(2)}

This is your FINAL opportunity to settle this matter before we:
1. Obtain your property details from HM Land Registry
2. Contact your mortgage lender directly
3. Issue County Court proceedings

You have 14 days from the date of this letter to make payment in full.

Yours sincerely,
[Property Manager Name]
[Management Company]`;
        break;

      case 'MORTGAGEE_LETTER1':
        documentContent = `NOTICE TO MORTGAGEE - SERVICE CHARGE ARREARS

Date: ${today}
Case Reference: ${caseData.case_reference}

To: ${caseData.mortgagee_name || '[MORTGAGEE NAME]'}
${caseData.mortgagee_address || '[MORTGAGEE ADDRESS]'}

Dear Sir/Madam,

RE: LEASEHOLD PROPERTY - ${caseData.property_address}
BORROWER: ${caseData.debtor_name}

We write to notify you of outstanding service charge arrears on the above leasehold property, which we understand is subject to a mortgage in your favor.

ORIGINAL DEBT: £${parseFloat(caseData.debt_amount).toFixed(2)}
LEGAL COSTS TO DATE: £${parseFloat(caseData.total_costs || 0).toFixed(2)}
TOTAL AMOUNT DUE: £${(parseFloat(caseData.debt_amount) + parseFloat(caseData.total_costs || 0)).toFixed(2)}

Despite sending two Letters Before Action, the borrower has failed to make payment. Under the terms of the lease, these charges constitute a charge on the property and rank in priority to your mortgage.

We respectfully request that you settle this amount within 28 days to protect your security. If we do not receive payment, we will be compelled to issue County Court proceedings which will result in further costs.

Please confirm receipt and your intentions regarding this matter.

Yours faithfully,
[Property Manager Name]
[Management Company]`;
        break;

      default:
        return res.status(400).json({ error: 'Invalid document type' });
    }

    // Log document generation
    documents.push({
      id: documentIdCounter++,
      case_id: caseData.id,
      document_type: documentType,
      created_at: new Date().toISOString()
    });

    res.json({ content: documentContent, documentType });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve React app for all other routes in production
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');

  // Try different possible paths for index.html
  const possibleIndexPaths = [
    path.join(__dirname, '../client/build/index.html'),
    path.join(process.cwd(), 'client/build/index.html'),
    path.join(__dirname, '../../client/build/index.html')
  ];

  let indexPath = null;
  for (const tryPath of possibleIndexPaths) {
    if (fs.existsSync(tryPath)) {
      indexPath = tryPath;
      console.log('✓ Found index.html at:', indexPath);
      break;
    }
  }

  app.get('*', (req, res) => {
    if (indexPath) {
      res.sendFile(indexPath);
    } else {
      res.status(500).send('Application build not found. Please contact support.');
    }
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('In-memory database initialized');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
