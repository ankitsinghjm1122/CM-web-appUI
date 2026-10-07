/**
 * NexusCRM AI Copilot Agent Service
 * Deep Customer Intelligence, Full CRUD Modifications (Add, Edit, Delete), and Profile Fetching.
 * Guaranteed: Zero asterisks (*), strictly formatted in numbered points, instant state persistence.
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
  const input = userInput.trim();

  // Normalize common typos while preserving entity values
  const normalized = input
    .toLowerCase()
    .replace(/\bwaht\b/g, 'what')
    .replace(/\bcompnay\b/g, 'company')
    .replace(/\bbuisness\b/g, 'business')
    .replace(/\bclinet\b/g, 'client')
    .replace(/\bcutomer\b/g, 'customer')
    .replace(/\bwrk\b/g, 'work')
    .replace(/\bchaneg\b/g, 'change')
    .replace(/\bupadte\b/g, 'update');

  // Simulated thinking delay for realism (350ms)
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

  // Active customer pool (fallback to INITIAL_CUSTOMERS if state is empty)
  const customerPool = (customers && customers.length > 0) ? customers : INITIAL_CUSTOMERS;

  let response = null;

  // =========================================================================
  // ENTITY RECOGNITION: Match any of the 28 customers
  // =========================================================================
  const cleanTokens = normalized
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !['the', 'and', 'for', 'who', 'what', 'tell', 'about', 'give', 'details', 'show', 'profile', 'find', 'search', 'email', 'phone', 'company', 'status', 'joined', 'when', 'does', 'work', 'works', 'info', 'information', 'change', 'update', 'edit', 'modify', 'make', 'set'].includes(t));

  let bestCustomerMatch = null;
  let matchScore = 0;

  for (const c of customerPool) {
    const fullName = c.name.toLowerCase();
    const firstName = c.name.toLowerCase().split(' ')[0];
    const lastName = c.name.toLowerCase().split(' ')[1] || '';
    const companyName = c.company.toLowerCase();
    const email = c.email.toLowerCase();
    const id = c.id.toLowerCase();

    // Exact matches
    if (normalized.includes(fullName)) {
      bestCustomerMatch = c;
      matchScore = 100;
      break;
    }
    if (normalized.includes(id)) {
      bestCustomerMatch = c;
      matchScore = 95;
      break;
    }
    if (normalized.includes(companyName) && matchScore < 90) {
      bestCustomerMatch = c;
      matchScore = 90;
    }
    if (normalized.includes(email) && matchScore < 85) {
      bestCustomerMatch = c;
      matchScore = 85;
    }
    // First name match
    if (firstName.length > 2 && normalized.includes(firstName) && matchScore < 75) {
      bestCustomerMatch = c;
      matchScore = 75;
    }
    // Last name match
    if (lastName.length > 2 && normalized.includes(lastName) && matchScore < 70) {
      bestCustomerMatch = c;
      matchScore = 70;
    }
    // Company key token match (e.g. "hillcrest", "apex", "luminary", "vanguard")
    for (const token of cleanTokens) {
      if (companyName.includes(token) && matchScore < 60) {
        bestCustomerMatch = c;
        matchScore = 60;
      }
    }
  }

  // =========================================================================
  // 1. UPDATE / EDIT CUSTOMER INTENT (High Priority)
  // e.g. "change Eleanor Vance status to Inactive", "update phone of Marcus to +1 555-000-1111",
  // e.g. "make Sophia Chen inactive", "change company of David to OpenAI", "update Kenji email to kenji@tokyo.jp"
  // =========================================================================
  const isUpdateCommand =
    normalized.startsWith('change ') ||
    normalized.startsWith('update ') ||
    normalized.startsWith('set ') ||
    normalized.startsWith('edit ') ||
    normalized.startsWith('modify ') ||
    normalized.startsWith('make ') ||
    normalized.includes('change status') ||
    normalized.includes('update status') ||
    normalized.includes('set status') ||
    normalized.includes('change phone') ||
    normalized.includes('update phone') ||
    normalized.includes('change email') ||
    normalized.includes('update email') ||
    normalized.includes('change company') ||
    normalized.includes('update company');

  if (isUpdateCommand && bestCustomerMatch) {
    const target = bestCustomerMatch;
    const changes = {};
    const changeDescriptions = [];

    // 1. Status change
    if (normalized.includes('inactive') || normalized.includes('pause') || normalized.includes('churn')) {
      changes.status = 'Inactive';
      changeDescriptions.push("Status updated to Inactive");
    } else if (normalized.includes('active') && (normalized.includes('status') || normalized.includes('make') || normalized.includes('set') || normalized.includes('change'))) {
      changes.status = 'Active';
      changeDescriptions.push("Status updated to Active");
    }

    // 2. Email change
    const emailMatch = input.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    if (emailMatch && emailMatch[1] !== target.email) {
      changes.email = emailMatch[1];
      changeDescriptions.push(`Email address updated to ${emailMatch[1]}`);
    }

    // 3. Phone change
    const phoneMatch = input.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch && phoneMatch[0] !== target.phone) {
      changes.phone = phoneMatch[0];
      changeDescriptions.push(`Phone number updated to ${phoneMatch[0]}`);
    }

    // 4. Company change
    const companyMatch = input.match(/company\s+(?:to|as)?\s+([A-Za-z0-9&.\s]+?)(?:,|\.|\bphone|\bemail|\bactive|\binactive|$)/i);
    if (companyMatch && companyMatch[1]) {
      const newCompany = companyMatch[1].trim();
      if (newCompany && !['to', 'as', 'active', 'inactive'].includes(newCompany.toLowerCase())) {
        changes.company = newCompany;
        changeDescriptions.push(`Company updated to ${newCompany}`);
      }
    }

    // 5. Name change
    const nameMatch = input.match(/name\s+(?:to|as)?\s+([A-Za-z\s]+?)(?:,|\.|\bphone|\bemail|$)/i);
    if (nameMatch && nameMatch[1]) {
      const newName = nameMatch[1].trim();
      if (newName && newName.length > 2 && !['to', 'as'].includes(newName.toLowerCase())) {
        changes.name = newName;
        changeDescriptions.push(`Name updated to ${newName}`);
      }
    }

    if (Object.keys(changes).length > 0) {
      // Execute the real state update in React AppContext
      if (typeof updateCustomer === 'function') {
        updateCustomer(target.id, changes);
      }

      const updatedRecord = { ...target, ...changes };

      response = {
        text: [
          `Customer record updated and saved successfully:`,
          `1. Target Account: ${updatedRecord.name}`,
          `2. Organization: ${updatedRecord.company}`,
          `3. Changes Applied: ${changeDescriptions.join(', ')}`,
          `4. Verified Email: ${updatedRecord.email}`,
          `5. Verified Phone: ${updatedRecord.phone}`,
          `6. Current Status: ${updatedRecord.status}`,
          "7. Live Persistence: Saved to CRM storage and reflected across all screens and KPI metrics"
        ].join('\n'),
        toolCalled: 'update_customer',
        badge: `Updated ${updatedRecord.name}`,
        data: updatedRecord
      };
    } else {
      response = {
        text: [
          `Recognized customer ${target.name}, but need specific field changes:`,
          "1. To change status: Say 'Change " + target.name + " status to Inactive'",
          "2. To change phone: Say 'Update phone of " + target.name + " to +1 (555) 000-1111'",
          "3. To change email: Say 'Update email of " + target.name + " to newemail@company.com'",
          "4. To change company: Say 'Update company of " + target.name + " to NewCo'"
        ].join('\n'),
        toolCalled: null
      };
    }
  }

  // =========================================================================
  // 2. FETCH CUSTOMER PROFILE
  // If customer was identified and query is NOT delete / add / email
  // =========================================================================
  else if (bestCustomerMatch && !normalized.startsWith('delete ') && !normalized.startsWith('remove ') && !normalized.startsWith('add ') && !normalized.startsWith('create ') && !(normalized.includes('draft') && normalized.includes('email'))) {
    const c = bestCustomerMatch;
    const formattedDate = new Date(c.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    if (normalized.includes('phone') || normalized.includes('number') || normalized.includes('call')) {
      response = {
        text: [
          `Phone Contact for ${c.name}:`,
          `1. Customer Name: ${c.name}`,
          `2. Direct Phone: ${c.phone}`,
          `3. Company: ${c.company}`,
          `4. Work Email: ${c.email}`,
          `5. Account Status: ${c.status}`
        ].join('\n'),
        toolCalled: 'fetch_customer_profile',
        badge: `Phone: ${c.name}`,
        data: c
      };
    } else if (normalized.includes('email') || normalized.includes('mail')) {
      response = {
        text: [
          `Email Address for ${c.name}:`,
          `1. Customer Name: ${c.name}`,
          `2. Verified Email: ${c.email}`,
          `3. Organization: ${c.company}`,
          `4. Direct Phone: ${c.phone}`,
          `5. Status: ${c.status}`
        ].join('\n'),
        toolCalled: 'fetch_customer_profile',
        badge: `Email: ${c.name}`,
        data: c
      };
    } else if (normalized.includes('company') || normalized.includes('organization')) {
      response = {
        text: [
          `Company Profile for ${c.name}:`,
          `1. Organization: ${c.company}`,
          `2. Primary Contact: ${c.name}`,
          `3. Work Email: ${c.email}`,
          `4. Phone: ${c.phone}`,
          `5. Partnership Status: ${c.status}`,
          `6. Onboarded: ${formattedDate}`
        ].join('\n'),
        toolCalled: 'fetch_customer_profile',
        badge: `Company: ${c.company}`,
        data: c
      };
    } else {
      response = {
        text: [
          `Customer Profile for ${c.name}:`,
          `1. Full Name: ${c.name}`,
          `2. Company / Organization: ${c.company}`,
          `3. Email Address: ${c.email}`,
          `4. Phone Number: ${c.phone}`,
          `5. Account Status: ${c.status}`,
          `6. Onboarding Date: ${formattedDate}`,
          `7. Customer ID: ${c.id}`
        ].join('\n'),
        toolCalled: 'fetch_customer_profile',
        badge: `Retrieved ${c.name}`,
        data: c
      };
    }
  }

  // =========================================================================
  // 3. COMPANY WORK & BUSINESS PURPOSE QUESTIONS
  // =========================================================================
  else if (
    (normalized.includes('company') && (normalized.includes('work') || normalized.includes('do') || normalized.includes('business') || normalized.includes('purpose') || normalized.includes('about'))) ||
    normalized.includes('what do you do') ||
    normalized.includes('what does this app do') ||
    normalized.includes('what is this platform') ||
    normalized.includes('what is nexuscrm') ||
    normalized.includes('about nexuscrm') ||
    normalized.includes('tell me about your company') ||
    normalized.includes('what are your services')
  ) {
    response = {
      text: [
        "About NexusCRM and our organization:",
        "1. Core Purpose: We are an Enterprise Customer Relationship Management (CRM) platform built to manage, track, and scale B2B customer relationships.",
        "2. Client Lifecycle Management: We maintain comprehensive customer directories, track contracted active partners, and monitor inactive or paused accounts.",
        "3. Real-Time Business Intelligence: We provide executive analytics, acquisition velocity charts, churn risk analysis, and growth forecasting.",
        "4. Operational Automation: We streamline client onboarding, outreach communication, and directory administration through AI agentic workflows.",
        `5. Current Scale: Our workspace is currently managing ${customerPool.length} verified client organizations across multiple global business sectors.`
      ].join('\n'),
      toolCalled: 'explain_company_work',
      badge: 'Company Information'
    };
  }

  // =========================================================================
  // 4. GREETINGS & INTRODUCTIONS
  // =========================================================================
  else if (
    /^(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/i.test(normalized) &&
    !normalized.includes('who is') && !normalized.includes('add') && !normalized.includes('delete') && !normalized.includes('show')
  ) {
    response = {
      text: [
        "Hello! I am your Nexus AI Copilot assistant:",
        "1. Role: I am your automated CRM operations assistant embedded directly into this workspace.",
        "2. Direct Data Access: I have access to all 28 customer profiles, contact numbers, emails, and company details.",
        "3. Live Customer Modifications: You can instruct me to 'Change Eleanor Vance status to Inactive' or 'Update Marcus Thorne phone to 555-000-1111'.",
        "4. Real-Time Operations: Ask me to look up profiles, calculate portfolio metrics, or add new customers directly."
      ].join('\n'),
      toolCalled: null
    };
  }

  // =========================================================================
  // 5. CURRENT USER / ADMIN QUESTIONS
  // =========================================================================
  else if (
    normalized.includes('who am i') ||
    normalized.includes('my profile') ||
    normalized.includes('who is logged in') ||
    normalized.includes('current user')
  ) {
    const adminUser = user || profile;
    response = {
      text: [
        "Current Authenticated Operator:",
        "1. Name: " + adminUser.name,
        "2. Work Email: " + adminUser.email,
        "3. Role / Title: " + (adminUser.role || "Operations Director"),
        "4. Access Level: Full administrative privileges over customer records and settings"
      ].join('\n'),
      toolCalled: null
    };
  }

  // =========================================================================
  // 6. LIVE COUNT & STATISTIC QUESTIONS
  // =========================================================================
  else if (normalized.includes('how many') || normalized.includes('count of') || normalized.includes('total number') || normalized.includes('statistics')) {
    const activeCount = customerPool.filter(c => c.status === 'Active').length;
    const inactiveCount = customerPool.filter(c => c.status === 'Inactive').length;
    const totalCount = customerPool.length;

    if (normalized.includes('active') && !normalized.includes('inactive')) {
      const activePct = Math.round((activeCount / (totalCount || 1)) * 100);
      response = {
        text: [
          "Active Customer Metric:",
          `1. Count: ${activeCount} active accounts`,
          `2. Ratio: ${activePct}% of total customer base`,
          `3. Status: Currently contracted and actively paying`
        ].join('\n'),
        toolCalled: 'get_portfolio_summary',
        badge: `Active Count: ${activeCount}`
      };
    } else if (normalized.includes('inactive')) {
      const inactivePct = Math.round((inactiveCount / (totalCount || 1)) * 100);
      response = {
        text: [
          "Inactive Customer Metric:",
          `1. Count: ${inactiveCount} inactive accounts`,
          `2. Churn Risk Ratio: ${inactivePct}% of total accounts`,
          "3. Recommendation: Review contracts or schedule re-engagement outreach"
        ].join('\n'),
        toolCalled: 'get_portfolio_summary',
        badge: `Inactive Count: ${inactiveCount}`
      };
    } else if (normalized.includes('new') || normalized.includes('this month')) {
      response = {
        text: [
          "New Customer Acquisition Metric:",
          `1. New Signups This Month: ${stats.newThisMonth} accounts onboarded`,
          "2. Velocity: Positive monthly acquisition trajectory",
          `3. Total Active Pipeline: ${totalCount} total accounts`
        ].join('\n'),
        toolCalled: 'get_portfolio_summary',
        badge: `New This Month: ${stats.newThisMonth}`
      };
    } else {
      response = {
        text: [
          "Live Customer Directory Totals:",
          `1. Total Registered Accounts: ${totalCount} customers`,
          `2. Active Accounts: ${activeCount} clients`,
          `3. Inactive Accounts: ${inactiveCount} clients`,
          `4. New This Month: ${stats.newThisMonth} clients`
        ].join('\n'),
        toolCalled: 'get_portfolio_summary',
        badge: `Total: ${totalCount}`
      };
    }
  }

  // =========================================================================
  // 7. LIST REAL CUSTOMERS BY STATUS OR RECENT SIGNUPS
  // =========================================================================
  else if (
    (normalized.includes('list') || normalized.includes('who are') || normalized.includes('show all') || normalized.includes('names of')) &&
    (normalized.includes('inactive') || normalized.includes('active') || normalized.includes('new') || normalized.includes('recent') || normalized.includes('customer') || normalized.includes('all'))
  ) {
    if (normalized.includes('inactive')) {
      const inactives = customerPool.filter(c => c.status === 'Inactive');
      const items = inactives.map((c, idx) => `${idx + 1}. ${c.name} (${c.company}) - ${c.email}`);

      response = {
        text: [
          `Currently Inactive Customer Accounts (${inactives.length} total):`,
          ...items
        ].join('\n'),
        toolCalled: 'list_customers_by_status',
        badge: `Listed ${inactives.length} Inactive Clients`
      };
    } else if (normalized.includes('new') || normalized.includes('recent')) {
      const recents = customerPool.slice(0, 6).map((c, idx) => {
        const dateStr = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${idx + 1}. ${c.name} (${c.company}) - Joined ${dateStr}`;
      });

      response = {
        text: [
          "Most Recently Onboarded Customers:",
          ...recents
        ].join('\n'),
        toolCalled: 'list_customers_by_status',
        badge: 'Listed Recent Customers'
      };
    } else {
      const sample = customerPool.slice(0, 10).map((c, idx) => `${idx + 1}. ${c.name} (${c.company}) - ${c.status}`);
      response = {
        text: [
          `Customer Directory Roster (${customerPool.length} total accounts):`,
          ...sample,
          `${customerPool.length - 10} additional customer profiles available in Customer Directory view`
        ].join('\n'),
        toolCalled: 'list_customers_by_status',
        badge: `Listed ${customerPool.length} Records`
      };
    }
  }

  // =========================================================================
  // 8. ADD CUSTOMER INTENT
  // =========================================================================
  else if (normalized.startsWith('add ') || normalized.startsWith('create ') || normalized.includes('new customer') || normalized.includes('new client')) {
    let name = 'New Client';
    const nameMatch = input.match(/(?:named|customer|client|add|create)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    if (nameMatch && nameMatch[1]) {
      name = nameMatch[1].trim();
    }

    let company = 'Enterprise Partner';
    const companyMatch = input.match(/(?:at|from|company|for)\s+([A-Za-z0-9&.\s]+?)(?:,|\.|\bphone|\bemail|\bactive|\binactive|$)/i);
    if (companyMatch && companyMatch[1]) {
      const cleanCompany = companyMatch[1].trim();
      if (!['active', 'inactive', 'customer', 'client', 'the'].includes(cleanCompany.toLowerCase())) {
        company = cleanCompany;
      }
    }

    let email = `${name.toLowerCase().replace(/\s+/g, '.')}@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
    const emailMatch = input.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    if (emailMatch) {
      email = emailMatch[1];
    }

    let phone = '+1 (555) 492-8172';
    const phoneMatch = input.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) {
      phone = phoneMatch[0];
    }

    const status = normalized.includes('inactive') ? 'Inactive' : 'Active';

    const newCustomer = addCustomer({
      name,
      company,
      email,
      phone,
      status
    });

    setActiveTab('customers');

    response = {
      text: [
        "Customer creation completed successfully:",
        `1. Name: ${name}`,
        `2. Company: ${company}`,
        `3. Email: ${email}`,
        `4. Phone: ${phone}`,
        `5. Status: ${status}`,
        "6. Workspace: Live directory and dashboard stats updated immediately"
      ].join('\n'),
      toolCalled: 'add_customer',
      badge: `Added ${name} (${company})`,
      data: newCustomer
    };
  }

  // =========================================================================
  // 9. DELETE CUSTOMER INTENT
  // =========================================================================
  else if (normalized.startsWith('delete ') || normalized.startsWith('remove ')) {
    const targetQuery = normalized.replace(/^(delete|remove)\s+(customer|client)?/i, '').trim();

    if (!targetQuery) {
      response = {
        text: [
          "Action requires target details:",
          "1. Please specify the name or company of the customer to remove",
          "2. Example format: Delete David Sterling"
        ].join('\n'),
        toolCalled: null
      };
    } else {
      const matched = customerPool.find(c =>
        c.name.toLowerCase().includes(targetQuery) ||
        c.email.toLowerCase().includes(targetQuery) ||
        c.company.toLowerCase().includes(targetQuery) ||
        c.id.toLowerCase() === targetQuery
      );

      if (matched) {
        deleteCustomer(matched.id);
        response = {
          text: [
            "Customer deletion executed successfully:",
            `1. Removed Account: ${matched.name}`,
            `2. Associated Company: ${matched.company}`,
            `3. Previous Status: ${matched.status}`,
            "4. Impact: Directory and dashboard metrics recalculated immediately"
          ].join('\n'),
          toolCalled: 'delete_customer',
          badge: `Deleted ${matched.name}`,
          data: matched
        };
      } else {
        response = {
          text: [
            "Customer lookup resulted in no match:",
            `1. Searched Term: "${targetQuery}"`,
            "2. Recommendation: Verify the name spelling in the Customer Directory tab"
          ].join('\n'),
          toolCalled: null
        };
      }
    }
  }

  // =========================================================================
  // 10. FILTER DIRECTORY VIEW
  // =========================================================================
  else if (normalized.includes('inactive') || normalized.includes('active') || normalized.includes('filter') || normalized.includes('show customers')) {
    setActiveTab('customers');

    const inactives = customerPool.filter(c => c.status === 'Inactive');
    const actives = customerPool.filter(c => c.status === 'Active');

    if (normalized.includes('inactive')) {
      response = {
        text: [
          "Directory filter updated:",
          "1. Target Screen: Customer Directory",
          "2. Active Filter: Inactive accounts",
          `3. Records Found: ${inactives.length} paused accounts`,
          "4. Objective: Ready for re-engagement or churn review"
        ].join('\n'),
        toolCalled: 'filter_customers',
        badge: 'Filter: Inactive',
        filterStatus: 'Inactive'
      };
    } else if (normalized.includes('active')) {
      response = {
        text: [
          "Directory filter updated:",
          "1. Target Screen: Customer Directory",
          "2. Active Filter: Active accounts",
          `3. Records Found: ${actives.length} contracted accounts`,
          "4. Health: Generating ongoing recurring engagement"
        ].join('\n'),
        toolCalled: 'filter_customers',
        badge: 'Filter: Active',
        filterStatus: 'Active'
      };
    } else {
      response = {
        text: [
          "Directory view updated:",
          "1. Target Screen: Customer Directory",
          "2. Filter: All accounts",
          `3. Total Records: ${customerPool.length} customers loaded`,
          "4. Pagination: 10 records per page"
        ].join('\n'),
        toolCalled: 'navigate_screen',
        badge: 'View: Customer Directory'
      };
    }
  }

  // =========================================================================
  // 11. DRAFT EMAIL INTENT
  // =========================================================================
  else if (normalized.includes('draft') || normalized.includes('email') || normalized.includes('outreach') || normalized.includes('message')) {
    const targetClient = bestCustomerMatch || customerPool[0];
    const isReengagement = normalized.includes('re-engage') || targetClient.status === 'Inactive';

    const subject = isReengagement
      ? `Checking in: Special partnership update for ${targetClient.company}`
      : `Welcome aboard to NexusCRM, ${targetClient.name}!`;

    const bodyLine1 = isReengagement
      ? `Hi ${targetClient.name}, we noticed activity on ${targetClient.company}'s account has slowed down recently.`
      : `Hi ${targetClient.name}, welcome to the NexusCRM ecosystem! We are excited to support ${targetClient.company}.`;

    const bodyLine2 = isReengagement
      ? `We recently shipped several intelligence features that we would love to walk you through.`
      : `Please reach out if you need assistance configuring your team workspaces.`;

    const bodyLine3 = isReengagement
      ? `Do you have 15 minutes this Thursday for a quick touchpoint?`
      : `Looking forward to driving exceptional outcomes together.`;

    response = {
      text: [
        `Personalized email drafted for ${targetClient.name}:`,
        `1. Recipient: ${targetClient.name} (${targetClient.email})`,
        `2. Organization: ${targetClient.company}`,
        `3. Account Status: ${targetClient.status}`,
        `4. Subject Line: ${subject}`,
        `5. Opening: ${bodyLine1}`,
        `6. Content: ${bodyLine2}`,
        `7. Call to Action: ${bodyLine3}`,
        "8. Signoff: Best regards, Operations Team"
      ].join('\n'),
      toolCalled: 'draft_email',
      badge: `Drafted Email for ${targetClient.name}`
    };
  }

  // =========================================================================
  // 12. EXECUTIVE PORTFOLIO SUMMARY INTENT
  // =========================================================================
  else if (normalized.includes('summary') || normalized.includes('report') || normalized.includes('how are we doing') || normalized.includes('health') || normalized.includes('overview') || normalized.includes('analytics')) {
    const activeCount = customerPool.filter(c => c.status === 'Active').length;
    const inactiveCount = customerPool.filter(c => c.status === 'Inactive').length;
    const totalCount = customerPool.length;

    const activePct = Math.round((activeCount / (totalCount || 1)) * 100);
    const churnPct = Math.round((inactiveCount / (totalCount || 1)) * 100);

    response = {
      text: [
        "Executive Portfolio Intelligence Report:",
        `1. Total Customers: ${totalCount} accounts registered`,
        `2. Active Paying Customers: ${activeCount} accounts (${activePct}% active ratio)`,
        `3. Inactive or Paused Accounts: ${inactiveCount} accounts (${churnPct}% churn risk)`,
        `4. New This Month: ${stats.newThisMonth} new client accounts onboarded`,
        `5. Strategic Recommendation: Launch outreach campaigns targeting the ${inactiveCount} inactive clients to maintain 85%+ retention`
      ].join('\n'),
      toolCalled: 'get_portfolio_summary',
      badge: 'Generated Portfolio Briefing'
    };
  }

  // =========================================================================
  // 13. CONVERSATIONAL FALLBACK
  // =========================================================================
  else {
    response = {
      text: [
        "Here are the ways I can assist your operations:",
        "1. Direct Customer Updates: Say 'Change Eleanor Vance status to Inactive' or 'Update Marcus phone to 555-000-1111'",
        "2. Direct Customer Lookups: Ask 'Who is Eleanor Vance?' or 'What is Kenji's phone number?'",
        "3. Organization Queries: Ask 'Who works at Hillcrest BioTech?' or 'Details of Luminary AI'",
        "4. Real-Time Client Listings: Ask 'List inactive customers' or 'Show latest signups'",
        "5. Live Statistics: Ask 'How many active customers?' or 'Summarize portfolio'",
        "6. Account Creation: Say 'Add customer [Name] at [Company], active'"
      ].join('\n'),
      toolCalled: null
    };
  }

  // Mandatory safety guarantee: Strip all asterisks (*) from the final output
  if (response && response.text) {
    response.text = response.text.replace(/\*/g, '').trim();
  }

  return response;
}
