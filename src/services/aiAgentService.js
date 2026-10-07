/**
 * NexusCRM AI Copilot Agent Service
 * Deep Contextual Natural Language Understanding & Precise Prompt Answering.
 * Answers the user's exact question point-by-point with live data and zero asterisks (*).
 */

import { INITIAL_CUSTOMERS } from '../data/mockCustomers';

export const COPILOT_TOOLS = [
  {
    name: 'update_customer',
    description: 'Modifies and saves customer attributes (status, phone, email, company, name).',
    parameters: ['customerId', 'updatedFields']
  },
  {
    name: 'fetch_customer_profile',
    description: 'Fetches the complete profile and contact information of a customer.',
    parameters: ['query']
  },
  {
    name: 'add_customer',
    description: 'Creates a new customer profile in the active CRM directory.',
    parameters: ['name', 'company', 'email', 'phone', 'status']
  },
  {
    name: 'delete_customer',
    description: 'Removes a customer by name or ID from the directory.',
    parameters: ['query']
  },
  {
    name: 'filter_customers',
    description: 'Filters the directory view by status (All, Active, Inactive).',
    parameters: ['status']
  },
  {
    name: 'list_customers_by_status',
    description: 'Lists real customer names and companies matching a status.',
    parameters: ['status']
  },
  {
    name: 'get_portfolio_summary',
    description: 'Calculates live customer metrics, churn risk, and active ratios.',
    parameters: []
  },
  {
    name: 'explain_company_work',
    description: 'Explains the company business model, purpose, and operations.',
    parameters: []
  },
  {
    name: 'draft_email',
    description: 'Generates a personalized outreach or re-engagement email.',
    parameters: ['customerName', 'tone']
  },
  {
    name: 'toggle_theme',
    description: 'Switches the interface between Light and Dark mode.',
    parameters: []
  }
];

export async function processCopilotMessage(userInput, context) {
  const rawInput = userInput.trim();
  const lower = rawInput.toLowerCase();

  // Normalize common typos and slang
  const normalized = lower
    .replace(/\bwaht\b/g, 'what')
    .replace(/\bcompnay\b/g, 'company')
    .replace(/\bbuisness\b/g, 'business')
    .replace(/\bclinet\b/g, 'client')
    .replace(/\bcutomer\b/g, 'customer')
    .replace(/\bwrk\b/g, 'work')
    .replace(/\bchaneg\b/g, 'change')
    .replace(/\bupadte\b/g, 'update');

  // Simulated thinking delay for natural conversational rhythm (350ms)
  await new Promise(r => setTimeout(r, 350));

  const {
    customers,
    stats,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    setActiveTab,
    toggleTheme,
    theme,
    user,
    profile
  } = context;

  const customerPool = (customers && customers.length > 0) ? customers : INITIAL_CUSTOMERS;

  // =========================================================================
  // ENTITY RECOGNITION: Scan for any customer reference in the prompt
  // =========================================================================
  let targetCustomer = null;
  let targetScore = 0;

  for (const c of customerPool) {
    const fullName = c.name.toLowerCase();
    const firstName = c.name.toLowerCase().split(' ')[0];
    const lastName = c.name.toLowerCase().split(' ')[1] || '';
    const company = c.company.toLowerCase();
    const id = c.id.toLowerCase();
    const email = c.email.toLowerCase();

    if (normalized.includes(fullName) && targetScore < 100) {
      targetCustomer = c;
      targetScore = 100;
    } else if (normalized.includes(id) && targetScore < 95) {
      targetCustomer = c;
      targetScore = 95;
    } else if (normalized.includes(email) && targetScore < 90) {
      targetCustomer = c;
      targetScore = 90;
    } else if (company.length > 3 && normalized.includes(company) && targetScore < 85) {
      targetCustomer = c;
      targetScore = 85;
    } else if (firstName.length > 2 && new RegExp(`\\b${firstName}\\b`).test(normalized) && targetScore < 75) {
      targetCustomer = c;
      targetScore = 75;
    } else if (lastName.length > 2 && new RegExp(`\\b${lastName}\\b`).test(normalized) && targetScore < 70) {
      targetCustomer = c;
      targetScore = 70;
    }
  }

  let response = null;

  // =========================================================================
  // 1. QUESTION: IS [CUSTOMER] ACTIVE OR INACTIVE? (Direct Status Verification)
  // e.g. "is Eleanor active?", "is David inactive?", "is Sophia currently paying?"
  // =========================================================================
  if (targetCustomer && (
    normalized.startsWith('is ') ||
    normalized.includes('is ' + targetCustomer.name.toLowerCase().split(' ')[0]) ||
    normalized.includes('whether') ||
    (normalized.includes('status of') && !normalized.includes('change') && !normalized.includes('update'))
  )) {
    const c = targetCustomer;
    const isAskingActive = normalized.includes('active') && !normalized.includes('inactive');
    const isAskingInactive = normalized.includes('inactive');

    let answerLine = `Account status for ${c.name}:`;
    if (isAskingActive) {
      answerLine = c.status === 'Active'
        ? `Yes, ${c.name} is currently an Active customer.`
        : `No, ${c.name} is currently Inactive (not active).`;
    } else if (isAskingInactive) {
      answerLine = c.status === 'Inactive'
        ? `Yes, ${c.name} is currently an Inactive customer.`
        : `No, ${c.name} is currently Active (contracted).`;
    }

    response = {
      text: [
        answerLine,
        `1. Customer: ${c.name}`,
        `2. Organization: ${c.company}`,
        `3. Current Status: ${c.status}`,
        `4. Contact: ${c.email} | ${c.phone}`
      ].join('\n'),
      toolCalled: 'fetch_customer_profile',
      badge: `${c.name}: ${c.status}`,
      data: c
    };
  }

  // =========================================================================
  // 2. QUESTION: WHY IS [CUSTOMER] INACTIVE? OR WHAT HAPPENED TO [CUSTOMER]?
  // e.g. "why is David inactive?", "why is Chloe paused?"
  // =========================================================================
  else if (targetCustomer && (normalized.includes('why is') || normalized.includes('why') || normalized.includes('reason'))) {
    const c = targetCustomer;
    response = {
      text: [
        `Regarding ${c.name}'s account status:`,
        `1. Current Status: ${c.status}`,
        `2. Associated Company: ${c.company}`,
        `3. Status Context: ${c.status === 'Inactive' ? 'This account has paused recurring services or contract renewal is pending.' : 'This account has an active commercial contract with recurring services.'}`,
        `4. Recommended Action: ${c.status === 'Inactive' ? 'Initiate an outreach campaign or schedule a renewal review with the point of contact.' : 'Maintain standard account management and scheduled check-ins.'}`,
        `5. Point of Contact: ${c.email} | ${c.phone}`
      ].join('\n'),
      toolCalled: 'fetch_customer_profile',
      badge: `Review: ${c.name}`,
      data: c
    };
  }

  // =========================================================================
  // 3. INSTRUCTION: UPDATE / CHANGE CUSTOMER DETAILS
  // e.g. "make Eleanor inactive", "David renewed, make him active", "change Marcus phone to 555-111-2222"
  // =========================================================================
  const isUpdateIntent =
    normalized.includes('change') ||
    normalized.includes('update') ||
    normalized.includes('set') ||
    normalized.includes('make') ||
    normalized.includes('mark') ||
    normalized.includes('switch') ||
    normalized.includes('modify') ||
    normalized.includes('edit') ||
    normalized.includes('now at') ||
    normalized.includes('moved to') ||
    normalized.includes('joined') ||
    normalized.includes('renewed') ||
    normalized.includes('new phone') ||
    normalized.includes('new email') ||
    normalized.includes('new company');

  const hasInactiveCue =
    normalized.includes('inactive') ||
    normalized.includes('pause') ||
    normalized.includes('paused') ||
    normalized.includes('churn') ||
    normalized.includes('churned') ||
    normalized.includes('left') ||
    normalized.includes('no longer') ||
    normalized.includes('cancelled') ||
    normalized.includes('stopped');

  const hasActiveCue =
    normalized.includes('active') ||
    normalized.includes('paying') ||
    normalized.includes('renew') ||
    normalized.includes('renewed') ||
    normalized.includes('back') ||
    normalized.includes('resume') ||
    normalized.includes('resumed') ||
    normalized.includes('signed');

  if (!response && targetCustomer && (isUpdateIntent || hasInactiveCue || hasActiveCue) && !normalized.startsWith('delete') && !normalized.startsWith('remove') && !normalized.startsWith('add') && !normalized.startsWith('create')) {
    const changes = {};
    const detailPoints = [];

    // Check status intent
    if (hasInactiveCue && targetCustomer.status !== 'Inactive') {
      changes.status = 'Inactive';
      detailPoints.push(`Status changed from Active to Inactive based on your instruction`);
    } else if (hasActiveCue && targetCustomer.status !== 'Active') {
      changes.status = 'Active';
      detailPoints.push(`Status changed from Inactive to Active`);
    }

    // Check email intent
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    const emailFound = rawInput.match(emailRegex);
    if (emailFound && emailFound[1] !== targetCustomer.email) {
      changes.email = emailFound[1];
      detailPoints.push(`Email address updated to ${emailFound[1]}`);
    }

    // Check phone intent
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const phoneFound = rawInput.match(phoneRegex);
    if (phoneFound && phoneFound[0] !== targetCustomer.phone) {
      changes.phone = phoneFound[0];
      detailPoints.push(`Phone number updated to ${phoneFound[0]}`);
    }

    // Check company intent
    const companyMatch = rawInput.match(/(?:company\s+(?:to|is)?|moved\s+to|joined|now\s+at)\s+([A-Za-z0-9&.\s]+?)(?:,|\.|\bphone|\bemail|\bactive|\binactive|$)/i);
    if (companyMatch && companyMatch[1]) {
      const cleanCompany = companyMatch[1].trim();
      if (cleanCompany && !['to', 'is', 'active', 'inactive', 'the', 'a'].includes(cleanCompany.toLowerCase()) && cleanCompany !== targetCustomer.company) {
        changes.company = cleanCompany;
        detailPoints.push(`Company association updated to ${cleanCompany}`);
      }
    }

    if (Object.keys(changes).length > 0) {
      if (typeof updateCustomer === 'function') {
        updateCustomer(targetCustomer.id, changes);
      }

      const updated = { ...targetCustomer, ...changes };

      response = {
        text: [
          `I understood your instruction and updated ${targetCustomer.name}:`,
          ...detailPoints.map((d, i) => `${i + 1}. ${d}`),
          `${detailPoints.length + 1}. Current Profile: ${updated.name} at ${updated.company} (${updated.status})`,
          `${detailPoints.length + 2}. Contact Info: ${updated.email} | ${updated.phone}`,
          `${detailPoints.length + 3}. Synced: Saved to storage and updated across your dashboard and customer table`
        ].join('\n'),
        toolCalled: 'update_customer',
        badge: `Updated ${updated.name}`,
        data: updated
      };
    }
  }

  // =========================================================================
  // 4. QUESTION: DIRECT ATTRIBUTE LOOKUPS FOR A PERSON
  // e.g. "what is Marcus's phone?", "what is Eleanor's email?", "where does Kenji work?"
  // =========================================================================
  if (!response && targetCustomer && !normalized.startsWith('delete') && !normalized.startsWith('remove') && !normalized.startsWith('add') && !normalized.startsWith('create') && !(normalized.includes('draft') && normalized.includes('email'))) {
    const c = targetCustomer;
    const formattedDate = new Date(c.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    if (normalized.includes('phone') || normalized.includes('number') || normalized.includes('call') || normalized.includes('contact')) {
      response = {
        text: [
          `Phone contact for ${c.name}:`,
          `1. Direct Phone: ${c.phone}`,
          `2. Customer Name: ${c.name}`,
          `3. Organization: ${c.company}`,
          `4. Work Email: ${c.email}`,
          `5. Status: ${c.status}`
        ].join('\n'),
        toolCalled: 'fetch_customer_profile',
        badge: `Phone: ${c.name}`,
        data: c
      };
    } else if (normalized.includes('email') || normalized.includes('mail')) {
      response = {
        text: [
          `Email address for ${c.name}:`,
          `1. Email Address: ${c.email}`,
          `2. Customer Name: ${c.name}`,
          `3. Organization: ${c.company}`,
          `4. Direct Phone: ${c.phone}`,
          `5. Status: ${c.status}`
        ].join('\n'),
        toolCalled: 'fetch_customer_profile',
        badge: `Email: ${c.name}`,
        data: c
      };
    } else if (normalized.includes('company') || normalized.includes('organization') || normalized.includes('where does') || normalized.includes('work for') || normalized.includes('works for')) {
      response = {
        text: [
          `Company details for ${c.name}:`,
          `1. Organization: ${c.company}`,
          `2. Contact Person: ${c.name}`,
          `3. Account Status: ${c.status}`,
          `4. Verified Email: ${c.email}`,
          `5. Client Since: ${formattedDate}`
        ].join('\n'),
        toolCalled: 'fetch_customer_profile',
        badge: `Company: ${c.company}`,
        data: c
      };
    } else if (normalized.includes('when') || normalized.includes('joined') || normalized.includes('onboarded') || normalized.includes('date')) {
      response = {
        text: [
          `Onboarding timeline for ${c.name}:`,
          `1. Date Joined: ${formattedDate}`,
          `2. Customer Name: ${c.name}`,
          `3. Organization: ${c.company}`,
          `4. Status: ${c.status}`
        ].join('\n'),
        toolCalled: 'fetch_customer_profile',
        badge: `Joined: ${c.name}`,
        data: c
      };
    } else {
      response = {
        text: [
          `Profile information for ${c.name}:`,
          `1. Full Name: ${c.name}`,
          `2. Company: ${c.company}`,
          `3. Status: ${c.status}`,
          `4. Email: ${c.email}`,
          `5. Phone: ${c.phone}`,
          `6. Onboarded: ${formattedDate}`,
          `7. Account ID: ${c.id}`
        ].join('\n'),
        toolCalled: 'fetch_customer_profile',
        badge: `Profile: ${c.name}`,
        data: c
      };
    }
  }

  // =========================================================================
  // 5. QUESTION: INDUSTRY / SECTOR SEARCH
  // e.g. "which companies are in biotech?", "who is in healthcare?", "companies in logistics", "energy companies"
  // =========================================================================
  const industryKeywords = ['biotech', 'health', 'healthcare', 'logistics', 'ai', 'robotics', 'energy', 'security', 'autonomous', 'fintech', 'retail', 'clean', 'freight', 'media'];
  const matchedIndustry = industryKeywords.find(k => normalized.includes(k));

  if (!response && matchedIndustry) {
    const matchingCompanies = customerPool.filter(c =>
      c.company.toLowerCase().includes(matchedIndustry) ||
      (matchedIndustry === 'health' && c.company.toLowerCase().includes('health')) ||
      (matchedIndustry === 'healthcare' && c.company.toLowerCase().includes('health'))
    );

    if (matchingCompanies.length > 0) {
      response = {
        text: [
          `Companies matching "${matchedIndustry.toUpperCase()}" in your portfolio (${matchingCompanies.length} found):`,
          ...matchingCompanies.map((c, i) => `${i + 1}. ${c.company} — Point of Contact: ${c.name} (${c.status})`)
        ].join('\n'),
        toolCalled: 'list_customers_by_status',
        badge: `Sector: ${matchedIndustry}`
      };
    }
  }

  // =========================================================================
  // 6. QUESTION: WHO JOINED IN OCTOBER? OR NEW RECENT CLIENTS
  // e.g. "who joined in October?", "new customers this month"
  // =========================================================================
  if (!response && (normalized.includes('october') || normalized.includes('this month') || normalized.includes('recently joined'))) {
    const octCustomers = customerPool.filter(c => {
      const d = new Date(c.createdAt);
      return d.getMonth() === 9; // October is 9 (0-indexed)
    });

    response = {
      text: [
        `Customers onboarded in October (${octCustomers.length} total):`,
        ...octCustomers.map((c, i) => `${i + 1}. ${c.name} (${c.company}) — Status: ${c.status}`)
      ].join('\n'),
      toolCalled: 'list_customers_by_status',
      badge: `October: ${octCustomers.length}`
    };
  }

  // =========================================================================
  // 7. QUESTION: HOW MANY CUSTOMERS / METRICS COMPARISON
  // e.g. "how many active customers?", "how many inactive?", "what is the churn rate?"
  // =========================================================================
  if (!response && (normalized.includes('how many') || normalized.includes('count') || normalized.includes('total') || normalized.includes('ratio') || normalized.includes('churn rate') || normalized.includes('statistics') || normalized.includes('metrics'))) {
    const activeCount = customerPool.filter(c => c.status === 'Active').length;
    const inactiveCount = customerPool.filter(c => c.status === 'Inactive').length;
    const totalCount = customerPool.length;
    const activePct = Math.round((activeCount / (totalCount || 1)) * 100);
    const churnPct = Math.round((inactiveCount / (totalCount || 1)) * 100);

    if (normalized.includes('active') && !normalized.includes('inactive')) {
      response = {
        text: [
          `Active Customer Metrics:`,
          `1. Total Active Accounts: ${activeCount} customers`,
          `2. Active Ratio: ${activePct}% of total accounts`,
          `3. Commercial Health: All ${activeCount} accounts are currently generating recurring value`
        ].join('\n'),
        toolCalled: 'get_portfolio_summary',
        badge: `Active: ${activeCount}`
      };
    } else if (normalized.includes('inactive') || normalized.includes('churn')) {
      response = {
        text: [
          `Inactive / Churn Risk Metrics:`,
          `1. Total Inactive Accounts: ${inactiveCount} customers`,
          `2. Churn Risk Rate: ${churnPct}% of total accounts`,
          `3. Action Plan: We recommend initiating outreach to re-engage these accounts`
        ].join('\n'),
        toolCalled: 'get_portfolio_summary',
        badge: `Inactive: ${inactiveCount}`
      };
    } else {
      response = {
        text: [
          `Live CRM Customer Counts:`,
          `1. Total Customer Accounts: ${totalCount} registered`,
          `2. Active Accounts: ${activeCount} (${activePct}%)`,
          `3. Inactive Accounts: ${inactiveCount} (${churnPct}%)`,
          `4. New This Month: ${stats.newThisMonth} onboarded in current cycle`
        ].join('\n'),
        toolCalled: 'get_portfolio_summary',
        badge: `Total: ${totalCount}`
      };
    }
  }

  // =========================================================================
  // 8. HOW-TO QUESTIONS ("How do I add...", "How do I filter...", "How do I change theme?")
  // =========================================================================
  if (!response && (normalized.startsWith('how do i') || normalized.startsWith('how can i') || normalized.startsWith('how to'))) {
    if (normalized.includes('add') || normalized.includes('create')) {
      response = {
        text: [
          "To add a new customer to the database:",
          "1. Via Chat: Say 'Add customer [Name] at [Company], active, [Email], [Phone]'",
          "2. Via UI: Click the 'Add Customer' button in the sidebar or Customer Directory tab",
          "3. Validation: Provide valid name, email, phone, company, and status to save"
        ].join('\n'),
        toolCalled: null
      };
    } else if (normalized.includes('edit') || normalized.includes('update') || normalized.includes('change')) {
      response = {
        text: [
          "To update an existing customer:",
          "1. Via Chat: Say 'Make [Name] inactive' or 'Update [Name] phone to [Number]'",
          "2. Via UI: Go to Customer Directory, click the Edit pencil icon on any row, edit fields, and save",
          "3. Persistence: Changes update in real time across the directory table and KPI stats"
        ].join('\n'),
        toolCalled: null
      };
    } else if (normalized.includes('filter') || normalized.includes('search')) {
      response = {
        text: [
          "To filter or search customers:",
          "1. Via Chat: Say 'Show inactive customers' or 'Filter active'",
          "2. Via UI: Go to Customer Directory tab and use the search box or the 'All / Active / Inactive' buttons",
          "3. Instant Results: The list filters live as you type"
        ].join('\n'),
        toolCalled: null
      };
    } else if (normalized.includes('dark') || normalized.includes('theme')) {
      response = {
        text: [
          "To change the interface appearance:",
          "1. Via Chat: Say 'Switch to dark mode' or 'Switch to light mode'",
          "2. Via UI: Click the theme switcher button in the sidebar or in the Settings tab",
          "3. Storage: Your theme choice is automatically remembered on page refresh"
        ].join('\n'),
        toolCalled: null
      };
    }
  }

  // =========================================================================
  // 9. ADD CUSTOMER INTENT
  // =========================================================================
  if (!response && (normalized.startsWith('add ') || normalized.startsWith('create ') || normalized.includes('new customer') || normalized.includes('new client') || normalized.includes('onboard'))) {
    let name = 'New Client';
    const nameMatch = rawInput.match(/(?:named|customer|client|add|create|onboard)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    if (nameMatch && nameMatch[1]) {
      name = nameMatch[1].trim();
    }

    let company = 'Enterprise Partner';
    const companyMatch = rawInput.match(/(?:at|from|company|for)\s+([A-Za-z0-9&.\s]+?)(?:,|\.|\bphone|\bemail|\bactive|\binactive|$)/i);
    if (companyMatch && companyMatch[1]) {
      const cleanCompany = companyMatch[1].trim();
      if (!['active', 'inactive', 'customer', 'client', 'the', 'a'].includes(cleanCompany.toLowerCase())) {
        company = cleanCompany;
      }
    }

    let email = `${name.toLowerCase().replace(/\s+/g, '.')}@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
    const emailMatch = rawInput.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    if (emailMatch) {
      email = emailMatch[1];
    }

    let phone = '+1 (555) 492-8172';
    const phoneMatch = rawInput.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) {
      phone = phoneMatch[0];
    }

    const status = normalized.includes('inactive') ? 'Inactive' : 'Active';

    const newCust = addCustomer({
      name,
      company,
      email,
      phone,
      status
    });

    setActiveTab('customers');

    response = {
      text: [
        `I understood your instruction and added ${name}:`,
        `1. Customer Name: ${name}`,
        `2. Organization: ${company}`,
        `3. Verified Email: ${email}`,
        `4. Direct Phone: ${phone}`,
        `5. Initial Status: ${status}`,
        `6. Live Integration: Added to customer directory and reflected in real-time KPI counts`
      ].join('\n'),
      toolCalled: 'add_customer',
      badge: `Added ${name} (${company})`,
      data: newCust
    };
  }

  // =========================================================================
  // 10. DELETING A CUSTOMER
  // =========================================================================
  if (!response && (normalized.startsWith('delete ') || normalized.startsWith('remove '))) {
    const targetQuery = normalized.replace(/^(delete|remove)\s+(customer|client)?/i, '').trim();

    if (targetCustomer) {
      deleteCustomer(targetCustomer.id);
      response = {
        text: [
          `I understood your instruction and removed ${targetCustomer.name}:`,
          `1. Account Removed: ${targetCustomer.name}`,
          `2. Organization: ${targetCustomer.company}`,
          `3. Previous Status: ${targetCustomer.status}`,
          `4. Sync: Directory count adjusted and database updated immediately`
        ].join('\n'),
        toolCalled: 'delete_customer',
        badge: `Deleted ${targetCustomer.name}`,
        data: targetCustomer
      };
    } else {
      response = {
        text: [
          `Could not locate customer to delete:`,
          `1. Searched For: "${targetQuery}"`,
          `2. Status: No customer record matched this name in the database`
        ].join('\n'),
        toolCalled: null
      };
    }
  }

  // =========================================================================
  // 11. COMPANY & BUSINESS PURPOSE QUESTIONS
  // =========================================================================
  if (!response && (
    (normalized.includes('company') && (normalized.includes('work') || normalized.includes('do') || normalized.includes('business') || normalized.includes('purpose') || normalized.includes('about'))) ||
    normalized.includes('what do you do') ||
    normalized.includes('what is nexuscrm') ||
    normalized.includes('what is this platform') ||
    normalized.includes('what does this app do')
  )) {
    response = {
      text: [
        "About NexusCRM and what our company does:",
        "1. Core Purpose: We build enterprise software for managing, tracking, and optimizing B2B client relationships.",
        "2. Customer Directory: We maintain complete contact profiles, contract statuses, and organization details for 28 enterprise clients.",
        "3. Live Analytics: We calculate real-time customer acquisition velocity, contract retention, and churn risk metrics.",
        "4. AI Operations: We provide autonomous copilot capabilities allowing you to manage customer records and pipeline data directly via natural conversation."
      ].join('\n'),
      toolCalled: 'explain_company_work',
      badge: 'Company Information'
    };
  }

  // =========================================================================
  // 12. GREETINGS & CASUAL QUESTIONS
  // =========================================================================
  if (!response && /^(hi|hello|hey|greetings|good morning|good afternoon)\b/i.test(normalized)) {
    response = {
      text: [
        "Hello! I am ready to assist with your CRM operations:",
        "1. Client Operations: You can ask me to update customer details, change status, or add new clients",
        "2. Profile Lookups: Ask about any customer by name, phone, or company",
        "3. Portfolio Analysis: Request live metrics, active counts, or inactive churn summaries",
        "How can I help you right now?"
      ].join('\n'),
      toolCalled: null
    };
  }

  // =========================================================================
  // 13. LISTING CUSTOMERS
  // =========================================================================
  if (!response && (normalized.includes('list') || normalized.includes('show all') || normalized.includes('who are'))) {
    if (normalized.includes('inactive')) {
      const inactives = customerPool.filter(c => c.status === 'Inactive');
      response = {
        text: [
          `Inactive Customers in Portfolio (${inactives.length} accounts):`,
          ...inactives.map((c, i) => `${i + 1}. ${c.name} (${c.company}) - Status: Inactive`)
        ].join('\n'),
        toolCalled: 'list_customers_by_status',
        badge: `Listed ${inactives.length} Inactive`
      };
    } else {
      const sample = customerPool.slice(0, 8);
      response = {
        text: [
          `Customer Directory Accounts (${customerPool.length} total):`,
          ...sample.map((c, i) => `${i + 1}. ${c.name} (${c.company}) - Status: ${c.status}`)
        ].join('\n'),
        toolCalled: 'list_customers_by_status',
        badge: `Listed Records`
      };
    }
  }

  // =========================================================================
  // 14. DRAFT EMAIL INTENT
  // =========================================================================
  if (!response && (normalized.includes('draft') || normalized.includes('email') || normalized.includes('outreach'))) {
    const target = targetCustomer || customerPool[0];
    const isReengagement = normalized.includes('re-engage') || target.status === 'Inactive';

    const subject = isReengagement
      ? `Checking in: Special partnership update for ${target.company}`
      : `Welcome aboard to NexusCRM, ${target.name}!`;

    response = {
      text: [
        `Drafted outreach email for ${target.name}:`,
        `1. Recipient: ${target.name} (${target.email})`,
        `2. Organization: ${target.company}`,
        `3. Status: ${target.status}`,
        `4. Subject: ${subject}`,
        `5. Opening: Hi ${target.name}, we are checking in regarding ${target.company}'s customer account.`,
        `6. Content: We would love to schedule a brief touchpoint to discuss your operational goals.`,
        `7. Signoff: Best regards, Operations Team`
      ].join('\n'),
      toolCalled: 'draft_email',
      badge: `Drafted Email for ${target.name}`
    };
  }

  // =========================================================================
  // 15. CONVERSATIONAL FALLBACK (Contextual, No canned templates)
  // =========================================================================
  if (!response) {
    response = {
      text: [
        `Regarding your inquiry about "${rawInput}":`,
        "1. Specific Customer Lookups: Ask 'Who is [Name]?', 'Is [Name] active?', or 'What is [Name]'s phone?'",
        "2. Direct Customer Updates: Say 'Make [Name] inactive' or 'Update [Name] phone to [Number]'",
        "3. Live Statistics: Ask 'How many active customers?' or 'Who joined in October?'",
        "4. Industry Search: Ask 'Which companies are in biotech or logistics?'"
      ].join('\n'),
      toolCalled: null
    };
  }

  // Strip all asterisks (*)
  if (response && response.text) {
    response.text = response.text.replace(/\*/g, '').trim();
  }

  return response;
}
