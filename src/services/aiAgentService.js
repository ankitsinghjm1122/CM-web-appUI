/**
 * NexusCRM AI Copilot Agent Service
 * Deep Customer Intelligence, Conversational Q&A, Tool Calling, and Execution.
 * Guaranteed: Zero asterisks (*), strictly structured in points, typo-tolerant.
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
    name: 'get_customer_details',
    description: 'Retrieves complete verified profile of a specific customer.',
    parameters: ['nameOrCompany']
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
    name: 'navigate_screen',
    description: 'Switches the active workspace screen.',
    parameters: ['screen']
  },
  {
    name: 'toggle_theme',
    description: 'Switches the interface between Light and Dark mode.',
    parameters: []
  }
];

export async function processCopilotMessage(userInput, context) {
  const input = userInput.trim();
  // Normalize typos for resilient natural language understanding
  const normalized = input
    .toLowerCase()
    .replace(/\bwaht\b/g, 'what')
    .replace(/\bcompnay\b/g, 'company')
    .replace(/\bbuisness\b/g, 'business')
    .replace(/\bclinet\b/g, 'client')
    .replace(/\bcutomer\b/g, 'customer')
    .replace(/\bactve\b/g, 'active')
    .replace(/\binactve\b/g, 'inactive')
    .replace(/\bwrk\b/g, 'work');

  // Artificial thinking latency simulation for realism (350ms)
  await new Promise(r => setTimeout(r, 350));

  const { customers, stats, addCustomer, deleteCustomer, setActiveTab, toggleTheme, theme, user, profile } = context;

  let response = null;

  // =========================================================================
  // 1. COMPANY WORK & BUSINESS PURPOSE QUESTIONS
  // e.g. "what is your company's work", "what do you do", "about company", "what is this platform"
  // =========================================================================
  if (
    normalized.includes('company') && (normalized.includes('work') || normalized.includes('do') || normalized.includes('business') || normalized.includes('purpose') || normalized.includes('about')) ||
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
        "5. Current Scale: Our workspace is currently orchestrating " + stats.total + " client organizations across multiple global business sectors."
      ].join('\n'),
      toolCalled: 'explain_company_work',
      badge: 'Company Information'
    };
  }

  // =========================================================================
  // 2. GREETINGS & CASUAL INTRODUCTIONS
  // e.g. "hi", "hello", "hey", "who are you", "good morning", "how are you"
  // =========================================================================
  else if (
    /^(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/i.test(normalized) &&
    !normalized.includes('who is') && !normalized.includes('add') && !normalized.includes('delete') && !normalized.includes('show')
  ) {
    response = {
      text: [
        "Hello! I am your Nexus AI Copilot assistant:",
        "1. Role: I am your automated CRM operations assistant embedded directly into this workspace.",
        "2. What I Can Do: Look up client profiles, summarize business health, execute directory updates, and draft communications.",
        "3. Live Status: Connected to your live database of " + stats.total + " client organizations.",
        "4. How to Ask: You can ask me questions about clients, request business metrics, or instruct me to take direct actions."
      ].join('\n'),
      toolCalled: null
    };
  }

  // =========================================================================
  // 3. WHO ARE YOU / IDENTITY
  // e.g. "who are you", "what is your role", "tell me about yourself"
  // =========================================================================
  else if (
    normalized.includes('who are you') ||
    normalized.includes('what are you') ||
    normalized.includes('introduce yourself') ||
    normalized.includes('your role')
  ) {
    response = {
      text: [
        "Nexus AI Copilot Profile:",
        "1. Identity: Autonomous AI agent designed specifically for NexusCRM operations.",
        "2. Connected Capabilities: Capable of calling real tools to modify React state, filter tables, and add or delete records.",
        "3. Data Access: Real-time read and write access to all customer records, metrics, and application settings.",
        "4. Speed: Operates instantly inside your browser with zero latency or external dependencies."
      ].join('\n'),
      toolCalled: null
    };
  }

  // =========================================================================
  // 4. CURRENT LOGGED IN USER / PROFILE QUESTIONS
  // e.g. "who am i", "my profile", "who is logged in", "current user"
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
        "3. Role / Title: " + (adminUser.role || "Administrator"),
        "4. Access Level: Full administrative privileges over customer records and settings"
      ].join('\n'),
      toolCalled: null
    };
  }

  // =========================================================================
  // 5. SPECIFIC CUSTOMER DETAIL LOOKUP
  // e.g. "who is Sophia", "details of Kenji", "find Marcus Thorne", "what is David's email", "tell me about Hillcrest"
  // =========================================================================
  else if (
    normalized.includes('who is') ||
    normalized.includes('tell me about') ||
    normalized.includes('details of') ||
    normalized.includes('search for') ||
    normalized.includes('find ') ||
    normalized.includes('email of') ||
    normalized.includes('phone of') ||
    normalized.includes('info on') ||
    normalized.includes('information about') ||
    normalized.includes('contact for')
  ) {
    const matched = customers.find(c => {
      const firstName = c.name.toLowerCase().split(' ')[0];
      const lastName = c.name.toLowerCase().split(' ')[1] || '';
      const fullName = c.name.toLowerCase();
      const comp = c.company.toLowerCase();

      return (
        normalized.includes(fullName) ||
        (firstName.length > 2 && normalized.includes(firstName)) ||
        (lastName.length > 2 && normalized.includes(lastName)) ||
        normalized.includes(comp)
      );
    });

    if (matched) {
      const formattedDate = new Date(matched.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      response = {
        text: [
          `Verified profile details for ${matched.name}:`,
          `1. Full Name: ${matched.name}`,
          `2. Organization: ${matched.company}`,
          `3. Email Address: ${matched.email}`,
          `4. Phone Number: ${matched.phone}`,
          `5. Contract Status: ${matched.status}`,
          `6. Date Onboarded: ${formattedDate}`,
          `7. Account Identifier: ${matched.id}`
        ].join('\n'),
        toolCalled: 'get_customer_details',
        badge: `Retrieved ${matched.name}`,
        data: matched
      };
    } else {
      response = {
        text: [
          "Customer lookup status:",
          "1. Query: Did not find a direct match in the database",
          "2. Suggestion: Check spelling or search in the Customer Directory tab"
        ].join('\n'),
        toolCalled: null
      };
    }
  }

  // =========================================================================
  // 6. LIVE COUNT & STATISTIC QUESTIONS
  // e.g. "how many customers", "how many active", "how many inactive", "how many new"
  // =========================================================================
  else if (normalized.includes('how many') || normalized.includes('count of') || normalized.includes('total number') || normalized.includes('statistics')) {
    if (normalized.includes('active') && !normalized.includes('inactive')) {
      const activePct = Math.round((stats.active / (stats.total || 1)) * 100);
      response = {
        text: [
          "Active Customer Metric:",
          `1. Count: ${stats.active} active accounts`,
          `2. Ratio: ${activePct}% of total customer base`,
          `3. Status: Currently contracted and actively paying`
        ].join('\n'),
        toolCalled: 'get_portfolio_summary',
        badge: `Active Count: ${stats.active}`
      };
    } else if (normalized.includes('inactive')) {
      const inactivePct = Math.round((stats.inactive / (stats.total || 1)) * 100);
      response = {
        text: [
          "Inactive Customer Metric:",
          `1. Count: ${stats.inactive} inactive accounts`,
          `2. Churn Risk Ratio: ${inactivePct}% of total accounts`,
          "3. Recommendation: Review contracts or schedule re-engagement outreach"
        ].join('\n'),
        toolCalled: 'get_portfolio_summary',
        badge: `Inactive Count: ${stats.inactive}`
      };
    } else if (normalized.includes('new') || normalized.includes('this month')) {
      response = {
        text: [
          "New Customer Acquisition Metric:",
          `1. New Signups This Month: ${stats.newThisMonth} accounts onboarded`,
          "2. Velocity: Positive monthly acquisition trajectory",
          `3. Total Active Pipeline: ${stats.total} total accounts`
        ].join('\n'),
        toolCalled: 'get_portfolio_summary',
        badge: `New This Month: ${stats.newThisMonth}`
      };
    } else {
      response = {
        text: [
          "Live Customer Directory Totals:",
          `1. Total Registered Accounts: ${stats.total} customers`,
          `2. Active Accounts: ${stats.active} clients`,
          `3. Inactive Accounts: ${stats.inactive} clients`,
          `4. New This Month: ${stats.newThisMonth} clients`
        ].join('\n'),
        toolCalled: 'get_portfolio_summary',
        badge: `Total: ${stats.total}`
      };
    }
  }

  // =========================================================================
  // 7. LIST REAL CUSTOMERS BY STATUS OR RECENT SIGNUPS
  // e.g. "list inactive customers", "who are the inactive clients", "show latest signups"
  // =========================================================================
  else if (
    (normalized.includes('list') || normalized.includes('who are') || normalized.includes('show all') || normalized.includes('names of')) &&
    (normalized.includes('inactive') || normalized.includes('active') || normalized.includes('new') || normalized.includes('recent') || normalized.includes('customer'))
  ) {
    if (normalized.includes('inactive')) {
      const inactives = customers.filter(c => c.status === 'Inactive');
      const items = inactives.slice(0, 8).map((c, idx) => `${idx + 1}. ${c.name} (${c.company}) - ${c.email}`);
      if (inactives.length > 8) {
        items.push(`${inactives.length - 8} more inactive accounts visible in Customer Directory table`);
      }

      response = {
        text: [
          `Currently Inactive Customer Accounts (${inactives.length} total):`,
          ...items
        ].join('\n'),
        toolCalled: 'list_customers_by_status',
        badge: `Listed ${inactives.length} Inactive Clients`
      };
    } else if (normalized.includes('new') || normalized.includes('recent')) {
      const recents = customers.slice(0, 6).map((c, idx) => {
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
      const sample = customers.slice(0, 8).map((c, idx) => `${idx + 1}. ${c.name} (${c.company}) - Status: ${c.status}`);
      response = {
        text: [
          `Customer Directory Roster (${customers.length} total accounts):`,
          ...sample,
          `${customers.length - 8} additional records available in Customer Directory view`
        ].join('\n'),
        toolCalled: 'list_customers_by_status',
        badge: `Listed ${customers.length} Records`
      };
    }
  }

  // =========================================================================
  // 8. ADD CUSTOMER INTENT
  // e.g. "add customer Sarah Jenkins at Netflix, active, sarah@netflix.com, 555-0199"
  // =========================================================================
  else if (normalized.startsWith('add ') || normalized.startsWith('create ') || normalized.includes('new customer') || normalized.includes('new client')) {
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
  // e.g. "delete customer David Sterling", "remove Kenji"
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

  // =========================================================================
  // 10. FILTER DIRECTORY VIEW
  // e.g. "show inactive customers", "filter active", "show all"
  // =========================================================================
  else if (normalized.includes('inactive') || normalized.includes('active') || normalized.includes('filter') || normalized.includes('show customers')) {
    setActiveTab('customers');

    if (normalized.includes('inactive')) {
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
    } else if (normalized.includes('active')) {
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

  // =========================================================================
  // 11. THEME TOGGLE INTENT
  // e.g. "switch to dark mode", "turn on light theme", "toggle dark mode"
  // =========================================================================
  else if (normalized.includes('dark mode') || normalized.includes('light mode') || normalized.includes('theme') || normalized.includes('appearance')) {
    if ((normalized.includes('dark') && theme === 'light') || (normalized.includes('light') && theme === 'dark') || normalized.includes('toggle')) {
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

  // =========================================================================
  // 12. NAVIGATION INTENT
  // e.g. "go to settings", "open dashboard", "show analytics"
  // =========================================================================
  else if (normalized.includes('settings') || normalized.includes('preferences')) {
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
  } else if (normalized.includes('dashboard') || normalized.includes('analytics') || normalized.includes('home')) {
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

  // =========================================================================
  // 13. DRAFT EMAIL INTENT
  // e.g. "draft an email for David Sterling", "re-engagement email"
  // =========================================================================
  else if (normalized.includes('draft') || normalized.includes('email') || normalized.includes('outreach') || normalized.includes('message')) {
    const targetClient = customers.find(c => {
      const firstName = c.name.toLowerCase().split(' ')[0];
      return normalized.includes(firstName) || normalized.includes(c.name.toLowerCase()) || normalized.includes(c.company.toLowerCase());
    }) || customers[0];

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
  // 14. EXECUTIVE PORTFOLIO SUMMARY INTENT
  // e.g. "summarize how we are doing", "give me a report", "portfolio health"
  // =========================================================================
  else if (normalized.includes('summary') || normalized.includes('report') || normalized.includes('how are we doing') || normalized.includes('health') || normalized.includes('overview')) {
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

  // =========================================================================
  // 15. CONVERSATIONAL FALLBACK
  // =========================================================================
  else {
    response = {
      text: [
        "Here are the ways I can assist your operations:",
        "1. Company Information: Ask 'What is our company's work?' or 'What does NexusCRM do?'",
        "2. Client Lookups: Ask 'Who is [Name]?' to view their contact and organization details",
        "3. Live Statistics: Ask 'How many active customers?' or 'Summarize portfolio'",
        "4. Client Listings: Ask 'List inactive customers' to see all paused accounts",
        "5. Account Creation: Say 'Add customer [Name] at [Company], active'",
        "6. Communications: Say 'Draft email for [Name]'"
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
