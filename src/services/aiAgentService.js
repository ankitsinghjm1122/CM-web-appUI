/**
 * NexusCRM AI Copilot Agent Service
 * Handles Intent Classification, Entity Extraction, Tool Calling, and Point-by-Point Execution.
 * Guaranteed: NO asterisks (*) used anywhere in outputs.
 */

export const COPILOT_TOOLS = [
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
    name: 'navigate_screen',
    description: 'Switches the active workspace screen (dashboard, customers, settings).',
    parameters: ['screen']
  },
  {
    name: 'toggle_theme',
    description: 'Switches the appearance between Light and Dark mode.',
    parameters: []
  },
  {
    name: 'draft_email',
    description: 'Generates a personalized outreach or re-engagement email for a customer.',
    parameters: ['customerName', 'tone']
  },
  {
    name: 'get_portfolio_summary',
    description: 'Analyzes customer counts, churn rate, and recent signups to produce an executive briefing.',
    parameters: []
  }
];

export async function processCopilotMessage(userInput, context) {
  const input = userInput.trim();
  const lower = input.toLowerCase();

  // Artificial thinking latency simulation for realism (400ms)
  await new Promise(r => setTimeout(r, 400));

  const { customers, stats, addCustomer, deleteCustomer, setActiveTab, toggleTheme, theme } = context;

  let response = null;

  // 1. ADD CUSTOMER INTENT
  // e.g. "add customer Sarah at Netflix, active, sarah@netflix.com, 555-0199"
  if (lower.startsWith('add ') || lower.startsWith('create ') || lower.includes('new customer') || lower.includes('new client')) {
    // Extract Name
    let name = 'New Client';
    const nameMatch = input.match(/(?:named|customer|client|add|create)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    if (nameMatch && nameMatch[1]) {
      name = nameMatch[1].trim();
    }

    // Extract Company
    let company = 'Enterprise Partner';
    const companyMatch = input.match(/(?:at|from|company|for)\s+([A-Za-z0-9&.\s]+?)(?:,|\.|\bphone|\bemail|\bactive|\binactive|$)/i);
    if (companyMatch && companyMatch[1]) {
      const cleanCompany = companyMatch[1].trim();
      if (!['active', 'inactive', 'customer', 'client', 'the'].includes(cleanCompany.toLowerCase())) {
        company = cleanCompany;
      }
    }

    // Extract Email
    let email = `${name.toLowerCase().replace(/\s+/g, '.')}@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
    const emailMatch = input.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    if (emailMatch) {
      email = emailMatch[1];
    }

    // Extract Phone
    let phone = '+1 (555) 492-8172';
    const phoneMatch = input.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) {
      phone = phoneMatch[0];
    }

    // Extract Status
    const status = lower.includes('inactive') ? 'Inactive' : 'Active';

    const newCustomer = addCustomer({
      name,
      company,
      email,
      phone,
      status
    });

    // Auto-navigate to customers so user immediately sees the result
    setActiveTab('customers');

    response = {
      text: [
        "Customer creation completed successfully:",
        `1. Name: ${name}`,
        `2. Company: ${company}`,
        `3. Email: ${email}`,
        `4. Phone: ${phone}`,
        `5. Status: ${status}`,
        "6. Workspace: Live directory and dashboard stats have been updated"
      ].join('\n'),
      toolCalled: 'add_customer',
      badge: `Added ${name} (${company})`,
      data: newCustomer
    };
  }

  // 2. DELETE CUSTOMER INTENT
  // e.g. "delete customer David Sterling", "remove Kenji"
  else if (lower.startsWith('delete ') || lower.startsWith('remove ')) {
    const targetQuery = lower.replace(/^(delete|remove)\s+(customer|client)?/i, '').trim();

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
      const matched = customers.find(c =>
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

  // 3. FILTER / SEARCH CUSTOMERS INTENT
  // e.g. "show inactive customers", "filter active", "show all"
  else if (lower.includes('inactive') || lower.includes('active') || lower.includes('filter') || lower.includes('show customers')) {
    setActiveTab('customers');

    if (lower.includes('inactive')) {
      response = {
        text: [
          "Directory filter updated:",
          "1. Target Screen: Customer Directory",
          "2. Active Filter: Inactive accounts",
          `3. Records Found: ${stats.inactive} paused accounts`,
          "4. Objective: Ready for re-engagement or churn review"
        ].join('\n'),
        toolCalled: 'filter_customers',
        badge: 'Filter: Inactive',
        filterStatus: 'Inactive'
      };
    } else if (lower.includes('active')) {
      response = {
        text: [
          "Directory filter updated:",
          "1. Target Screen: Customer Directory",
          "2. Active Filter: Active accounts",
          `3. Records Found: ${stats.active} contracted accounts`,
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
          `3. Total Records: ${stats.total} customers loaded`,
          "4. Pagination: 10 records per page"
        ].join('\n'),
        toolCalled: 'navigate_screen',
        badge: 'View: Customer Directory'
      };
    }
  }

  // 4. THEME TOGGLE INTENT
  // e.g. "switch to dark mode", "turn on light theme", "toggle dark mode"
  else if (lower.includes('dark mode') || lower.includes('light mode') || lower.includes('theme')) {
    if ((lower.includes('dark') && theme === 'light') || (lower.includes('light') && theme === 'dark') || lower.includes('toggle')) {
      toggleTheme();
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      response = {
        text: [
          "Interface theme updated successfully:",
          `1. New Appearance: ${newTheme.toUpperCase()} mode`,
          "2. Scope: Applied across all 5 workspace screens",
          "3. Storage: Persisted in local browser storage"
        ].join('\n'),
        toolCalled: 'toggle_theme',
        badge: `Switched to ${newTheme} mode`
      };
    } else {
      response = {
        text: [
          "Appearance state checked:",
          `1. Current Mode: ${theme.toUpperCase()} mode is already active`,
          "2. Action: No changes required"
        ].join('\n'),
        toolCalled: null
      };
    }
  }

  // 5. NAVIGATION INTENT
  // e.g. "go to settings", "open dashboard", "show analytics"
  else if (lower.includes('settings') || lower.includes('preferences')) {
    setActiveTab('settings');
    response = {
      text: [
        "Navigation completed:",
        "1. Active View: Settings & Profile",
        "2. Features Available: Theme selector, Admin Profile editing, Seed Data reset"
      ].join('\n'),
      toolCalled: 'navigate_screen',
      badge: 'Navigated to Settings'
    };
  } else if (lower.includes('dashboard') || lower.includes('analytics') || lower.includes('home')) {
    setActiveTab('dashboard');
    response = {
      text: [
        "Navigation completed:",
        "1. Active View: Executive Dashboard",
        "2. Available Metrics: 4 KPI summary cards, Growth Area chart, Portfolio health"
      ].join('\n'),
      toolCalled: 'navigate_screen',
      badge: 'Navigated to Dashboard'
    };
  }

  // 6. DRAFT EMAIL INTENT
  // e.g. "draft an email for David Sterling", "re-engagement email"
  else if (lower.includes('draft') || lower.includes('email') || lower.includes('outreach')) {
    const matchedCustomer = customers.find(c => lower.includes(c.name.toLowerCase().split(' ')[0])) || customers[0];
    const isReengagement = lower.includes('re-engage') || matchedCustomer.status === 'Inactive';

    const subject = isReengagement
      ? `Checking in: Special partnership update for ${matchedCustomer.company}`
      : `Welcome aboard to NexusCRM, ${matchedCustomer.name}!`;

    const bodyLine1 = isReengagement
      ? `Hi ${matchedCustomer.name}, we noticed activity on ${matchedCustomer.company}'s account has slowed down recently.`
      : `Hi ${matchedCustomer.name}, welcome to the NexusCRM ecosystem! We are excited to support ${matchedCustomer.company}.`;

    const bodyLine2 = isReengagement
      ? `We recently shipped several intelligence features that we would love to walk you through.`
      : `Please reach out if you need assistance configuring your team workspaces.`;

    const bodyLine3 = isReengagement
      ? `Do you have 15 minutes this Thursday for a quick touchpoint?`
      : `Looking forward to driving exceptional outcomes together.`;

    response = {
      text: [
        `Personalized email drafted for ${matchedCustomer.name}:`,
        `1. Recipient: ${matchedCustomer.name} (${matchedCustomer.email})`,
        `2. Organization: ${matchedCustomer.company}`,
        `3. Account Status: ${matchedCustomer.status}`,
        `4. Subject Line: ${subject}`,
        `5. Opening: ${bodyLine1}`,
        `6. Content: ${bodyLine2}`,
        `7. Call to Action: ${bodyLine3}`,
        "8. Signoff: Best regards, Operations Team"
      ].join('\n'),
      toolCalled: 'draft_email',
      badge: `Drafted Email for ${matchedCustomer.name}`
    };
  }

  // 7. EXECUTIVE PORTFOLIO SUMMARY INTENT
  // e.g. "summarize how we are doing", "give me a report", "portfolio health"
  else if (lower.includes('summary') || lower.includes('report') || lower.includes('how are we doing') || lower.includes('health') || lower.includes('overview')) {
    const activePct = Math.round((stats.active / (stats.total || 1)) * 100);
    const churnPct = Math.round((stats.inactive / (stats.total || 1)) * 100);

    response = {
      text: [
        "Executive Portfolio Intelligence Report:",
        `1. Total Customers: ${stats.total} accounts registered`,
        `2. Active Paying Customers: ${stats.active} accounts (${activePct}% active ratio)`,
        `3. Inactive or Paused Accounts: ${stats.inactive} accounts (${churnPct}% churn risk)`,
        `4. New This Month: ${stats.newThisMonth} new client accounts onboarded`,
        `5. Strategic Recommendation: Launch outreach campaigns targeting the ${stats.inactive} inactive clients to maintain 85%+ retention`
      ].join('\n'),
      toolCalled: 'get_portfolio_summary',
      badge: 'Generated Portfolio Briefing'
    };
  }

  // 8. GENERAL ASSISTANCE FALLBACK
  else {
    response = {
      text: [
        "Here are the core actions you can ask me to perform:",
        "1. Add Customers: Add customer Elena at Spotify, active, elena@spotify.com",
        "2. Filter Directory: Show inactive customers",
        "3. Executive Summary: Summarize portfolio health and performance metrics",
        "4. Email Generation: Draft a re-engagement email for David Sterling",
        "5. Appearance Control: Switch to dark mode or light mode",
        "6. Workspace Navigation: Go to settings or open dashboard"
      ].join('\n'),
      toolCalled: null
    };
  }

  // Mandatory post-processing: remove ALL asterisks (*) from the final output
  if (response && response.text) {
    response.text = response.text.replace(/\*/g, '').trim();
  }

  return response;
}
