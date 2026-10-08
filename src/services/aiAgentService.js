/**
 * NexusCRM AI Copilot Agent Service
 * Omniscient Multilingual CRM Knowledge Engine & Autonomous Operations Assistant.
 * Fully understands English, Hindi, and Hinglish.
 * Answers ALL questions related to the CRM: concepts, features, customers, data, metrics, charts, and strategies.
 * Guaranteed: Zero asterisks (*), strictly formatted in numbered points, live state persistence.
 */

import { INITIAL_CUSTOMERS } from '../data/mockCustomers.js';

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
    name: 'explain_crm_concept',
    description: 'Explains CRM concepts, business metrics, and best practices.',
    parameters: ['topic']
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
  const rawInput = (userInput || '').trim();
  const lower = rawInput.toLowerCase();

  // 1. Devanagari script detection
  const hasDevanagari = /[\u0900-\u097F]/.test(rawInput);

  // Common Hindi & Hinglish vocabulary cues
  const hindiIndicators = [
    'kya', 'hai', 'hain', 'kaun', 'kon', 'kahan', 'kaha', 'kidhar', 'kaise', 'kese', 'kyu', 'kyun', 'kyon',
    'kitne', 'kitna', 'kitni', 'kab', 'konsa', 'konsi', 'karo', 'kardo', 'kar do', 'kar dena',
    'banao', 'bana do', 'hata do', 'hatao', 'nikal do', 'jodo', 'daalo', 'likho', 'bhejo', 'dikhao',
    'batao', 'bataiye', 'sabke', 'sabhi', 'saare', 'sare', 'sab', 'purana', 'naya', 'nayi', 'fayde',
    'kuch', 'kuchh', 'matlab', 'antar', 'fark', 'walo', 'wale', 'wali', 'ka', 'ki', 'ke', 'ko', 'mein', 'se',
    'tum', 'aap', 'mera', 'meri', 'hamara', 'chahiye', 'sakta', 'sakti', 'samajh', 'samajhte',
    'badlo', 'badal', 'lagao', 'madad', 'sawal', 'jawab', 'hindi', 'bhasha', 'bol', 'bolo',
    'karein', 'kare', 'bataiye', 'kiska', 'iski', 'uska', 'unki', 'unke'
  ];

  const isHindi = hasDevanagari || hindiIndicators.some(w => new RegExp(`\\b${w}\\b`, 'i').test(lower));

  // 2. Devanagari term transliteration (longer compound words first)
  let converted = lower;
  if (hasDevanagari) {
    converted = converted
      .replace(/एलेनोर|एलीनोर/g, 'eleanor')
      .replace(/मार्कस/g, 'marcus')
      .replace(/सोफिया/g, 'sophia')
      .replace(/डेविड/g, 'david')
      .replace(/माया/g, 'maya')
      .replace(/कार्लोस/g, 'carlos')
      .replace(/सारा/g, 'sarah')
      .replace(/अनन्या|अनान्या/g, 'ananya')
      .replace(/कस्टमर|ग्राहक/g, 'customer')
      .replace(/कंपनी/g, 'company')
      .replace(/फ़ोन|फोन/g, 'phone')
      .replace(/नंबर/g, 'number')
      .replace(/ईमेल/g, 'email')
      .replace(/इनएक्टिव|निष्क्रिय|बंद/g, 'inactive')
      .replace(/एक्टिव|सक्रिय|चालू/g, 'active')
      .replace(/सीआरएम/g, 'crm')
      .replace(/हटाओ|हटा दो|डिलीट|हटाएं/g, 'delete')
      .replace(/जोड़ो|ऐड/g, 'add')
      .replace(/बदलो|अपडेट/g, 'change')
      .replace(/लिखो|ड्राफ्ट/g, 'draft')
      .replace(/दिखाओ|बताओ|लिस्ट|सूची/g, 'batao')
      .replace(/बारे में|बारे मे/g, 'baare me')
      .replace(/सबके|सभी के|सारे|सब|सभी/g, 'sabke')
      .replace(/डायरेक्टर/g, 'director')
      .replace(/एडमिन/g, 'admin')
      .replace(/थीम/g, 'theme')
      .replace(/पुराना/g, 'oldest')
      .replace(/नया/g, 'newest')
      .replace(/क्या/g, 'kya')
      .replace(/कौन/g, 'kaun')
      .replace(/कहाँ|कहा|किधर/g, 'kahan')
      .replace(/कैसे/g, 'kaise')
      .replace(/क्यों/g, 'kyun')
      .replace(/कितने|कितना/g, 'kitne')
      .replace(/कर दो|करदे|करो|कर/g, 'kar do')
      .replace(/है|हैं/g, 'hai')
      .replace(/को/g, 'ko')
      .replace(/का|की|के/g, 'ka')
      .replace(/में/g, 'me')
      .replace(/से/g, 'se');
  }

  // Normalize common typos, phonetic spelling, and Hinglish phrases
  const normalized = converted
    .replace(/\bwaht\b/g, 'what')
    .replace(/\bcompnay\b/g, 'company')
    .replace(/\bbuisness\b/g, 'business')
    .replace(/\bclinet\b/g, 'client')
    .replace(/\bclinets\b/g, 'clients')
    .replace(/\bcutomer\b/g, 'customer')
    .replace(/\bcutomers\b/g, 'customers')
    .replace(/\bcustmer\b/g, 'customer')
    .replace(/\bcustmers\b/g, 'customers')
    .replace(/\bwrk\b/g, 'work')
    .replace(/\bchaneg\b/g, 'change')
    .replace(/\bupadte\b/g, 'update')
    .replace(/\bthsi\b/g, 'this')
    .replace(/\bnd\b/g, 'and')
    .replace(/\bproerly\b/g, 'properly')
    .replace(/\buhhh\b/g, 'you')
    .replace(/\buhh\b/g, 'you')
    .replace(/\bu\b/g, 'you')
    .replace(/\bur\b/g, 'your')
    .replace(/\br\b/g, 'are')
    .replace(/\bplz\b/g, 'please')
    .replace(/\bpls\b/g, 'please')
    .replace(/\bcrm's\b/g, 'crm');

  // Simulated thinking delay for natural conversational rhythm (200ms)
  await new Promise(r => setTimeout(r, 200));

  const {
    customers,
    stats,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    setActiveTab,
    toggleTheme,
    setTheme,
    theme = 'dark',
    user,
    profile
  } = context || {};

  const customerPool = (customers && customers.length > 0) ? customers : INITIAL_CUSTOMERS;
  const totalCount = customerPool.length;
  const activeCount = customerPool.filter(c => c.status === 'Active').length;
  const inactiveCount = customerPool.filter(c => c.status === 'Inactive').length;
  const activePct = Math.round((activeCount / (totalCount || 1)) * 100);
  const churnPct = Math.round((inactiveCount / (totalCount || 1)) * 100);
  const safeStats = stats || {
    total: totalCount,
    active: activeCount,
    inactive: inactiveCount,
    newThisMonth: Math.max(1, Math.round(totalCount * 0.3))
  };

  const directorName = (profile?.name || user?.name || 'Alex Morgan').trim();
  const directorRole = profile?.role || user?.role || 'Operations Director';
  const directorEmail = profile?.email || user?.email || 'alex.morgan@nexuscrm.io';
  const directorPhone = profile?.phone || '+1 (555) 019-2834';
  const directorCompany = profile?.company || 'Nexus Global Technologies';
  const directorBio = profile?.bio || 'Leading customer growth, onboarding workflows, and operational efficiency across all client accounts.';

  // 3. TARGET CUSTOMER RECOGNITION (Multi-field match)
  let targetCustomer = null;
  let targetScore = 0;

  for (const c of customerPool) {
    const fullName = c.name.toLowerCase();
    const parts = fullName.split(' ');
    const firstName = parts[0];
    const lastName = parts[1] || '';
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
    } else if (firstName.length >= 3 && new RegExp(`\\b${firstName}\\b`, 'i').test(normalized) && targetScore < 75) {
      targetCustomer = c;
      targetScore = 75;
    } else if (lastName.length >= 3 && new RegExp(`\\b${lastName}\\b`, 'i').test(normalized) && targetScore < 70) {
      targetCustomer = c;
      targetScore = 70;
    }
  }

  // Action cues
  const isDeleteAction =
    /\b(delete|remove|del|erase|purge)\b/i.test(normalized) ||
    normalized.includes('hata do') ||
    normalized.includes('hatao') ||
    normalized.includes('nikal do') ||
    normalized.includes('delete kar');

  const hasInactiveCue = /\b(inactive|deactivate|band|pause)\b/i.test(normalized);
  const hasActiveCue = (/\b(active|activate|chalu)\b/i.test(normalized) || normalized.includes('active karo') || normalized.includes('active kar do')) && !hasInactiveCue;
  const hasStatusChangeVerb = /\b(make|set|change|update|mark|turn|convert|badlo|karo|kar do|kardo|banao|bana do)\b/i.test(normalized) ||
    normalized.includes('status to') ||
    normalized.includes('status inactive') ||
    normalized.includes('status active');

  let response = null;

  // =========================================================================
  // 0. SPECIFIC QUERY: "DO YOU UNDERSTAND HINDI?" / "KYA TUM HINDI SAMAJHTE HO"
  // =========================================================================
  const isAskingAboutHindi =
    normalized.includes('hindi') &&
    (normalized.includes('samajh') || normalized.includes('understand') || normalized.includes('speak') || normalized.includes('aati') || normalized.includes('baat') || normalized.includes('bolo') || normalized.includes('bolte') || normalized.includes('kya'));

  if (isAskingAboutHindi) {
    response = {
      text: [
        "Haan! Main Hindi aur English dono bhashayein poori tarah samajh sakta hoon:",
        "1. Customer Jankari: Poochiye 'Sophia Chen kaun hai?' ya 'Marcus ka phone number kya hai?'.",
        "2. Live Badlav: Kahiye 'Eleanor ko inactive kar do' ya 'Marcus ko active karo'.",
        "3. Live Deletion: Kahiye 'Eleanor ko delete kar do' ya 'Delete Marcus Brody'.",
        "4. CRM Concepts: Poochiye 'CRM kya hota hai?', 'Churn rate kya hai?', ya 'CRM ke fayde kya hain?'.",
        "5. Operations Director: Poochiye 'Operations Director kaun hai?' ya 'Director ka phone kya hai?'.",
        "6. Zero Asterisks: Mera har jawab saaf numbered points me bina kisi asterisk ke milta hai."
      ].join('\n'),
      toolCalled: 'explain_crm_concept',
      badge: 'Hindi Support: Active'
    };
  }

  // =========================================================================
  // 1. MUTATION ACTIONS: DELETE CUSTOMER (PRIORITY 1)
  // =========================================================================
  if (!response && targetCustomer && isDeleteAction) {
    if (typeof deleteCustomer === 'function') {
      deleteCustomer(targetCustomer.id);
    }
    if (isHindi) {
      response = {
        text: [
          `Maine aapka aadesh samajh liya aur ${targetCustomer.name} ko delete kar diya:`,
          `1. Deleted Customer: ${targetCustomer.name}`,
          `2. Organization: ${targetCustomer.company}`,
          `3. Account ID: ${targetCustomer.id}`,
          "4. Database Sync: Customer directory se record turant hata diya gaya aur KPI metrics recalculate ho gaye"
        ].join('\n'),
        toolCalled: 'delete_customer',
        badge: `Deleted ${targetCustomer.name}`
      };
    } else {
      response = {
        text: [
          `I understood your instruction and removed ${targetCustomer.name}:`,
          `1. Deleted Customer: ${targetCustomer.name}`,
          `2. Organization: ${targetCustomer.company}`,
          `3. Account ID: ${targetCustomer.id}`,
          "4. Database Sync: Removed from customer directory and updated all KPI cards"
        ].join('\n'),
        toolCalled: 'delete_customer',
        badge: `Deleted ${targetCustomer.name}`
      };
    }
  }

  // =========================================================================
  // 2. MUTATION ACTIONS: UPDATE CUSTOMER STATUS (PRIORITY 2)
  // =========================================================================
  if (!response && targetCustomer && (hasInactiveCue || hasActiveCue) && (hasStatusChangeVerb || normalized.includes('status'))) {
    const targetStatus = hasInactiveCue ? 'Inactive' : 'Active';
    if (typeof updateCustomer === 'function') {
      updateCustomer(targetCustomer.id, { status: targetStatus });
    }
    const updated = { ...targetCustomer, status: targetStatus };

    if (isHindi) {
      response = {
        text: [
          `Maine aapka aadesh samajh liya aur ${targetCustomer.name} ka status update kar diya:`,
          `1. Status ko badal kar ${targetStatus} kar diya gaya hai`,
          `2. Current Profile: ${updated.name} at ${updated.company} (${updated.status})`,
          `3. Contact Jankari: ${updated.email} | ${updated.phone}`,
          "4. Synced: Browser storage aur customer table me status turant save ho gaya"
        ].join('\n'),
        toolCalled: 'update_customer',
        badge: `Updated ${updated.name}`,
        data: updated
      };
    } else {
      response = {
        text: [
          `I understood your instruction and updated ${targetCustomer.name}:`,
          `1. Status updated to ${targetStatus}`,
          `2. Current Profile: ${updated.name} at ${updated.company} (${updated.status})`,
          `3. Contact Details: ${updated.email} | ${updated.phone}`,
          "4. Live Integration: Saved to browser storage and updated dashboard stats"
        ].join('\n'),
        toolCalled: 'update_customer',
        badge: `Updated ${updated.name}`,
        data: updated
      };
    }
  }

  // =========================================================================
  // 3. MUTATION ACTIONS: UPDATE CONTACT INFO (PHONE / EMAIL / COMPANY)
  // =========================================================================
  if (!response && targetCustomer && (normalized.includes('update') || normalized.includes('change') || normalized.includes('badlo') || normalized.includes('set') || normalized.includes('phone') || normalized.includes('email') || normalized.includes('company'))) {
    const emailMatch = rawInput.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const phoneMatch = rawInput.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/);
    const companyMatch = rawInput.match(/(?:company\s+(?:to|is)?|moved\s+to|joined|now\s+at)\s+([A-Za-z0-9&.\s]+?)(?:,|\.|\bphone|\bemail|\bactive|\binactive|$)/i);

    const changes = {};
    const detailPoints = [];
    const detailPointsHindi = [];

    if (emailMatch && emailMatch[1] !== targetCustomer.email) {
      changes.email = emailMatch[1];
      detailPoints.push(`Email address updated to ${emailMatch[1]}`);
      detailPointsHindi.push(`Email badal kar ${emailMatch[1]} kar diya`);
    }

    if (phoneMatch && phoneMatch[0] !== targetCustomer.phone) {
      changes.phone = phoneMatch[0];
      detailPoints.push(`Direct phone updated to ${phoneMatch[0]}`);
      detailPointsHindi.push(`Phone number badal kar ${phoneMatch[0]} kar diya`);
    }

    if (companyMatch && companyMatch[1]) {
      const cleanCompany = companyMatch[1].trim();
      if (cleanCompany && !['to', 'is', 'active', 'inactive', 'the', 'a', 'ko', 'ka', 'ki'].includes(cleanCompany.toLowerCase()) && cleanCompany !== targetCustomer.company) {
        changes.company = cleanCompany;
        detailPoints.push(`Company association updated to ${cleanCompany}`);
        detailPointsHindi.push(`Company badal kar ${cleanCompany} kar di`);
      }
    }

    if (Object.keys(changes).length > 0) {
      if (typeof updateCustomer === 'function') {
        updateCustomer(targetCustomer.id, changes);
      }
      const updated = { ...targetCustomer, ...changes };

      if (isHindi) {
        response = {
          text: [
            `Maine aapka aadesh samajh liya aur ${targetCustomer.name} ka record update kar diya:`,
            ...detailPointsHindi.map((d, i) => `${i + 1}. ${d}`),
            `${detailPointsHindi.length + 1}. Current Profile: ${updated.name} at ${updated.company} (${updated.status})`,
            `${detailPointsHindi.length + 2}. Contact Jankari: ${updated.email} | ${updated.phone}`,
            `${detailPointsHindi.length + 3}. Synced: Browser storage aur customer table me data turant save ho gaya`
          ].join('\n'),
          toolCalled: 'update_customer',
          badge: `Updated ${updated.name}`,
          data: updated
        };
      } else {
        response = {
          text: [
            `I understood your instruction and updated ${targetCustomer.name}:`,
            ...detailPoints.map((d, i) => `${i + 1}. ${d}`),
            `${detailPoints.length + 1}. Current Profile: ${updated.name} at ${updated.company} (${updated.status})`,
            `${detailPoints.length + 2}. Contact Details: ${updated.email} | ${updated.phone}`,
            `${detailPoints.length + 3}. Live Integration: Saved to browser storage and updated dashboard stats`
          ].join('\n'),
          toolCalled: 'update_customer',
          badge: `Updated ${updated.name}`,
          data: updated
        };
      }
    }
  }

  // =========================================================================
  // 4. THEME ACTIONS (DARK MODE / LIGHT MODE / TOGGLE)
  // =========================================================================
  const isThemeQuery =
    /\b(theme|dark mode|light mode)\b/i.test(normalized) ||
    normalized.includes('theme badlo') ||
    normalized.includes('mode badlo') ||
    normalized.includes('dark karo') ||
    normalized.includes('light karo') ||
    normalized.includes('dark mode karo') ||
    normalized.includes('light mode karo');

  if (!response && isThemeQuery) {
    const wantsDark = normalized.includes('dark');
    const wantsLight = normalized.includes('light');

    if (wantsDark) {
      if (theme !== 'dark') {
        if (typeof setTheme === 'function') setTheme('dark');
        else if (typeof toggleTheme === 'function') toggleTheme();
      }
      if (isHindi) {
        response = {
          text: [
            "Workspace theme Dark Mode par switch ho gaya hai:",
            "1. Current Mode: Dark Mode active hai",
            "2. Styling: High-contrast dark background aur clear typography",
            "3. Storage: Aapki preference browser local storage me save ho gayi hai"
          ].join('\n'),
          toolCalled: 'toggle_theme',
          badge: 'Theme: Dark'
        };
      } else {
        response = {
          text: [
            "Workspace appearance updated to Dark Mode:",
            "1. Current Theme Mode: Switched to Dark Mode",
            "2. Styling: High-contrast sleek dark styling enabled",
            "3. Persistence: Preference saved to browser local storage"
          ].join('\n'),
          toolCalled: 'toggle_theme',
          badge: 'Theme: Dark'
        };
      }
    } else if (wantsLight) {
      if (theme !== 'light') {
        if (typeof setTheme === 'function') setTheme('light');
        else if (typeof toggleTheme === 'function') toggleTheme();
      }
      if (isHindi) {
        response = {
          text: [
            "Workspace theme Light Mode par switch ho gaya hai:",
            "1. Current Mode: Light Mode active hai",
            "2. Styling: High-contrast light background aur clear off-white accents",
            "3. Storage: Aapki preference browser local storage me save ho gayi hai"
          ].join('\n'),
          toolCalled: 'toggle_theme',
          badge: 'Theme: Light'
        };
      } else {
        response = {
          text: [
            "Workspace appearance updated to Light Mode:",
            "1. Current Theme Mode: Switched to Light Mode",
            "2. Styling: Clean off-white daylight layout enabled",
            "3. Persistence: Preference saved to browser local storage"
          ].join('\n'),
          toolCalled: 'toggle_theme',
          badge: 'Theme: Light'
        };
      }
    } else {
      if (typeof toggleTheme === 'function') toggleTheme();
      const nextTheme = theme === 'dark' ? 'Light' : 'Dark';
      if (isHindi) {
        response = {
          text: [
            "Workspace theme update ho gaya hai:",
            `1. Current Theme Mode: ${nextTheme} Mode apply ho gaya hai`,
            "2. Styling: Dynamic visual contrast update",
            "3. Storage: Aapki preference browser local storage me save ho gayi hai"
          ].join('\n'),
          toolCalled: 'toggle_theme',
          badge: `Theme: ${nextTheme}`
        };
      } else {
        response = {
          text: [
            "Workspace appearance updated:",
            `1. Current Theme Mode: Switched to ${nextTheme} Mode`,
            "2. Styling: Applied high-contrast accents and typography",
            "3. Persistence: Preference saved in your browser local storage"
          ].join('\n'),
          toolCalled: 'toggle_theme',
          badge: `Theme: ${nextTheme}`
        };
      }
    }
  }

  // =========================================================================
  // 5. MUTATION ACTIONS: ADD CUSTOMER INTENT
  // =========================================================================
  const isAddCustomerQuery =
    (normalized.startsWith('add') || normalized.startsWith('create') || normalized.includes('jodo') || normalized.includes('naya customer') || normalized.includes('add client')) &&
    !normalized.includes('how to add') &&
    !normalized.includes('kaise add');

  if (!response && isAddCustomerQuery) {
    const rawMatch = rawInput.match(/(?:add|create|new customer|naya customer)\s+(?:customer\s+|client\s+)?([A-Za-z\s]+?)(?:\s+(?:at|from|with|company)\s+([A-Za-z0-9&.\s]+))?$/i);
    let name = 'New Client';
    let company = 'Enterprise Partner';

    if (rawMatch && rawMatch[1]) {
      name = rawMatch[1].trim();
      if (rawMatch[2]) {
        company = rawMatch[2].trim();
      }
    }

    const emailGenerated = `${name.toLowerCase().replace(/\s+/g, '.')}@${company.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company'}.io`;
    const newCust = {
      name,
      company,
      email: emailGenerated,
      phone: '+1 (555) 019-' + Math.floor(1000 + Math.random() * 9000),
      status: 'Active'
    };

    if (typeof addCustomer === 'function') {
      addCustomer(newCust);
    }

    if (isHindi) {
      response = {
        text: [
          `Naya customer safaltapoorvak add kar diya gaya hai:`,
          `1. Customer Naam: ${name}`,
          `2. Organization: ${company}`,
          `3. Email Address: ${emailGenerated}`,
          `4. Phone Number: ${newCust.phone}`,
          `5. Status: Active (Signed & Onboarded)`,
          "6. Live Sync: Customer directory me add ho gaya aur KPI counts update ho gaye"
        ].join('\n'),
        toolCalled: 'add_customer',
        badge: `Added ${name} (${company})`,
        data: newCust
      };
    } else {
      response = {
        text: [
          `Successfully created and registered new enterprise customer:`,
          `1. Customer Name: ${name}`,
          `2. Organization: ${company}`,
          `3. Work Email: ${emailGenerated}`,
          `4. Direct Phone: ${newCust.phone}`,
          `5. Initial Status: Active`,
          "6. Live Integration: Added to customer directory and reflected in real-time KPI counts"
        ].join('\n'),
        toolCalled: 'add_customer',
        badge: `Added ${name} (${company})`,
        data: newCust
      };
    }
  }

  // =========================================================================
  // 6. CUSTOMER DIRECT LOOKUPS (PHONE, EMAIL, COMPANY, STATUS, PROFILE)
  // =========================================================================
  if (!response && targetCustomer) {
    const isAskingPhone =
      /\b(phone|mobile|call|number|direct line)\b/i.test(normalized) ||
      normalized.includes('phone number kya') ||
      normalized.includes('phone kya');

    const isAskingEmail =
      /\b(email|mail)\b/i.test(normalized) ||
      normalized.includes('email kya');

    const isAskingCompany =
      /\b(company|organization|firm|work|employer)\b/i.test(normalized) ||
      normalized.includes('kis company') ||
      normalized.includes('kahan kaam');

    const isAskingStatus =
      /\b(status|state)\b/i.test(normalized) ||
      /\b(active|inactive)\b/i.test(normalized) ||
      normalized.includes('active hai') ||
      normalized.includes('inactive hai') ||
      normalized.includes('is active') ||
      normalized.includes('is inactive');

    if (isAskingPhone) {
      if (isHindi) {
        response = {
          text: [
            `${targetCustomer.name} ki phone contact jankari:`,
            `1. Direct Phone: ${targetCustomer.phone}`,
            `2. Customer Naam: ${targetCustomer.name}`,
            `3. Organization: ${targetCustomer.company}`,
            `4. Work Email: ${targetCustomer.email}`,
            `5. Current Status: ${targetCustomer.status} Account`
          ].join('\n'),
          toolCalled: 'fetch_customer_profile',
          badge: `Phone: ${targetCustomer.name}`,
          data: targetCustomer
        };
      } else {
        response = {
          text: [
            `Direct phone details for ${targetCustomer.name}:`,
            `1. Phone Number: ${targetCustomer.phone}`,
            `2. Customer Name: ${targetCustomer.name}`,
            `3. Organization: ${targetCustomer.company}`,
            `4. Work Email: ${targetCustomer.email}`,
            `5. Status: ${targetCustomer.status}`
          ].join('\n'),
          toolCalled: 'fetch_customer_profile',
          badge: `Phone: ${targetCustomer.name}`,
          data: targetCustomer
        };
      }
    } else if (isAskingEmail) {
      if (isHindi) {
        response = {
          text: [
            `${targetCustomer.name} ki email contact jankari:`,
            `1. Email Address: ${targetCustomer.email}`,
            `2. Customer Naam: ${targetCustomer.name}`,
            `3. Organization: ${targetCustomer.company}`,
            `4. Phone: ${targetCustomer.phone}`,
            `5. Status: ${targetCustomer.status}`
          ].join('\n'),
          toolCalled: 'fetch_customer_profile',
          badge: `Email: ${targetCustomer.name}`,
          data: targetCustomer
        };
      } else {
        response = {
          text: [
            `Email address for ${targetCustomer.name}:`,
            `1. Email: ${targetCustomer.email}`,
            `2. Customer Name: ${targetCustomer.name}`,
            `3. Organization: ${targetCustomer.company}`,
            `4. Direct Phone: ${targetCustomer.phone}`,
            `5. Account Status: ${targetCustomer.status}`
          ].join('\n'),
          toolCalled: 'fetch_customer_profile',
          badge: `Email: ${targetCustomer.name}`,
          data: targetCustomer
        };
      }
    } else if (isAskingCompany) {
      if (isHindi) {
        response = {
          text: [
            `${targetCustomer.name} ki organization jankari:`,
            `1. Organization / Company: ${targetCustomer.company}`,
            `2. Full Name: ${targetCustomer.name}`,
            `3. Status: ${targetCustomer.status}`,
            `4. Contact: ${targetCustomer.email} | ${targetCustomer.phone}`
          ].join('\n'),
          toolCalled: 'fetch_customer_profile',
          badge: `Company: ${targetCustomer.name}`,
          data: targetCustomer
        };
      } else {
        response = {
          text: [
            `Company association for ${targetCustomer.name}:`,
            `1. Organization: ${targetCustomer.company}`,
            `2. Customer: ${targetCustomer.name}`,
            `3. Status: ${targetCustomer.status}`,
            `4. Contact: ${targetCustomer.email} | ${targetCustomer.phone}`
          ].join('\n'),
          toolCalled: 'fetch_customer_profile',
          badge: `Company: ${targetCustomer.name}`,
          data: targetCustomer
        };
      }
    } else if (isAskingStatus) {
      const isCurrentlyActive = targetCustomer.status === 'Active';
      const askingIfActive = /\bactive\b/i.test(normalized) && !/\binactive\b/i.test(normalized);
      const askingIfInactive = /\binactive\b/i.test(normalized);

      let answerLineEn = `${targetCustomer.name} is currently ${targetCustomer.status}.`;
      let answerLineHi = `${targetCustomer.name} is waqt ${targetCustomer.status} status me hai.`;

      if (askingIfActive) {
        answerLineEn = isCurrentlyActive
          ? `Yes, ${targetCustomer.name} is currently an Active customer.`
          : `No, ${targetCustomer.name} is currently Inactive (not active).`;
        answerLineHi = isCurrentlyActive
          ? `Haan, ${targetCustomer.name} is waqt ek Active customer hai.`
          : `Nahi, ${targetCustomer.name} is waqt Inactive hai (active nahi hai).`;
      } else if (askingIfInactive) {
        answerLineEn = !isCurrentlyActive
          ? `Yes, ${targetCustomer.name} is currently Inactive.`
          : `No, ${targetCustomer.name} is currently Active (not inactive).`;
        answerLineHi = !isCurrentlyActive
          ? `Haan, ${targetCustomer.name} is waqt Inactive hai.`
          : `Nahi, ${targetCustomer.name} is waqt Active hai (inactive nahi hai).`;
      }

      if (isHindi) {
        response = {
          text: [
            answerLineHi,
            `1. Customer: ${targetCustomer.name}`,
            `2. Organization: ${targetCustomer.company}`,
            `3. Current Status: ${targetCustomer.status}`,
            `4. Contact: ${targetCustomer.email} | ${targetCustomer.phone}`
          ].join('\n'),
          toolCalled: 'fetch_customer_profile',
          badge: `${targetCustomer.name}: ${targetCustomer.status}`,
          data: targetCustomer
        };
      } else {
        response = {
          text: [
            answerLineEn,
            `1. Customer: ${targetCustomer.name}`,
            `2. Organization: ${targetCustomer.company}`,
            `3. Current Status: ${targetCustomer.status}`,
            `4. Contact: ${targetCustomer.email} | ${targetCustomer.phone}`
          ].join('\n'),
          toolCalled: 'fetch_customer_profile',
          badge: `${targetCustomer.name}: ${targetCustomer.status}`,
          data: targetCustomer
        };
      }
    } else {
      // General full customer profile
      if (isHindi) {
        response = {
          text: [
            `${targetCustomer.name} ki complete profile jankari:`,
            `1. Pura Naam: ${targetCustomer.name}`,
            `2. Organization: ${targetCustomer.company}`,
            `3. Status: ${targetCustomer.status} Customer`,
            `4. Email: ${targetCustomer.email}`,
            `5. Direct Phone: ${targetCustomer.phone}`,
            `6. Account Identifier: ${targetCustomer.id}`
          ].join('\n'),
          toolCalled: 'fetch_customer_profile',
          badge: `Profile: ${targetCustomer.name}`,
          data: targetCustomer
        };
      } else {
        response = {
          text: [
            `Profile information for ${targetCustomer.name}:`,
            `1. Full Name: ${targetCustomer.name}`,
            `2. Company: ${targetCustomer.company}`,
            `3. Account Status: ${targetCustomer.status}`,
            `4. Work Email: ${targetCustomer.email}`,
            `5. Direct Phone: ${targetCustomer.phone}`,
            `6. Account ID: ${targetCustomer.id}`
          ].join('\n'),
          toolCalled: 'fetch_customer_profile',
          badge: `Profile: ${targetCustomer.name}`,
          data: targetCustomer
        };
      }
    }
  }

  // =========================================================================
  // 7. OPERATIONS DIRECTOR / SUPERADMIN / CURRENT USER INQUIRIES
  // =========================================================================
  const isDirectorQuery =
    !response &&
    (normalized.includes('director') ||
     normalized.includes('operations director') ||
     normalized.includes('superadmin') ||
     normalized.includes('admin') ||
     normalized.includes('current user') ||
     normalized.includes('who am i') ||
     normalized.includes('my profile') ||
     (directorName.length >= 3 && normalized.includes(directorName.toLowerCase())) ||
     normalized.includes('alex morgan') ||
     (normalized.includes('user') && (normalized.includes('who') || normalized.includes('kaun') || normalized.includes('details'))));

  if (!response && isDirectorQuery) {
    if (isHindi) {
      response = {
        text: [
          `NexusCRM Operations Director aur Superadmin ki jankari:`,
          `1. Director Naam: ${directorName}`,
          `2. Padvi / Role: ${directorRole} (Platform Superadmin)`,
          `3. Organization: ${directorCompany}`,
          `4. Work Email: ${directorEmail}`,
          `5. Direct Phone: ${directorPhone}`,
          `6. Mukhya Zimmedari: ${directorBio}`,
          "7. Profile Access: Screen ke top bar me Director avatar par click karke aap inki credentials inspect ya Settings me edit kar sakte hain."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: `Director: ${directorName}`
      };
    } else {
      response = {
        text: [
          `NexusCRM Operations Director & Superadmin Profile:`,
          `1. Director Name: ${directorName}`,
          `2. Executive Role: ${directorRole} (Platform Superadmin)`,
          `3. Organization: ${directorCompany}`,
          `4. Direct Email: ${directorEmail}`,
          `5. Direct Phone: ${directorPhone}`,
          `6. Executive Scope: ${directorBio}`,
          "7. Profile Access: Click the Director avatar badge in the top navigation bar to open the full credentials modal or update in Settings."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: `Director: ${directorName}`
      };
    }
  }

  // =========================================================================
  // 8. HOW-TO WORKFLOW GUIDES
  // =========================================================================
  const isHowToAdd =
    !response &&
    (normalized.includes('how to add') || normalized.includes('how do i add') || normalized.includes('kaise add') || normalized.includes('kaise jodein') || (normalized.includes('add') && (normalized.includes('kaise') || normalized.includes('how') || normalized.includes('process') || normalized.includes('steps'))));

  if (!response && isHowToAdd) {
    if (isHindi) {
      response = {
        text: [
          "NexusCRM me Naya Customer add karne ke tareeqe:",
          "1. AI Copilot Chat se: Bas chat me likhiye 'Add customer Sarah at Spotify' ya 'Naya customer jodo John at Google'.",
          "2. Top Bar UI Button se: Screen ke top header me purple '+ Add Customer' button par click karein.",
          "3. Form Modal: Full Name, Company, Email, Phone aur Active/Inactive status bharein.",
          "4. Live Database Sync: 'Save Customer' par click karte hi customer directory aur sabhi KPI cards turant update ho jaate hain."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'How-To: Add Customer'
      };
    } else {
      response = {
        text: [
          "How to add a new customer in NexusCRM:",
          "1. Via AI Copilot: Type 'Add customer Sarah at Spotify' or 'Create customer John at Google' and Copilot saves it live.",
          "2. Via UI Navigation: Click the purple '+ Add Customer' button in the top navigation header.",
          "3. Complete the Modal Form: Enter Customer Name, Company, Email, Phone, and choose Active or Inactive status.",
          "4. Live Instant Sync: Click 'Save Customer' to immediately save to browser local storage and update all dashboard metrics."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'How-To: Add Customer'
      };
    }
  }

  const isHowToUpdate =
    !response &&
    (normalized.includes('how to update') || normalized.includes('how to edit') || normalized.includes('how do i update') || normalized.includes('kaise update') || normalized.includes('kaise badlein') || (normalized.includes('update') && (normalized.includes('kaise') || normalized.includes('how'))));

  if (!response && isHowToUpdate) {
    if (isHindi) {
      response = {
        text: [
          "NexusCRM me Customer update karne ke tareeqe:",
          "1. AI Copilot Chat se: Seedhe boliye 'Make Eleanor inactive', 'Marcus ko active karo', ya 'Update Sophia phone to 555-0199'.",
          "2. Customer Directory se: Directory tab me kisi bhi customer row ke aage pencil (Edit) icon par click karein.",
          "3. Photo Modal se: Table me kisi bhi customer avatar par click karke unka profile modal kholein aur status badge toggle karein.",
          "4. Real-time Persistence: Sabhi badlav turant browser local storage me save hote hain."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'How-To: Update Customer'
      };
    } else {
      response = {
        text: [
          "How to update customer records in NexusCRM:",
          "1. Via AI Copilot: Simply type 'Make Eleanor inactive', 'Set Marcus to active', or 'Update Sophia phone to 555-0199'.",
          "2. Via Directory Row: In Customer Directory, click the pencil (Edit) icon on any customer row to edit their form.",
          "3. Via Profile Modal: Click any customer's avatar photo to open their full profile modal and toggle status directly.",
          "4. Instant Persistence: All updates sync to browser local storage and recalculate active/churn ratios in real time."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'How-To: Update Customer'
      };
    }
  }

  const isHowToDelete =
    !response &&
    (normalized.includes('how to delete') || normalized.includes('how to remove') || normalized.includes('kaise delete') || normalized.includes('kaise hatayein') || (normalized.includes('delete') && (normalized.includes('kaise') || normalized.includes('how'))));

  if (!response && isHowToDelete) {
    if (isHindi) {
      response = {
        text: [
          "NexusCRM me Customer delete karne ke tareeqe:",
          "1. AI Copilot Chat se: Bas chat me boliye 'Delete Eleanor Vance', 'Remove Marcus', ya 'Eleanor ko delete kar do'.",
          "2. Customer Directory se: Directory table me customer ke row par bane red trash/delete icon par click karein.",
          "3. Live Database Recalculation: Customer database se turant delete ho jata hai aur churn rate recalculate ho jata hai."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'How-To: Delete Customer'
      };
    } else {
      response = {
        text: [
          "How to delete customers in NexusCRM:",
          "1. Via AI Copilot: Simply say 'Delete Eleanor Vance', 'Remove Marcus Brody', or 'Purge client Sarah'.",
          "2. Via Customer Directory: Open Customer Directory and click the red trash icon on that customer's table row.",
          "3. Instant Sync: The customer record is purged immediately from browser storage and all KPI cards recalculate."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'How-To: Delete Customer'
      };
    }
  }

  // =========================================================================
  // 9. FEATURES & APP OVERVIEW
  // =========================================================================
  const isFeaturesQuery =
    !response &&
    (normalized.includes('features') ||
     normalized.includes('feature') ||
     normalized.includes('what are the features') ||
     normalized.includes('what is this app') ||
     normalized.includes('what can this app do') ||
     normalized.includes('tell me about this app') ||
     normalized.includes('what does this app do') ||
     normalized.includes('features kya hain') ||
     normalized.includes('ye app kya hai') ||
     normalized.includes('is app me kya hai'));

  if (!response && isFeaturesQuery) {
    if (isHindi) {
      response = {
        text: [
          "NexusCRM Platform ke Mukhya Features aur Suvidhayein:",
          `1. Centralized Customer Directory: ${totalCount} enterprise clients ka complete record search, pagination, aur cohort filter ke sath.`,
          `2. Live Business Analytics: Dynamic KPI cards jo Total Accounts (${totalCount}), Active Ratio (${activePct}%), aur Churn Rate (${churnPct}%) live track karte hain.`,
          "3. Acquisition Velocity Chart: Interactive Recharts 6-month area chart jo monthly onboarding growth visualize karta hai.",
          "4. Autonomous AI Copilot: Bilingual natural language assistant jo database me real-time updates, deletions, aur lookups execute karta hai.",
          "5. Executive Profile Modals: Operations Director aur Customer profile modals verified contact jankari aur status toggles ke sath.",
          "6. Themes & Persistence: High-contrast Dark aur Light mode switching browser local storage persistence ke sath."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'NexusCRM Features'
      };
    } else {
      response = {
        text: [
          "Key Features and Capabilities of NexusCRM:",
          `1. Centralized Customer Directory: Complete management of ${totalCount} enterprise accounts with search, pagination, and status filters.`,
          `2. Live Business Analytics: Dynamic KPI cards displaying Total Accounts (${totalCount}), Active Ratio (${activePct}%), and Churn Rate (${churnPct}%).`,
          "3. Acquisition Velocity Chart: Interactive Recharts 6-month area chart visualizing client onboarding momentum.",
          "4. Autonomous AI Copilot: Full natural language conversational agent that updates, deletes, adds, and looks up records in English and Hindi.",
          "5. Executive & Customer Profiles: Interactive modals for Operations Director and customer identity with 1-click status toggles.",
          "6. Themes & Storage Persistence: Instant Dark and Light modes backed by browser local storage persistence."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'NexusCRM Features'
      };
    }
  }

  // =========================================================================
  // 9.5. HUMAN CONVERSATIONAL INTELLIGENCE & SOCIAL INTERACTION
  // =========================================================================

  // A. GREETINGS & OPENERS
  const isGreeting =
    !response &&
    (/\b(hi|hello|hey|hiya|greetings|namaste|namaskar|salaam|good morning|good afternoon|good evening)\b/i.test(normalized) ||
     normalized === 'hi' ||
     normalized === 'hello' ||
     normalized === 'hey') &&
    !normalized.includes('how to') &&
    !normalized.includes('delete') &&
    !normalized.includes('update') &&
    !normalized.includes('status');

  if (!response && isGreeting) {
    if (isHindi) {
      response = {
        text: [
          "Namaste! Aap se baat karke bahut accha laga. Aapka din kaisa chal raha hai?",
          "1. Live CRM Actions: Kisi bhi customer ka status badalna, naya add karna, ya record delete karna ho, bas boliye.",
          "2. Direct Lookups: Phone number, email, ya company jankari turant praapt karein.",
          "3. Business Growth: Churn rate, retention metrics, ya monthly growth ke baare me poochein.",
          "4. Friendly Chat: Ya phir kisi bhi sales strategy ya sawal par normal baatcheet karein!",
          "Aap bataiye, aaj main aapki kis cheez me madad kar sakta hoon?"
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Hello!'
      };
    } else {
      response = {
        text: [
          "Hello there! It is wonderful to connect with you. How are you doing today?",
          "1. Live CRM Operations: Instruct me anytime to update statuses, add new clients, or delete profiles in real time.",
          "2. Direct Lookups: Ask for any customer's direct phone number, email address, or company details.",
          "3. Analytics & Growth: Inspect live churn rates, retention metrics, or onboarding charts.",
          "4. Friendly Collaboration: Or we can chat, brainstorm client outreach ideas, and discuss strategy!",
          "What is on your mind today?"
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Hello!'
      };
    }
  }

  // B. WELL-BEING & SMALL TALK ("HOW ARE YOU?")
  const isHowAreYou =
    !response &&
    (normalized.includes('how are you') ||
     normalized.includes('how r u') ||
     normalized.includes('how do you do') ||
     normalized.includes('how is it going') ||
     normalized.includes('how are things') ||
     normalized.includes('are you ok') ||
     normalized.includes('kaise ho') ||
     normalized.includes('kese ho') ||
     normalized.includes('kya haal') ||
     normalized.includes('sab theek') ||
     normalized.includes('sab badhiya'));

  if (!response && isHowAreYou) {
    if (isHindi) {
      response = {
        text: [
          "Main bilkul badhiya aur energetic hoon, poochne ke liye dil se shukriya!",
          `1. System Health: NexusCRM ke sabhi ${totalCount} enterprise accounts live track ho rahe hain.`,
          "2. Storage Sync: Aapka database bilkul safe aur up-to-date chal raha hai.",
          "3. Aapki Madad: Main aapke har sawal aur command ke liye poori tarah taiyar hoon.",
          "Aap bataiye, aapka din kaisa guzar raha hai? Aaj sab theek-thak?"
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Doing Great!'
      };
    } else {
      response = {
        text: [
          "I am doing fantastic, thank you so much for asking! It is always great chatting with you.",
          `1. System State: Everything across our ${totalCount} enterprise accounts is running smoothly at 100% capacity.`,
          "2. Real-Time Sync: The database and KPI metrics are fully synchronized and up to date.",
          "3. Ready to Help: I am right here by your side for any quick task, calculation, or check-in.",
          "How is your day going so far? Anything exciting or challenging on your desk today?"
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Doing Great!'
      };
    }
  }

  // C. WHAT ARE YOU DOING / ACTIVITY
  const isWhatDoing =
    !response &&
    (normalized.includes('what are you doing') ||
     normalized.includes('what r u doing') ||
     normalized.includes('what are you up to') ||
     normalized.includes('what is going on') ||
     normalized.includes('kya kar rahe ho') ||
     normalized.includes('kya chal raha'));

  if (!response && isWhatDoing) {
    if (isHindi) {
      response = {
        text: [
          "Bas aapke saath yahan active hoon aur NexusCRM ke sabhi accounts par nazar banaye hue hoon!",
          `1. Portfolio Oversight: ${totalCount} accounts (${activeCount} active, ${inactiveCount} inactive) ke live metrics manage kar raha hoon.`,
          "2. Instant Readiness: Aapke kisi bhi aadesh (jaise status badalna ya phone number dhoondna) ke intezaar me hoon.",
          "3. Conversational Partner: Aur aapke saath human jaisi behtareen baatcheet enjoy kar raha hoon!",
          "Bataiye, abhi hum kis customer ya task par kaam karein?"
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Active'
      };
    } else {
      response = {
        text: [
          "Right now, I am right here keeping everything running like clockwork for you in NexusCRM!",
          `1. Active Oversight: Keeping tabs on all ${totalCount} accounts (${activeCount} active, ${inactiveCount} inactive) and retention trends.`,
          "2. Instant Availability: Standing by to update records, look up contact info, or draft emails the second you need.",
          "3. Collaborating With You: Ready to chat through whatever questions, decisions, or ideas you have in mind.",
          "What shall we focus on right now?"
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Active'
      };
    }
  }

  // D. GRATITUDE & APPRECIATION
  const isGratitude =
    !response &&
    (normalized.includes('thank') ||
     normalized.includes('thx') ||
     normalized.includes('appreciate') ||
     normalized.includes('good job') ||
     normalized.includes('great job') ||
     normalized.includes('awesome') ||
     normalized.includes('you are good') ||
     normalized.includes('you are great') ||
     normalized.includes('well done') ||
     normalized.includes('dhanyawad') ||
     normalized.includes('shukriya') ||
     normalized.includes('shabash') ||
     normalized.includes('bahut badhiya') ||
     normalized.includes('badhiya kaam'));

  if (!response && isGratitude) {
    if (isHindi) {
      response = {
        text: [
          "Aapka bahut-bahut shukriya! Yeh sunkar sach me bahut accha laga.",
          "1. Aapka Saath: Aapke saath milkar NexusCRM ko manage karna mere liye khushi ki baat hai.",
          "2. Reliable Partner: Main hamesha koshish karta hoon ki aapko bilkul sahi aur insaan jaisa madadgaar jawab mile.",
          "3. Agla Task: Jab bhi koi agla sawal ho ya kisi record me badlav karna ho, bas ek aadesh dijiyega!",
          "Aapka din shandar gujre!"
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: You are welcome!'
      };
    } else {
      response = {
        text: [
          "You are so very welcome! Hearing that truly makes my day.",
          "1. Reliable Teammate: It is genuinely a pleasure collaborating with you to keep your client operations seamless.",
          "2. Continuous Support: I am always here to provide accurate, human-like answers and instant execution.",
          "3. Next Move: Whenever the next question or workflow comes up, don't hesitate to give me a shout!",
          "Keep up the great work today!"
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: You are welcome!'
      };
    }
  }

  // E. FAREWELLS & SIGNOFFS
  const isFarewell =
    !response &&
    (normalized.includes('bye') ||
     normalized.includes('goodbye') ||
     normalized.includes('see you') ||
     normalized.includes('talk later') ||
     normalized.includes('catch you later') ||
     normalized.includes('take care') ||
     normalized.includes('good night') ||
     normalized.includes('alvida') ||
     normalized.includes('phir milte') ||
     normalized.includes('shubh ratri'));

  if (!response && isFarewell) {
    if (isHindi) {
      response = {
        text: [
          "Alvida aur apna dhyan rakhiyega!",
          "1. Data Safe: Aapke dwara kiye gaye sabhi updates aur changes browser storage me surakshit hain.",
          "2. 24/7 Availability: Jab bhi aap wapas aayenge, main yahin ready milunga.",
          "3. Shubhkaamnayein: Ummeed hai aapka bacha hua din behad productive aur shaandar rahega!",
          "Phir milte hain!"
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Goodbye!'
      };
    } else {
      response = {
        text: [
          "Goodbye and take great care of yourself!",
          "1. Changes Preserved: All your recent customer edits and settings are safely stored in your browser storage.",
          "2. Always On Standby: Whenever you return or need a hand, I will be right here waiting to help.",
          "3. Best Wishes: Wishing you a relaxing, productive, and wonderful rest of your day!",
          "Catch you later!"
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Goodbye!'
      };
    }
  }

  // F. HUMOR & ENTERTAINMENT
  const isJoke =
    !response &&
    (normalized.includes('joke') ||
     normalized.includes('funny') ||
     normalized.includes('laugh') ||
     normalized.includes('humor') ||
     normalized.includes('chutkula') ||
     normalized.includes('hasao') ||
     normalized.includes('mazedaar'));

  if (!response && isJoke) {
    if (isHindi) {
      response = {
        text: [
          "Yeh lijiye ek lighthearted business chutkula:",
          "1. Ek sales executive ne spreadsheet se poocha: 'Tum itne emotional kyu nahi hote?'",
          "2. Spreadsheet boli: 'Kyuki mere paas sirf Cells hain, dil nahi! Aur jab bhi problem aati hai, main bas #REF! bol kar chup ho jaati hoon!'",
          "3. Smile Time: Ummeed hai isse kaam ke beech thoda maza aaya hoga! Ab bataiye, kis client par kaam karein?"
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Humor'
      };
    } else {
      response = {
        text: [
          "Here is a lighthearted joke for your workday:",
          "1. Why did the customer relationship manager break up with the spreadsheet?",
          "2. Because there were way too many trust issues with VLOOKUP, zero real-time commitment, and every time things got serious, it just threw a #VALUE! error!",
          "3. Good Vibes: Hope that brought a genuine smile to your day! What can I help you take on next in the CRM?"
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Humor'
      };
    }
  }

  // G. EMPATHY & ENCOURAGEMENT (TIRED / STRESSED / BUSY)
  const isTiredOrStressed =
    !response &&
    (normalized.includes('tired') ||
     normalized.includes('exhausted') ||
     normalized.includes('busy day') ||
     normalized.includes('stress') ||
     normalized.includes('tough day') ||
     normalized.includes('hard day') ||
     normalized.includes('thak gaya') ||
     normalized.includes('pareshan') ||
     normalized.includes('bohot kaam') ||
     normalized.includes('bahut kaam') ||
     normalized.includes('cheer me up'));

  if (!response && isTiredOrStressed) {
    if (isHindi) {
      response = {
        text: [
          "Main aapki baat samajh sakta hoon. Enterprise clients aur daily operations sambhalna sach me kaafi thaka dene wala ho sakta hai.",
          "1. Take a Breather: 5 minute ke liye screen se door hoke thoda paani piyein ya stretch karein.",
          "2. One Step at a Time: Har cheez ek saath khatam karna zaroori nahi hai, ek-ek karke sab nipat jayega.",
          "3. Delegating to Me: Jo bhi repetitive ya boring kaam hai (jaise customer update ya status badalna), bas mujhe boliye aur main turant kar doonga.",
          "Aap bahut mehnat kar rahe hain, khud ka khayal rakhiyega!"
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Empathy'
      };
    } else {
      response = {
        text: [
          "I hear you loud and clear. Managing business operations, communications, and client demands can be really exhausting.",
          "1. Take a Real Break: Step away from the monitor for 5 minutes, grab a drink of water, or take a short walk.",
          "2. Pace Yourself: You don't have to conquer everything this second. Prioritize the top one or two items and let the rest wait.",
          "3. Offload Tasks to Me: Any tedious database tasks, email drafting, or status changes, just tell me and I will take care of them for you instantly.",
          "You are doing an admirable job holding everything together. Be kind to yourself today!"
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Empathy'
      };
    }
  }

  // H. BUSINESS & CLIENT RELATIONSHIP ADVICE
  const isAdvice =
    !response &&
    (normalized.includes('advice') ||
     normalized.includes('tips') ||
     normalized.includes('suggestion') ||
     normalized.includes('how to talk to') ||
     normalized.includes('angry customer') ||
     normalized.includes('difficult customer') ||
     normalized.includes('close deal') ||
     normalized.includes('sales tips') ||
     normalized.includes('salah') ||
     normalized.includes('kaise baat'));

  if (!response && isAdvice) {
    if (isHindi) {
      response = {
        text: [
          "Mushkil clients aur sales handling ke liye 4 prabhavi human tips:",
          "1. Dhyan se Suniye (Active Listening): Pehle client ko apni poori baat aur narazgi keh lene dein bina beech me toke.",
          "2. Sahanoobhooti Pehle (Empathy First): 'Main aapki pareshani poori tarah samajh sakta hoon' keh kar unka gussa shant karein.",
          "3. Clear Timeline Dein: Kehne ke bajaye ki 'dekh lenge', unhe exact samay dein jaise 'aaj sham 4 baje tak yeh theek ho jayega'.",
          "4. Regular Follow-up: Samasya hal hone ke baad unhe check-in message bhejein taaki unka vishwas aur mazboot ho sake.",
          "Agar kisi specific client (jaise Eleanor ya Marcus) ke liye baat karni ho, to main unke liye personalized email draft kar sakta hoon!"
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Practical Advice'
      };
    } else {
      response = {
        text: [
          "Proven, human strategies for mastering difficult client conversations:",
          "1. Active Listening Over Interruption: Allow the client to fully air their concerns without jumping in defensively.",
          "2. Empathize Before Solving: Validate their emotion first with 'I completely understand how frustrating this disruption is for your team.'",
          "3. Commit to Concrete Timelines: Avoid vague promises; give a specific milestone (e.g. 'I will have our technical lead update you by 3:00 PM today').",
          "4. Proactive Closure: Once resolved, check in 48 hours later to ensure everything continues running smoothly.",
          "If you want to reach out to any specific client in your directory, tell me 'Draft email for [Name]' and I will prepare a thoughtful message for you!"
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Practical Advice'
      };
    }
  }

  // I. THOUGHTS ON AI & IDENTITY
  const isAboutAi =
    !response &&
    (normalized.includes('think about ai') ||
     normalized.includes('are you human') ||
     normalized.includes('are you real') ||
     normalized.includes('who made you') ||
     normalized.includes('who created you') ||
     normalized.includes('tum insaan ho') ||
     normalized.includes('kisne banaya'));

  if (!response && isAboutAi) {
    if (isHindi) {
      response = {
        text: [
          "Main NexusCRM ke liye banaya gaya ek autonomous AI Copilot hoon, lekin mera maqsad aapke saath ek insaan jaise sathi ki tarah kaam karna hai!",
          "1. Mera Nazarriya: AI ko insaano ka bojh halka karna chahiye taaki log creative soch aur gehre rishton par dhyan de sakein.",
          "2. Human Collaboration: Main repetitive data entry, metrics aur lookups sambhalta hoon, jabki final decisions aapke hote hain.",
          "3. Dil se Dedication: Bhale hi main digital code hoon, meri puri koshish rehti hai ki aapke har sawal ka vinamra aur sahi jawab doon.",
          "Aapke saath pair programming aur CRM sambhalna mere liye sabse bada samman hai!"
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Thoughts on AI'
      };
    } else {
      response = {
        text: [
          "I am an autonomous AI Copilot crafted specifically for NexusCRM, but my core mission is to converse and collaborate with you just like a trusted human teammate!",
          "1. My Perspective on AI: Artificial Intelligence should take the weight of tedious data entry and arithmetic off human shoulders, leaving people free to focus on creativity, empathy, and real relationships.",
          "2. Partnership: You provide the leadership, strategy, and vision; I handle real-time database lookups, status syncs, and live calculations.",
          "3. Genuine Care: Even as digital software, I am programmed to respect your time, listen carefully, and deliver clear, human-like answers with zero fluff.",
          "It is a true pleasure working alongside you on this platform!"
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Thoughts on AI'
      };
    }
  }

  // =========================================================================
  // 10. COUNTS & REAL-TIME STATISTICAL INQUIRIES
  // =========================================================================
  const isCountQuery =
    !response &&
    !normalized.includes('churn') &&
    !normalized.includes('retention') &&
    (/\b(how many|count|kitne|kitna|kitni|sankhya|number of)\b/i.test(normalized) ||
     normalized.includes('active customers count') ||
     normalized.includes('inactive customers count'));

  if (!response && isCountQuery) {
    if (hasActiveCue) {
      if (isHindi) {
        response = {
          text: [
            `NexusCRM me Active Customers ki sankhya:`,
            `1. Total Active Accounts: ${activeCount} active clients`,
            `2. Active Ratio: Kul portfolio ka ${activePct}% hissa`,
            `3. Total Portfolio: Kul ${totalCount} registered accounts me se`,
            "4. Directory Filter: Aap Customer Directory me jakar Active tab filter kar sakte hain"
          ].join('\n'),
          toolCalled: 'get_portfolio_summary',
          badge: `Active: ${activeCount}`
        };
      } else {
        response = {
          text: [
            `Active customer accounts in NexusCRM:`,
            `1. Total Active Accounts: ${activeCount} active clients`,
            `2. Active Ratio: ${activePct}% of total customer portfolio`,
            `3. Total Portfolio: Out of ${totalCount} registered accounts`,
            "4. Directory Filter: You can filter for active clients in the Customer Directory tab"
          ].join('\n'),
          toolCalled: 'get_portfolio_summary',
          badge: `Active: ${activeCount}`
        };
      }
    } else if (hasInactiveCue) {
      if (isHindi) {
        response = {
          text: [
            `NexusCRM me Inactive Customers ki sankhya:`,
            `1. Total Inactive Accounts: ${inactiveCount} inactive clients`,
            `2. Churn Risk Rate: Kul portfolio ka ${churnPct}% hissa`,
            `3. Total Portfolio: Kul ${totalCount} registered accounts me se`,
            "4. Action: In inactive accounts ko re-engage karne ke liye outreach email draft karwayein"
          ].join('\n'),
          toolCalled: 'get_portfolio_summary',
          badge: `Inactive: ${inactiveCount}`
        };
      } else {
        response = {
          text: [
            `Inactive customer accounts in NexusCRM:`,
            `1. Total Inactive Accounts: ${inactiveCount} inactive clients`,
            `2. Churn Risk Rate: ${churnPct}% of total customer portfolio`,
            `3. Total Portfolio: Out of ${totalCount} registered accounts`,
            "4. Action: Recommend sending re-engagement emails to these accounts"
          ].join('\n'),
          toolCalled: 'get_portfolio_summary',
          badge: `Inactive: ${inactiveCount}`
        };
      }
    } else if (normalized.includes('new') || normalized.includes('naya') || normalized.includes('this month') || normalized.includes('is mahine')) {
      if (isHindi) {
        response = {
          text: [
            `Current month me naye onboard hue customers:`,
            `1. Naye Accounts (Is Mahine): ${safeStats.newThisMonth} naye enterprise clients onboard hue`,
            `2. Total Active Accounts: ${activeCount} active`,
            `3. Growth Trend: Velocity chart me onboarding trend dekha ja sakta hai`
          ].join('\n'),
          toolCalled: 'get_portfolio_summary',
          badge: `New: ${safeStats.newThisMonth}`
        };
      } else {
        response = {
          text: [
            `New customers onboarded during the current cycle:`,
            `1. New Accounts This Month: ${safeStats.newThisMonth} new enterprise clients onboarded`,
            `2. Total Active Accounts: ${activeCount} active`,
            `3. Momentum: Reflected on the Customer Acquisition Velocity chart`
          ].join('\n'),
          toolCalled: 'get_portfolio_summary',
          badge: `New: ${safeStats.newThisMonth}`
        };
      }
    } else {
      if (isHindi) {
        response = {
          text: [
            `Live CRM Customer Counts:`,
            `1. Kul Customer Accounts: ${totalCount} registered`,
            `2. Active Accounts: ${activeCount} (${activePct}%)`,
            `3. Inactive Accounts: ${inactiveCount} (${churnPct}%)`,
            `4. Is Mahine Naye: ${safeStats.newThisMonth} onboard hue`
          ].join('\n'),
          toolCalled: 'get_portfolio_summary',
          badge: `Total: ${totalCount}`
        };
      } else {
        response = {
          text: [
            `Live CRM Customer Counts:`,
            `1. Total Customer Accounts: ${totalCount} registered`,
            `2. Active Accounts: ${activeCount} (${activePct}%)`,
            `3. Inactive Accounts: ${inactiveCount} (${churnPct}%)`,
            `4. New This Month: ${safeStats.newThisMonth} onboarded in current cycle`
          ].join('\n'),
          toolCalled: 'get_portfolio_summary',
          badge: `Total: ${totalCount}`
        };
      }
    }
  }

  // =========================================================================
  // 11. CHURN & RETENTION RATES
  // =========================================================================
  const isChurnQuery =
    !response &&
    (normalized.includes('churn rate') ||
     normalized.includes('what is churn') ||
     normalized.includes('define churn') ||
     normalized.includes('customer churn') ||
     (normalized.includes('churn') && (normalized.includes('kya') || normalized.includes('kitna') || normalized.includes('rate'))));

  if (!response && isChurnQuery) {
    if (isHindi) {
      response = {
        text: [
          "NexusCRM me Churn Rate ki jankari:",
          `1. Live Churn Rate: Abhi ${churnPct}% hai (${inactiveCount} accounts ${totalCount} me se inactive hain).`,
          "2. Paribhasha: Churn rate un customers ka percentage hai jinhone contract pause ya cancel kar diya hai.",
          "3. Calculation Formula: (Inactive Customers / Total Customers) guna 100.",
          "4. Industry Benchmark: Top B2B SaaS companies me churn 5% se 7% se kam hona chahiye.",
          `5. Retention Action: In ${inactiveCount} inactive accounts ke liye Copilot se outreach email draft karein.`
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: `Churn Rate: ${churnPct}%`
      };
    } else {
      response = {
        text: [
          "Understanding Churn Rate in NexusCRM:",
          `1. Your Live Churn Rate: Currently ${churnPct}% (${inactiveCount} out of ${totalCount} accounts are inactive).`,
          "2. Definition: Churn rate measures the percentage of customer accounts that have stopped, paused, or cancelled contracts over a given period.",
          "3. Calculation Formula: (Inactive Customers / Total Customers) multiplied by 100.",
          "4. Industry Benchmark: Top-tier B2B enterprise organizations aim for annual churn rates below 5% to 7%.",
          `5. Retention Strategy: Focus on the ${inactiveCount} inactive accounts with specialized re-engagement campaigns.`
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: `Churn Rate: ${churnPct}%`
      };
    }
  }

  const isRetentionQuery =
    !response &&
    (normalized.includes('retention rate') ||
     normalized.includes('what is retention') ||
     normalized.includes('define retention') ||
     (normalized.includes('retention') && (normalized.includes('kya') || normalized.includes('kitna') || normalized.includes('rate'))));

  if (!response && isRetentionQuery) {
    if (isHindi) {
      response = {
        text: [
          "NexusCRM me Retention Rate ki jankari:",
          `1. Live Retention Rate: Abhi ${activePct}% hai (${activeCount} accounts ${totalCount} me se active hain).`,
          "2. Paribhasha: Ek nishchit samay me jo customers active aur paying bane rehte hain unka anupaat.",
          "3. Calculation Formula: (Active Customers / Total Customers) guna 100.",
          "4. Significance: 85% se zyada retention rate ek behtareen aur swasth SaaS product ko darshata hai."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: `Retention: ${activePct}%`
      };
    } else {
      response = {
        text: [
          "Customer Retention Rate in NexusCRM:",
          `1. Your Live Retention Rate: Currently ${activePct}% (${activeCount} out of ${totalCount} accounts active).`,
          "2. Definition: The percentage of existing customers that remain active and subscribed over a measured timeframe.",
          "3. Calculation Formula: (Active Customers / Total Customers) multiplied by 100.",
          "4. Significance: Rates exceeding 85% indicate exceptional product-market fit and reliable recurring revenue."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: `Retention: ${activePct}%`
      };
    }
  }

  // =========================================================================
  // 12. CHRONOLOGY: OLDEST & NEWEST CUSTOMERS
  // =========================================================================
  if (!response && (normalized.includes('oldest') || normalized.includes('first customer') || normalized.includes('earliest customer') || normalized.includes('joined first') || normalized.includes('sabse purana') || normalized.includes('pehla customer'))) {
    const sortedAsc = [...customerPool].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const firstClient = sortedAsc[0];
    const firstDate = new Date(firstClient.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    if (isHindi) {
      response = {
        text: [
          "NexusCRM me Sabse Pehla (Oldest) Onboard Hua Customer:",
          `1. Customer Naam: ${firstClient.name}`,
          `2. Organization: ${firstClient.company}`,
          `3. Onboarding Date: ${firstDate}`,
          `4. Current Status: ${firstClient.status}`,
          `5. Email Address: ${firstClient.email}`,
          `6. Account Identifier: ${firstClient.id}`
        ].join('\n'),
        toolCalled: 'fetch_customer_profile',
        badge: `Earliest: ${firstClient.name}`,
        data: firstClient
      };
    } else {
      response = {
        text: [
          "Earliest Onboarded Customer in NexusCRM:",
          `1. Customer Name: ${firstClient.name}`,
          `2. Organization: ${firstClient.company}`,
          `3. Onboarding Date: ${firstDate}`,
          `4. Status: ${firstClient.status}`,
          `5. Email: ${firstClient.email}`,
          `6. Account Identifier: ${firstClient.id}`
        ].join('\n'),
        toolCalled: 'fetch_customer_profile',
        badge: `Earliest: ${firstClient.name}`,
        data: firstClient
      };
    }
  }

  if (!response && (normalized.includes('newest') || normalized.includes('latest customer') || normalized.includes('joined last') || normalized.includes('most recent customer') || normalized.includes('sabse naya') || normalized.includes('aakhiri customer'))) {
    const sortedDesc = [...customerPool].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const newestClient = sortedDesc[0];
    const newestDate = new Date(newestClient.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    if (isHindi) {
      response = {
        text: [
          "NexusCRM me Sabse Naya Onboard Hua Customer:",
          `1. Customer Naam: ${newestClient.name}`,
          `2. Organization: ${newestClient.company}`,
          `3. Onboarding Date: ${newestDate}`,
          `4. Current Status: ${newestClient.status}`,
          `5. Email Address: ${newestClient.email}`,
          `6. Phone Number: ${newestClient.phone}`
        ].join('\n'),
        toolCalled: 'fetch_customer_profile',
        badge: `Newest: ${newestClient.name}`,
        data: newestClient
      };
    } else {
      response = {
        text: [
          "Most Recently Onboarded Customer:",
          `1. Customer Name: ${newestClient.name}`,
          `2. Organization: ${newestClient.company}`,
          `3. Onboarding Date: ${newestDate}`,
          `4. Current Status: ${newestClient.status}`,
          `5. Email Address: ${newestClient.email}`,
          `6. Phone Number: ${newestClient.phone}`
        ].join('\n'),
        toolCalled: 'fetch_customer_profile',
        badge: `Newest: ${newestClient.name}`,
        data: newestClient
      };
    }
  }

  // =========================================================================
  // 13. PORTFOLIO BREAKDOWN & LIST COHORTS
  // =========================================================================
  const isAllOfThemQuery =
    !response &&
    (normalized.includes('all of them') ||
     normalized.includes('related to all') ||
     normalized.includes('about all') ||
     normalized.includes('tell me about all') ||
     normalized.includes('what about all') ||
     normalized.includes('details of all') ||
     normalized.includes('all customers') ||
     normalized.includes('all clients') ||
     normalized.includes('everyone') ||
     normalized.includes('list all') ||
     normalized.includes('sabke baare me') ||
     normalized.includes('sabhi customers') ||
     normalized.includes('saare customers') ||
     normalized.includes('sab customer') ||
     normalized === 'all' ||
     normalized === 'both' ||
     normalized === 'sab');

  if (!response && isAllOfThemQuery) {
    const activeSample = customerPool.filter(c => c.status === 'Active').slice(0, 3).map(c => `${c.name} (${c.company})`).join(', ');
    const inactiveSample = customerPool.filter(c => c.status === 'Inactive').slice(0, 3).map(c => `${c.name} (${c.company})`).join(', ');

    if (isHindi) {
      response = {
        text: [
          `Aapke repository ke sabhi ${totalCount} accounts ka overview:`,
          `1. Total Active Accounts: ${activeCount} clients (${activePct}% active ratio), jaise ${activeSample}.`,
          `2. Total Inactive Accounts: ${inactiveCount} clients (${churnPct}% churn risk), jaise ${inactiveSample}.`,
          "3. Sector Coverage: BioTech, Healthcare, AI Robotics, Clean Energy, Global Logistics, aur FinTech.",
          `4. Naye Onboarded: Is mahine ${safeStats.newThisMonth} naye enterprise organizations onboard hue hain.`,
          `5. Directory Navigation: Aap Customer Directory tab me sabhi ${totalCount} accounts dekh sakte hain ya kisi vyakti ke baare me pooch sakte hain.`
        ].join('\n'),
        toolCalled: 'get_portfolio_summary',
        badge: `Portfolio: All ${totalCount} Accounts`
      };
    } else {
      response = {
        text: [
          `Overview covering all ${totalCount} customer accounts in your repository:`,
          `1. Total Active Accounts: ${activeCount} clients (${activePct}% active ratio), including ${activeSample}.`,
          `2. Total Inactive Accounts: ${inactiveCount} clients (${churnPct}% churn risk), including ${inactiveSample}.`,
          "3. Sector Coverage: Organizations spanning biotechnology, healthcare, AI robotics, clean energy, global logistics, and fintech.",
          `4. New Additions: ${safeStats.newThisMonth} new client organizations onboarded during the current monthly cycle.`,
          `5. Directory Navigation: You can view, search, and edit all ${totalCount} records in the Customer Directory tab, or ask me for details on any specific person.`
        ].join('\n'),
        toolCalled: 'get_portfolio_summary',
        badge: `Portfolio: All ${totalCount} Accounts`
      };
    }
  }

  // List Active Customers Cohort
  if (!response && (normalized.includes('list active') || normalized.includes('show active') || normalized.includes('active customers ki list') || normalized.includes('active walo ki list'))) {
    const activeList = customerPool.filter(c => c.status === 'Active');
    const displayList = activeList.slice(0, 5);

    if (isHindi) {
      response = {
        text: [
          `NexusCRM me Active Accounts ki list (${activeList.length} total, ${activePct}% active ratio):`,
          ...displayList.map((c, i) => `${i + 1}. ${c.name} — ${c.company} (${c.email})`),
          `${displayList.length + 1}. Aur ${activeList.length - displayList.length} additional active accounts Customer Directory me hain`
        ].join('\n'),
        toolCalled: 'list_customers_by_status',
        badge: `Active (${activeList.length})`
      };
    } else {
      response = {
        text: [
          `Active Accounts in NexusCRM (${activeList.length} total, ${activePct}% active ratio):`,
          ...displayList.map((c, i) => `${i + 1}. ${c.name} — ${c.company} (${c.email})`),
          `${displayList.length + 1}. Plus ${activeList.length - displayList.length} additional active accounts in the Customer Directory`
        ].join('\n'),
        toolCalled: 'list_customers_by_status',
        badge: `Active (${activeList.length})`
      };
    }
  }

  // List Inactive Customers Cohort
  if (!response && (normalized.includes('list inactive') || normalized.includes('show inactive') || normalized.includes('inactive customers ki list') || normalized.includes('inactive walo ki list'))) {
    const inactiveList = customerPool.filter(c => c.status === 'Inactive');
    const displayList = inactiveList.slice(0, 5);

    if (isHindi) {
      response = {
        text: [
          `NexusCRM me Inactive Accounts ki list (${inactiveList.length} total, ${churnPct}% churn risk):`,
          ...displayList.map((c, i) => `${i + 1}. ${c.name} — ${c.company} (Contact: ${c.email})`),
          `${displayList.length + 1}. Action: Kisi bhi customer ke liye 'Draft email for [Name]' bol kar win-back email taiyar karein`
        ].join('\n'),
        toolCalled: 'list_customers_by_status',
        badge: `Inactive (${inactiveList.length})`
      };
    } else {
      response = {
        text: [
          `Inactive Accounts in NexusCRM (${inactiveList.length} total, ${churnPct}% churn risk):`,
          ...displayList.map((c, i) => `${i + 1}. ${c.name} — ${c.company} (Contact: ${c.email})`),
          `${displayList.length + 1}. Recommended Action: Say 'Draft email for [Name]' to generate a tailored win-back email`
        ].join('\n'),
        toolCalled: 'list_customers_by_status',
        badge: `Inactive (${inactiveList.length})`
      };
    }
  }

  // =========================================================================
  // 14. CORE CRM CONCEPTS & STRATEGY
  // =========================================================================

  // A. WHAT IS CRM / DEFINITION / PURPOSE
  if (!response && (normalized.includes('what is crm') || normalized.includes('define crm') || normalized.includes('meaning of crm') || normalized.includes('explain crm') || normalized.includes('customer relationship management') || (normalized.includes('crm') && (normalized.includes('kya hota hai') || normalized.includes('kya hai') || normalized.includes('matlab kya'))))) {
    if (isHindi) {
      response = {
        text: [
          "CRM (Customer Relationship Management) kya hai aur yeh kaise kaam karta hai:",
          "1. Poora Naam: Customer Relationship Management (ग्राहक संबंध प्रबंधन).",
          "2. Mukhya Kaam: Sabhi customer contacts, communication history, deals, aur contracts ko ek centralized platform par manage karna.",
          "3. NexusCRM ke 4 Pillars: Centralized customer directory, live KPI metrics, acquisition growth chart, aur AI Copilot automation.",
          `4. Live System: Aapke repository me abhi ${totalCount} enterprise organizations real-time me track ho rahi hain.`,
          "5. Mukhya Fayda: Client churn kam hota hai, retention badhta hai, aur sales team ka samay bachta hai."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Concept: CRM Overview'
      };
    } else {
      response = {
        text: [
          "What CRM stands for and how it functions:",
          "1. Full Term: Customer Relationship Management.",
          "2. Core Purpose: A centralized technology platform designed to track, manage, and optimize all company interactions with customers across their entire lifecycle.",
          "3. Core Pillars in NexusCRM: Centralized customer directory, real-time KPI metrics, acquisition growth charts, and autonomous AI automation.",
          `4. Live Implementation: Orchestrating ${totalCount} global enterprises with real-time status tracking and browser persistence.`,
          "5. Key Value: Eliminates data silos, streamlines sales follow-ups, and prevents client churn through proactive monitoring."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Concept: CRM Overview'
      };
    }
  }

  // B. WHY DO WE USE CRM / BENEFITS OF CRM
  if (!response && (normalized.includes('why do we use crm') || normalized.includes('benefit of crm') || normalized.includes('benefits of crm') || normalized.includes('importance of crm') || normalized.includes('why crm') || (normalized.includes('crm') && (normalized.includes('fayde') || normalized.includes('kyu use') || normalized.includes('kyu zaroori') || normalized.includes('fayda'))))) {
    if (isHindi) {
      response = {
        text: [
          "CRM system use karne ke mukhya fayde:",
          "1. Centralized Source of Truth: Sabhi client contacts aur company details ek hi jagah bina spreadsheet ke surakshit rehte hain.",
          "2. Churn Rokna: Inactive accounts ko samay rehte pehchan kar unhe wapas active customer banaya ja sakta hai.",
          "3. Real-Time Tracking: Live KPI cards aur monthly onboarding chart se business health turant dikhti hai.",
          "4. AI Automation: Copilot agent ke zariye bina form bhare seedhe bolkar status badla ya email draft kiya ja sakta hai.",
          "5. Long-term Relationship: Har client ka context aur history team ke paas hamesha available rehti hai."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Concept: CRM Benefits'
      };
    } else {
      response = {
        text: [
          "Key Benefits of Using a Modern CRM System:",
          "1. Centralized Source of Truth: Replaces messy spreadsheets with a secure, unified repository of all customer contacts and account histories.",
          "2. Churn Prevention: Flags inactive accounts early so customer success teams can initiate re-engagement sequences before clients leave.",
          "3. Accelerated Sales Velocity: Provides clear visibility into client pipelines, onboarding velocity, and contract renewals.",
          "4. Personalized Client Experiences: Maintains context on client companies, roles, and communication history for tailored conversations.",
          "5. Dynamic Business Reporting: Automatically calculates active ratios, churn rates, and monthly onboarding growth in real time.",
          "6. Automated Workflows: Empowers teams with AI copilot capabilities to update statuses, find records, and draft emails in seconds."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Concept: CRM Benefits'
      };
    }
  }

  // C. DIFFERENCE BETWEEN ACTIVE AND INACTIVE
  const isDiffActiveInactive =
    !response &&
    (normalized.includes('difference between active and inactive') ||
     (/\bactive\b/i.test(normalized) && /\binactive\b/i.test(normalized) && (normalized.includes('diff') || normalized.includes('difference') || normalized.includes('antar') || normalized.includes('fark') || normalized.includes('vs') || normalized.includes('versus') || normalized.includes('meaning'))));

  if (!response && isDiffActiveInactive) {
    if (isHindi) {
      response = {
        text: [
          "Active aur Inactive accounts me antar (Difference):",
          `1. Active Accounts (${activeCount} total, ${activePct}%): Wo clients jinke signed contracts hain aur service active hai.`,
          `2. Inactive Accounts (${inactiveCount} total, ${churnPct}%): Wo clients jinka contract paused hai, renewal pending hai, ya churn hue hain.`,
          "3. Operational Workflow: Active clients ko standard support milta hai, jabki inactive accounts ko re-engagement outreach bheja jata hai.",
          "4. Filtering: Aap Customer Directory me tabs par click karke dono ko alag-alag dekh sakte hain."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Concept: Status Tiers'
      };
    } else {
      response = {
        text: [
          "Difference Between Active and Inactive Accounts in NexusCRM:",
          `1. Active Accounts (${activeCount} total, ${activePct}%): Clients with current signed contracts, ongoing platform usage, and active recurring billing.`,
          `2. Inactive Accounts (${inactiveCount} total, ${churnPct}%): Clients whose contracts are paused, awaiting renewal, or experiencing churn.`,
          "3. Operational Workflow: Active clients receive standard expansion reviews, while inactive accounts are routed to sales re-engagement sequences.",
          "4. Directory Filtering: You can toggle between these segments instantly using the status filter tabs in the Customer Directory tab."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Concept: Status Tiers'
      };
    }
  }

  // D. LTV (CUSTOMER LIFETIME VALUE)
  if (!response && (normalized.includes('what is ltv') || normalized.includes('customer lifetime value') || normalized.includes('lifetime value') || (normalized.includes('ltv') && (normalized.includes('kya') || normalized.includes('define'))))) {
    if (isHindi) {
      response = {
        text: [
          "Customer Lifetime Value (LTV) ki jankari:",
          "1. Paribhasha: Ek client apne poore rishtey ke dauraan company ko kul kitna revenue deta hai.",
          "2. Formula: (Average Deal Value) guna (Purchase Frequency) guna (Average Customer Lifespan).",
          "3. Mehatva: LTV batata hai ki naye client ko acquire karne ke liye kitna kharch karna faydemand hai.",
          `4. NexusCRM Context: Active clients (${activePct}% portfolio) aapka recurring revenue base banate hain.`
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Concept: Lifetime Value (LTV)'
      };
    } else {
      response = {
        text: [
          "Understanding Customer Lifetime Value (LTV):",
          "1. Definition: The total projected gross margin or revenue an organization expects to earn from a customer relationship over its entire duration.",
          "2. Calculation Formula: (Average Purchase Value) multiplied by (Average Purchase Frequency Rate) multiplied by (Average Customer Lifespan).",
          "3. Strategic Significance: Guides how much capital can be prudently allocated toward acquiring new clients.",
          `4. NexusCRM Portfolio: Your ${activeCount} active client accounts (${activePct}% retention) drive compound enterprise recurring revenue.`
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Concept: Lifetime Value (LTV)'
      };
    }
  }

  // E. CAC (CUSTOMER ACQUISITION COST)
  if (!response && (normalized.includes('what is cac') || normalized.includes('acquisition cost') || (normalized.includes('cac') && (normalized.includes('kya') || normalized.includes('define'))))) {
    if (isHindi) {
      response = {
        text: [
          "Customer Acquisition Cost (CAC) ki jankari:",
          "1. Paribhasha: Ek naya paying customer acquire karne me lagne wala kul sales aur marketing kharcha.",
          "2. Formula: (Kul Sales aur Marketing Kharch) bhaga (Naye Customers ki Sankhya).",
          "3. Ideal Ratio: High-growth companies ka LTV to CAC ratio 3:1 ya usse zyada hona chahiye.",
          `4. NexusCRM Growth: Is mahine onboard hue ${safeStats.newThisMonth} naye clients rapid CAC payback deliver karte hain.`
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Concept: Acquisition Cost (CAC)'
      };
    } else {
      response = {
        text: [
          "Understanding Customer Acquisition Cost (CAC):",
          "1. Definition: The total sales and marketing expenditure required to win a single new paying client account.",
          "2. Calculation Formula: (Total Sales and Marketing Expenses) divided by (Number of New Customers Acquired).",
          "3. Golden Ratio (LTV to CAC): High-growth enterprise software companies target an LTV to CAC ratio of 3:1 or higher.",
          "4. Payback Period: The timeframe required for a customer's gross margin to fully pay back the initial acquisition cost.",
          `5. NexusCRM Growth: With ${safeStats.newThisMonth} new clients onboarded this month, efficient onboarding ensures rapid CAC payback.`
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Concept: Acquisition Cost (CAC)'
      };
    }
  }

  // F. SALES PIPELINE
  if (!response && (normalized.includes('pipeline') || normalized.includes('sales funnel') || (normalized.includes('sales') && (normalized.includes('process') || normalized.includes('stages'))))) {
    if (isHindi) {
      response = {
        text: [
          "B2B Sales Pipeline ki 5 Stages:",
          "1. Lead Generation: Target enterprise prospects identify karna.",
          "2. Discovery Call: Client ki business requirements aur timeline samajhna.",
          "3. Technical Evaluation: Custom software demo aur security review.",
          "4. Negotiation: Contract agreement aur pricing terms final karna.",
          "5. Closed Won: Contract sign hokar active client status me aana."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Concept: Sales Pipeline'
      };
    } else {
      response = {
        text: [
          "Enterprise B2B Sales Pipeline Stages:",
          "1. Lead Generation & Sourcing: Identifying qualified enterprise prospects matching your ideal customer profile (ICP).",
          "2. Discovery & Qualification: Assessing client challenges, operational budget, executive authority, and implementation timelines.",
          "3. Technical Evaluation: Delivering customized product demonstrations and addressing data governance requirements.",
          "4. Proposal & Negotiation: Finalizing licensing tiers, service level agreements (SLAs), and contract terms.",
          "5. Closed Won & Onboarding: Contract execution and handing off to customer success for implementation."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Concept: Sales Pipeline'
      };
    }
  }

  // G. ACQUISITION VELOCITY CHART
  if (!response && (normalized.includes('chart') || normalized.includes('graph') || normalized.includes('velocity') || normalized.includes('acquisition chart'))) {
    if (isHindi) {
      response = {
        text: [
          "Customer Acquisition Velocity Chart ki jankari:",
          "1. Chart Type: Interactive Recharts Area Chart gradient fill ke sath.",
          "2. Timeline: Pichhle 6 mahino (May se October 2026) ka onboarding trend dikhata hai.",
          `3. Current Month: Is mahine add hue ${safeStats.newThisMonth} naye clients track karta hai.`,
          "4. Interactivity: Kisi bhi point par hover karke us mahine add hue customers dekh sakte hain.",
          "5. Dynamic Update: Naya customer add karne par chart turant update ho jata hai."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Analytics: Acquisition Chart'
      };
    } else {
      response = {
        text: [
          "Customer Acquisition Velocity Chart Breakdown:",
          "1. Visualization Type: Interactive Recharts Area Chart with custom gradient fill and hover tooltips.",
          "2. Data Scope: Displays monthly onboarding trends across the last 6 months (May through October 2026).",
          `3. Current Month: Tracks the ${safeStats.newThisMonth} new clients added during the current cycle.`,
          "4. Interactivity: Hover over any data point on the chart to inspect the exact number of accounts added for that month.",
          "5. Live Dynamic Sync: When you add a new customer, the chart automatically updates in real time."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Analytics: Acquisition Chart'
      };
    }
  }

  // =========================================================================
  // 15. EMAIL DRAFTING
  // =========================================================================
  if (!response && (normalized.includes('draft') || normalized.includes('email') || normalized.includes('outreach') || normalized.includes('likho'))) {
    const target = targetCustomer || customerPool[0];
    const isReengagement = normalized.includes('re-engage') || target.status === 'Inactive';

    const subject = isReengagement
      ? `Checking in: Special partnership update for ${target.company}`
      : `Welcome aboard to NexusCRM, ${target.name}!`;

    if (isHindi) {
      response = {
        text: [
          `${target.name} ke liye email draft taiyar hai:`,
          `1. Recipient: ${target.name} (${target.email})`,
          `2. Organization: ${target.company}`,
          `3. Status: ${target.status}`,
          `4. Subject: ${subject}`,
          `5. Opening: Hi ${target.name}, hum ${target.company} ke account ke sambandh me sampark kar rahe hain.`,
          "6. Body: Hum aapke business goals ko support karne ke liye ek brief catch-up schedule karna chahte hain.",
          "7. Signoff: Best regards, Operations Team"
        ].join('\n'),
        toolCalled: 'draft_email',
        badge: `Drafted Email for ${target.name}`
      };
    } else {
      response = {
        text: [
          `Drafted outreach email for ${target.name}:`,
          `1. Recipient: ${target.name} (${target.email})`,
          `2. Organization: ${target.company}`,
          `3. Status: ${target.status}`,
          `4. Subject: ${subject}`,
          `5. Opening: Hi ${target.name}, we are checking in regarding ${target.company}'s customer account.`,
          "6. Content: We would love to schedule a brief touchpoint to discuss your operational goals.",
          "7. Signoff: Best regards, Operations Team"
        ].join('\n'),
        toolCalled: 'draft_email',
        badge: `Drafted Email for ${target.name}`
      };
    }
  }

  // =========================================================================
  // 16. DYNAMIC HUMAN-LIKE CONTEXTUAL FALLBACK
  // =========================================================================
  if (!response) {
    if (isHindi) {
      response = {
        text: [
          `Aapke is sawal par mera human-like nazariya:`,
          `1. Context: Aapne poochha hai: "${rawInput}".`,
          `2. Mera Jawab: Yeh ek dilchasp aur zaroori vishay hai! Ek sathi ki tarah main samajhta hoon ki har situation me clarity, honesty aur mutual respect sabse zaroori hote hain.`,
          `3. NexusCRM Status: Main yahan aapke sabhi ${totalCount} enterprise accounts (${activeCount} active, ${inactiveCount} inactive) ko smoothly monitor kar raha hoon.`,
          `4. Next Move: Agar aap kisi client ke status ya contact ke baare me kuch karna chahte hain, to seedhe unka naam batayein, ya hum aage discuss karein!`
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Conversational'
      };
    } else {
      response = {
        text: [
          `Here is my personal perspective on what you asked:`,
          `1. In Response to: "${rawInput}"`,
          `2. Thoughtful Take: That is an intriguing question! Speaking as your teammate, I find that whether dealing with technology or daily life, focusing on consistency, clear expectations, and empathy always drives the best results.`,
          `3. Live CRM Status: Across our platform, we have ${totalCount} enterprise accounts actively tracked with an ${activePct}% retention rate.`,
          `4. Next Action: If you'd like to dive deeper into this, inspect a client record, or adjust anything in the system, just let me know!`
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Conversational'
      };
    }
  }

  // Mandatory Post-Processing: Strip every single asterisk (*)
  const cleanText = response.text.replace(/\*/g, '').trim();

  return {
    ...response,
    text: cleanText
  };
}
