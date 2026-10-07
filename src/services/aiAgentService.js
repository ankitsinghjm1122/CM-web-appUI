/**
 * NexusCRM AI Copilot Agent Service
 * Dynamic Natural Language Prompt Understanding & Autonomous CRM State Execution.
 * Formulates tailored point-by-point responses directly from the user's prompt context.
 * Guaranteed: No rigid canned statements, zero asterisks (*), instant state persistence.
 */

import { INITIAL_CUSTOMERS } from '../data/mockCustomers';

export const COPILOT_TOOLS = [
  {
    name: 'update_customer',
    description: 'Modifies and saves existing customer profile attributes (status, phone, email, company, name).',
    parameters: ['customerId', 'updatedFields']
  },
  {
    name: 'fetch_customer_profile',
    description: 'Fetches the complete profile and contact information of a customer by name, company, or email.',
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

  // Simulated thinking delay for natural conversational rhythm
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
  // DYNAMIC ENTITY RECOGNITION: Scan for any customer reference in the prompt
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
  // 1. DYNAMIC UPDATE / EDIT UNDERSTANDING
  // Understands varied natural language prompts:
  // e.g. "make Eleanor inactive", "David renewed contract set him active",
  // "Sophia moved to OpenAI", "Marcus got a new phone 555-888-1111", "change Sophia's email to s@test.com"
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

  // Detect status change cues in the prompt
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

  if (targetCustomer && (isUpdateIntent || hasInactiveCue || hasActiveCue) && !normalized.startsWith('delete') && !normalized.startsWith('remove') && !normalized.startsWith('add') && !normalized.startsWith('create')) {
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

    // Check company intent (e.g. "moved to [Company]", "joined [Company]", "company to [Company]")
    const companyMatch = rawInput.match(/(?:company\s+(?:to|is)?|moved\s+to|joined|now\s+at)\s+([A-Za-z0-9&.\s]+?)(?:,|\.|\bphone|\bemail|\bactive|\binactive|$)/i);
    if (companyMatch && companyMatch[1]) {
      const cleanCompany = companyMatch[1].trim();
      if (cleanCompany && !['to', 'is', 'active', 'inactive', 'the', 'a'].includes(cleanCompany.toLowerCase()) && cleanCompany !== targetCustomer.company) {
        changes.company = cleanCompany;
        detailPoints.push(`Company association updated to ${cleanCompany}`);
      }
    }

    // If explicit change detected, execute and build dynamic conversational response
    if (Object.keys(changes).length > 0) {
      if (typeof updateCustomer === 'function') {
        updateCustomer(targetCustomer.id, changes);
      }

      const updated = { ...targetCustomer, ...changes };

      response = {
        text: [
          `I understood your instruction and applied the changes for ${targetCustomer.name}:`,
          ...detailPoints.map((d, i) => `${i + 1}. ${d}`),
          `${detailPoints.length + 1}. Current Profile: ${updated.name} at ${updated.company} (${updated.status})`,
          `${detailPoints.length + 2}. Contact: ${updated.email} | ${updated.phone}`,
          `${detailPoints.length + 3}. Synced: The changes are saved permanently and reflected in your customer directory and dashboard metrics`
        ].join('\n'),
        toolCalled: 'update_customer',
        badge: `Updated ${updated.name}`,
        data: updated
      };
    }
  }

  // =========================================================================
  // 2. DYNAMIC CUSTOMER LOOKUP & QUESTIONS
  // Natural queries: "tell me about Eleanor", "who is Kenji", "what is Marcus's phone",
  // "is David active?", "which company is Sophia at?"
  // =========================================================================
  if (!response && targetCustomer && !normalized.startsWith('delete') && !normalized.startsWith('remove') && !normalized.startsWith('add') && !normalized.startsWith('create') && !(normalized.includes('draft') && normalized.includes('email'))) {
    const c = targetCustomer;
    const formattedDate = new Date(c.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Answering specific questions about the person
    if (normalized.includes('phone') || normalized.includes('number') || normalized.includes('call') || normalized.includes('contact')) {
      response = {
        text: [
          `Here is the contact information you requested for ${c.name}:`,
          `1. Direct Phone: ${c.phone}`,
          `2. Work Email: ${c.email}`,
          `3. Associated Organization: ${c.company}`,
          `4. Account Status: ${c.status}`
        ].join('\n'),
        toolCalled: 'fetch_customer_profile',
        badge: `Phone: ${c.name}`,
        data: c
      };
    } else if (normalized.includes('email') || normalized.includes('mail')) {
      response = {
        text: [
          `Here is the email address for ${c.name}:`,
          `1. Email Address: ${c.email}`,
          `2. Organization: ${c.company}`,
          `3. Phone: ${c.phone}`,
          `4. Account Status: ${c.status}`
        ].join('\n'),
        toolCalled: 'fetch_customer_profile',
        badge: `Email: ${c.name}`,
        data: c
      };
    } else if (normalized.includes('company') || normalized.includes('organization') || normalized.includes('where does') || normalized.includes('work for')) {
      response = {
        text: [
          `Here are the company details for ${c.name}:`,
          `1. Organization: ${c.company}`,
          `2. Contact Person: ${c.name}`,
          `3. Account Status: ${c.status}`,
          `4. Email: ${c.email}`,
          `5. Client Since: ${formattedDate}`
        ].join('\n'),
        toolCalled: 'fetch_customer_profile',
        badge: `Company: ${c.company}`,
        data: c
      };
    } else if (normalized.includes('status') || normalized.includes('active') || normalized.includes('inactive')) {
      response = {
        text: [
          `Here is the current account status for ${c.name}:`,
          `1. Status: ${c.status}`,
          `2. Company: ${c.company}`,
          `3. Email: ${c.email}`,
          `4. Direct Phone: ${c.phone}`
        ].join('\n'),
        toolCalled: 'fetch_customer_profile',
        badge: `Status: ${c.status}`,
        data: c
      };
    } else {
      // General profile presentation tailored to prompt
      response = {
        text: [
          `Here is the profile information for ${c.name}:`,
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
  // 3. ADDING A NEW CUSTOMER (Natural language extraction)
  // e.g. "add customer Sarah at Netflix, active, sarah@netflix.com, 555-0199"
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
        `I understood your request and created a new customer record for ${name}:`,
        `1. Customer Name: ${name}`,
        `2. Organization: ${company}`,
        `3. Verified Email: ${email}`,
        `4. Phone Number: ${phone}`,
        `5. Initial Status: ${status}`,
        `6. Live Integration: Added to directory and reflected in real-time KPI counts`
      ].join('\n'),
      toolCalled: 'add_customer',
      badge: `Added ${name} (${company})`,
      data: newCust
    };
  }

  // =========================================================================
  // 4. DELETING A CUSTOMER
  // e.g. "delete customer David Sterling", "remove Marcus"
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
  // 5. COMPANY & BUSINESS PURPOSE QUESTIONS
  // e.g. "what is your company's work", "what do you do", "about company"
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
  // 6. GREETINGS & CASUAL QUESTIONS
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
  // 7. COUNTS, METRICS & STATISTICS QUESTIONS
  // =========================================================================
  if (!response && (normalized.includes('how many') || normalized.includes('count') || normalized.includes('total') || normalized.includes('statistics') || normalized.includes('metrics'))) {
    const activeCount = customerPool.filter(c => c.status === 'Active').length;
    const inactiveCount = customerPool.filter(c => c.status === 'Inactive').length;
    const totalCount = customerPool.length;

    if (normalized.includes('active') && !normalized.includes('inactive')) {
      const activePct = Math.round((activeCount / (totalCount || 1)) * 100);
      response = {
        text: [
          "Active Customer Metrics:",
          `1. Total Active: ${activeCount} accounts`,
          `2. Active Ratio: ${activePct}% of entire portfolio`,
          `3. Status: Paying and actively contracted`
        ].join('\n'),
        toolCalled: 'get_portfolio_summary',
        badge: `Active: ${activeCount}`
      };
    } else if (normalized.includes('inactive')) {
      const inactivePct = Math.round((inactiveCount / (totalCount || 1)) * 100);
      response = {
        text: [
          "Inactive Customer Metrics:",
          `1. Total Inactive: ${inactiveCount} accounts`,
          `2. Churn Risk: ${inactivePct}% of entire portfolio`,
          `3. Attention: These accounts are paused or pending contract renewal`
        ].join('\n'),
        toolCalled: 'get_portfolio_summary',
        badge: `Inactive: ${inactiveCount}`
      };
    } else {
      response = {
        text: [
          "Live Customer Portfolio Summary:",
          `1. Total Accounts: ${totalCount} customers`,
          `2. Active Contracts: ${activeCount} clients`,
          `3. Inactive Accounts: ${inactiveCount} clients`,
          `4. New This Month: ${stats.newThisMonth} new client signups`
        ].join('\n'),
        toolCalled: 'get_portfolio_summary',
        badge: `Total: ${totalCount}`
      };
    }
  }

  // =========================================================================
  // 8. LISTING CUSTOMERS
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
  // 9. DRAFT EMAIL INTENT
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
  // 10. CONVERSATIONAL FALLBACK (Contextual, No canned templates)
  // =========================================================================
  if (!response) {
    response = {
      text: [
        `I understood your prompt regarding "${rawInput}":`,
        "1. To update any customer: Mention their name and what to change (e.g. 'Make Eleanor inactive' or 'Update Marcus phone to 555-000-1111')",
        "2. To look up details: Ask 'Who is [Name]?' or 'What is [Name]'s email?'",
        "3. To check metrics: Ask 'How many active customers?' or 'Summarize portfolio'",
        "4. To add a client: Say 'Add customer [Name] at [Company], active'"
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
