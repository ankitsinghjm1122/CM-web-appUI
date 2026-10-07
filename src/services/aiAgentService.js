/**
 * NexusCRM AI Copilot Agent Service
 * Handles Intent Classification, Entity Extraction, Tool Calling, and Execution.
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

  // 1. ADD CUSTOMER INTENT
  // e.g. "add customer Sarah at Netflix, active, sarah@netflix.com, 555-0199"
  // e.g. "create client Bob Vance from Vance Refrigeration"
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

    return {
      text: `Done! I've executed the tool \`add_customer\` and added **${name}** (${company}) as an **${status}** account.`,
      toolCalled: 'add_customer',
      badge: `Added ${name} (${company})`,
      data: newCustomer
    };
  }

  // 2. DELETE CUSTOMER INTENT
  // e.g. "delete customer David Sterling", "remove Kenji"
  if (lower.startsWith('delete ') || lower.startsWith('remove ')) {
    const targetQuery = lower.replace(/^(delete|remove)\s+(customer|client)?/i, '').trim();

    if (!targetQuery) {
      return {
        text: "Please specify which customer you'd like to delete (e.g., *'Delete David Sterling'*).",
        toolCalled: null
      };
    }

    const matched = customers.find(c =>
      c.name.toLowerCase().includes(targetQuery) ||
      c.email.toLowerCase().includes(targetQuery) ||
      c.company.toLowerCase().includes(targetQuery) ||
      c.id.toLowerCase() === targetQuery
    );

    if (matched) {
      deleteCustomer(matched.id);
      return {
        text: `Executed \`delete_customer\`. Successfully removed **${matched.name}** (${matched.company}) from the directory.`,
        toolCalled: 'delete_customer',
        badge: `Deleted ${matched.name}`,
        data: matched
      };
    } else {
      return {
        text: `I couldn't find any customer matching **"${targetQuery}"**. Double check the name in the directory.`,
        toolCalled: null
      };
    }
  }

  // 3. FILTER / SEARCH CUSTOMERS INTENT
  // e.g. "show inactive customers", "filter active", "show all"
  if (lower.includes('inactive') || lower.includes('active') || lower.includes('filter') || lower.includes('show customers')) {
    setActiveTab('customers');

    if (lower.includes('inactive')) {
      return {
        text: `Navigated to **Customer Directory** and filtered for **Inactive** accounts (${stats.inactive} accounts found).`,
        toolCalled: 'filter_customers',
        badge: 'Filter: Inactive',
        filterStatus: 'Inactive'
      };
    }

    if (lower.includes('active')) {
      return {
        text: `Navigated to **Customer Directory** and filtered for **Active** paying accounts (${stats.active} accounts found).`,
        toolCalled: 'filter_customers',
        badge: 'Filter: Active',
        filterStatus: 'Active'
      };
    }

    return {
      text: `Navigated to **Customer Directory** displaying all ${stats.total} accounts.`,
      toolCalled: 'navigate_screen',
      badge: 'View: Customer Directory'
    };
  }

  // 4. THEME TOGGLE INTENT
  // e.g. "switch to dark mode", "turn on light theme", "toggle dark mode"
  if (lower.includes('dark mode') || lower.includes('light mode') || lower.includes('theme')) {
    if ((lower.includes('dark') && theme === 'light') || (lower.includes('light') && theme === 'dark') || lower.includes('toggle')) {
      toggleTheme();
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      return {
        text: `Executed \`toggle_theme\`. Interface appearance switched to **${newTheme.toUpperCase()} mode**.`,
        toolCalled: 'toggle_theme',
        badge: `Switched to ${newTheme} mode`
      };
    }
    return {
      text: `The interface is already in **${theme.toUpperCase()} mode**.`,
      toolCalled: null
    };
  }

  // 5. NAVIGATION INTENT
  // e.g. "go to settings", "open dashboard", "show analytics"
  if (lower.includes('settings') || lower.includes('preferences')) {
    setActiveTab('settings');
    return {
      text: "Navigated to **Settings & Profile** screen.",
      toolCalled: 'navigate_screen',
      badge: 'Navigated to Settings'
    };
  }

  if (lower.includes('dashboard') || lower.includes('analytics') || lower.includes('home')) {
    setActiveTab('dashboard');
    return {
      text: "Navigated to **Executive Dashboard** overview.",
      toolCalled: 'navigate_screen',
      badge: 'Navigated to Dashboard'
    };
  }

  // 6. DRAFT EMAIL INTENT
  // e.g. "draft an email for David Sterling", "re-engagement email"
  if (lower.includes('draft') || lower.includes('email') || lower.includes('outreach')) {
    const matchedCustomer = customers.find(c => lower.includes(c.name.toLowerCase().split(' ')[0])) || customers[0];
    const isReengagement = lower.includes('re-engage') || matchedCustomer.status === 'Inactive';

    const subject = isReengagement
      ? `Checking in: Special partnership update for ${matchedCustomer.company}`
      : `Welcome aboard to NexusCRM, ${matchedCustomer.name}!`;

    const body = isReengagement
      ? `Hi ${matchedCustomer.name},\n\nWe noticed activity on ${matchedCustomer.company}'s account has slowed down recently. We recently shipped several intelligence features that we'd love to walk you through.\n\nDo you have 15 minutes this Thursday for a quick touchpoint?\n\nBest regards,\nOperations Team`
      : `Hi ${matchedCustomer.name},\n\nWelcome to the NexusCRM ecosystem! We are excited to support ${matchedCustomer.company} in streamlining your operational workflows.\n\nLet us know if you need any assistance getting started.\n\nWarm regards,\nAlex Morgan`;

    return {
      text: `Drafted an outreach email for **${matchedCustomer.name}** (${matchedCustomer.company}):\n\n**Subject:** ${subject}\n\n\`\`\`\n${body}\n\`\`\``,
      toolCalled: 'draft_email',
      badge: `Drafted Email for ${matchedCustomer.name}`
    };
  }

  // 7. EXECUTIVE PORTFOLIO SUMMARY INTENT
  // e.g. "summarize how we are doing", "give me a report", "portfolio health"
  if (lower.includes('summary') || lower.includes('report') || lower.includes('how are we doing') || lower.includes('health') || lower.includes('overview')) {
    const activePct = Math.round((stats.active / (stats.total || 1)) * 100);
    const churnPct = Math.round((stats.inactive / (stats.total || 1)) * 100);

    return {
      text: `### 📊 Executive Portfolio Briefing\n\n- **Total Customer Accounts:** ${stats.total}\n- **Active Ratio:** **${activePct}%** (${stats.active} accounts contracted)\n- **Churn Risk / Inactive:** **${churnPct}%** (${stats.inactive} accounts paused)\n- **Acquisition Velocity:** **${stats.newThisMonth} new signups** recorded this month.\n\n💡 **AI Recommendation:** Re-engage the ${stats.inactive} inactive clients with a tailored review or promotion to boost active retention above 85%.`,
      toolCalled: 'get_portfolio_summary',
      badge: 'Generated Portfolio Briefing'
    };
  }

  // 8. GENERAL ASSISTANCE FALLBACK
  return {
    text: `I'm your **NexusCRM Copilot Agent**. Here are some tasks I can execute for you:\n\n- *"Add customer Elena at Spotify, active"* (Runs \`add_customer\`)\n- *"Show inactive customers"* (Filters directory)\n- *"Summarize portfolio health"* (Generates KPI analysis)\n- *"Draft re-engagement email for David"* (Creates tailored email)\n- *"Switch to dark mode"* (Toggles UI appearance)`,
    toolCalled: null
  };
}
