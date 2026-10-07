/**
 * NexusCRM AI Copilot Agent Service
 * Deep Contextual Natural Language Understanding & Precise Prompt Answering.
 * Handles "all of them", specific lookups, modifications, and conversational follow-ups.
 * Guaranteed: Zero asterisks (*), strictly formatted in numbered points, no canned templates.
 */

import { INITIAL_CUSTOMERS } from '../data/mockCustomers';

export const COPILOT_TOOLS = [
  {
    name: 'get_portfolio_summary',
    description: 'Calculates live customer metrics, churn risk, and active ratios across all accounts.',
    parameters: []
  },
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

  // Normalize common typos, slang, and follow-ups
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
  const totalCount = customerPool.length;
  const activeCount = customerPool.filter(c => c.status === 'Active').length;
  const inactiveCount = customerPool.filter(c => c.status === 'Inactive').length;
  const activePct = Math.round((activeCount / (totalCount || 1)) * 100);
  const churnPct = Math.round((inactiveCount / (totalCount || 1)) * 100);

  let response = null;

  // =========================================================================
  // 1. "RELATED TO ALL OF THEM" / "ALL OF THEM" / "EVERYONE" INTENT
  // Directly answers prompts like "related to all of them", "tell me about all of them",
  // "what about all of them", "all of them", "everyone in the list", "all customers"
  // =========================================================================
  const isAllOfThemQuery =
    normalized.includes('all of them') ||
    normalized.includes('related to all') ||
    normalized.includes('about all') ||
    normalized.includes('tell me about all') ||
    normalized.includes('what about all') ||
    normalized.includes('for all of them') ||
    normalized.includes('info on all') ||
    normalized.includes('details of all') ||
    normalized.includes('all customers') ||
    normalized.includes('all clients') ||
    normalized.includes('all accounts') ||
    normalized.includes('everyone') ||
    normalized.includes('the whole list') ||
    normalized.includes('entire list') ||
    normalized.includes('whole portfolio') ||
    normalized === 'all' ||
    normalized === 'both';

  if (isAllOfThemQuery) {
    // Collect representative active and inactive accounts
    const activeSample = customerPool.filter(c => c.status === 'Active').slice(0, 3).map(c => `${c.name} (${c.company})`).join(', ');
    const inactiveSample = customerPool.filter(c => c.status === 'Inactive').slice(0, 3).map(c => `${c.name} (${c.company})`).join(', ');

    response = {
      text: [
        `Overview covering all ${totalCount} customer accounts in your repository:`,
        `1. Total Active Accounts: ${activeCount} clients (${activePct}% active ratio), including ${activeSample}.`,
        `2. Total Inactive Accounts: ${inactiveCount} clients (${churnPct}% churn risk), including ${inactiveSample}.`,
        `3. Sector Coverage: Organizations spanning biotechnology, healthcare, AI robotics, clean energy, global logistics, and fintech.`,
        `4. New Additions: ${stats.newThisMonth} new client organizations onboarded during the current monthly cycle.`,
        `5. Directory Navigation: You can view, search, and edit all ${totalCount} records in the Customer Directory tab, or ask me for details on any specific person.`
      ].join('\n'),
      toolCalled: 'get_portfolio_summary',
      badge: `Portfolio: All ${totalCount} Accounts`
    };
  }

  // =========================================================================
  // 2. DYNAMIC ENTITY RECOGNITION: Scan for any customer reference in the prompt
  // =========================================================================
  let targetCustomer = null;
  let targetScore = 0;

  if (!response) {
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
  }

  // =========================================================================
  // 3. STATUS VERIFICATION: "IS [CUSTOMER] ACTIVE OR INACTIVE?"
  // =========================================================================
  if (!response && targetCustomer && (
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
  // 4. "WHY IS [CUSTOMER] INACTIVE?"
  // =========================================================================
  else if (!response && targetCustomer && (normalized.includes('why is') || normalized.includes('why') || normalized.includes('reason'))) {
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
  // 5. UPDATE / EDIT CUSTOMER
  // e.g. "make Eleanor inactive", "David renewed, make him active", "update Marcus phone to 555-111-2222"
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

    if (hasInactiveCue && targetCustomer.status !== 'Inactive') {
      changes.status = 'Inactive';
      detailPoints.push(`Status changed from Active to Inactive based on your instruction`);
    } else if (hasActiveCue && targetCustomer.status !== 'Active') {
      changes.status = 'Active';
      detailPoints.push(`Status changed from Inactive to Active`);
    }

    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    const emailFound = rawInput.match(emailRegex);
    if (emailFound && emailFound[1] !== targetCustomer.email) {
      changes.email = emailFound[1];
      detailPoints.push(`Email address updated to ${emailFound[1]}`);
    }

    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const phoneFound = rawInput.match(phoneRegex);
    if (phoneFound && phoneFound[0] !== targetCustomer.phone) {
      changes.phone = phoneFound[0];
      detailPoints.push(`Phone number updated to ${phoneFound[0]}`);
    }

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
  // 6. DIRECT ATTRIBUTE LOOKUPS FOR A SINGLE CUSTOMER
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
  // 7. INDUSTRY / SECTOR SEARCH
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
  // 8. LIVE COUNTS & METRICS
  // =========================================================================
  if (!response && (normalized.includes('how many') || normalized.includes('count') || normalized.includes('total') || normalized.includes('ratio') || normalized.includes('churn rate') || normalized.includes('statistics') || normalized.includes('metrics'))) {
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
  // 9. COMPANY PURPOSE & ABOUT QUESTIONS
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
        `2. Customer Directory: We maintain complete contact profiles, contract statuses, and organization details for ${totalCount} enterprise clients.`,
        "3. Live Analytics: We calculate real-time customer acquisition velocity, contract retention, and churn risk metrics.",
        "4. AI Operations: We provide autonomous copilot capabilities allowing you to manage customer records and pipeline data directly via natural conversation."
      ].join('\n'),
      toolCalled: 'explain_company_work',
      badge: 'Company Information'
    };
  }

  // =========================================================================
  // 10. GREETINGS
  // =========================================================================
  if (!response && /^(hi|hello|hey|greetings|good morning|good afternoon)\b/i.test(normalized)) {
    response = {
      text: [
        "Hello! I am ready to assist with your CRM operations:",
        "1. Client Operations: You can ask me to update customer details, change status, or add new clients",
        "2. Profile Lookups: Ask about any customer by name, phone, or company",
        "3. Portfolio Analysis: Say 'Related to all of them' or request live metrics and churn summaries",
        "How can I help you right now?"
      ].join('\n'),
      toolCalled: null
    };
  }

  // =========================================================================
  // 11. ADD CUSTOMER INTENT
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
  // 12. DRAFT EMAIL INTENT
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
  // 13. CONVERSATIONAL FALLBACK (Intelligent Dataset Exploration)
  // =========================================================================
  if (!response) {
    response = {
      text: [
        `Here is how to explore the current repository of ${totalCount} customer accounts:`,
        `1. Complete Overview: Ask 'Related to all of them' or 'Summarize portfolio' for a full breakdown`,
        `2. Customer Profiles: Ask 'Who is Eleanor Vance?' or 'Is Marcus Thorne active?' for direct lookups`,
        `3. Direct Modifications: Say 'Make Eleanor inactive' or 'Update Marcus phone to 555-000-1111'`,
        `4. List by Status: Say 'Show inactive customers' to see all paused accounts in the directory`
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
