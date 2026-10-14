/**
 * NexusCRM AI Copilot Agent Service
 * Omniscient Multilingual CRM Knowledge Engine & Autonomous Operations Assistant.
 * Fully understands English, Hindi, and Hinglish.
 * Converses naturally like a human in flowing sentences for normal questions.
 * Uses numbered points ONLY when presenting huge, multi-item, or multi-step data.
 * Guaranteed: Zero asterisks (*), strictly human-like tone, live state persistence.
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

export function stripFriendReferences(text) {
  if (!text) return '';
  let str = text;

  // Case-insensitive replacements for English addresses
  str = str.replace(/\b(hey|hello|hi)\s+friend\b/gi, '$1 there');
  str = str.replace(/\bmy\s+friend\b/gi, '');
  str = str.replace(/,\s*friend([.!,:;?])/gi, '$1');
  str = str.replace(/,\s*friend\b/gi, '');
  str = str.replace(/\bfriend([.!,:;?])/gi, '$1');
  str = str.replace(/\bfriend\b/gi, '');

  // Case-insensitive replacements for Hindi addresses
  str = str.replace(/\bmere\s+dost\b/gi, '');
  str = str.replace(/,\s*dost([.!,:;?])/gi, '$1');
  str = str.replace(/,\s*dost\b/gi, '');
  str = str.replace(/\bdost([.!,:;?])/gi, '$1');
  str = str.replace(/\bdost\b/gi, '');

  // Normalize spacing and orphan punctuation
  str = str.replace(/[ \t]{2,}/g, ' ');
  str = str.replace(/\s+([.!,:;?])/g, '$1');
  str = str.replace(/^[.!,:;?]\s*/gm, '');

  return str.trim();
}

export async function processCopilotMessage(userInput, context) {
  const rawInput = (userInput || '').trim();
  const lower = rawInput.toLowerCase();

  // 1. Devanagari script detection
  const hasDevanagari = /[\u0900-\u097F]/.test(rawInput);

  // Common Hindi & Hinglish vocabulary cues (excluding common English pronoun 'me')
  const hindiIndicators = [
    'kya', 'hai', 'hain', 'kaun', 'kon', 'kahan', 'kaha', 'kidhar', 'kaise', 'kese', 'kyu', 'kyun', 'kyon',
    'kitne', 'kitna', 'kitni', 'kab', 'konsa', 'konsi', 'karo', 'kardo', 'kar do', 'kar dena',
    'banao', 'bana do', 'hata do', 'hatao', 'nikal do', 'jodo', 'daalo', 'likho', 'bhejo', 'dikhao',
    'batao', 'bataiye', 'sabke', 'sabhi', 'saare', 'sare', 'sab', 'purana', 'naya', 'nayi', 'fayde',
    'kuch', 'kuchh', 'matlab', 'antar', 'fark', 'walo', 'wale', 'wali', 'ka', 'ki', 'ke', 'ko', 'mein', 'se',
    'tum', 'aap', 'mera', 'meri', 'hamara', 'chahiye', 'sakta', 'sakti', 'samajh', 'samajhte',
    'badlo', 'badal', 'lagao', 'madad', 'sawal', 'jawab', 'hindi', 'bhasha', 'bol', 'bolo',
    'karein', 'kare', 'bataiye', 'kiska', 'iski', 'uska', 'unki', 'unke',
    'namaste', 'namaskar', 'pranam', 'shukriya', 'dhanyawad'
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

  const today = new Date();
  const addedTodayCustomers = customerPool.filter(c => {
    if (!c.createdAt) return false;
    const d = new Date(c.createdAt);
    return d.toDateString() === today.toDateString();
  });
  const addedTodayCount = addedTodayCustomers.length;

  const hasCountKeywords =
    /\b(how many|how much|count|total count|sankhya|kitne|kitna|kitni|number of)\b/i.test(normalized) ||
    normalized.includes('customers count') ||
    normalized.includes('accounts count') ||
    normalized.includes('kitne customer') ||
    normalized.includes('kitne clients') ||
    (normalized.includes('how') && (normalized.includes('many') || normalized.includes('much')));

  const directorName = (profile?.name || user?.name || 'Alex Morgan').trim();
  const directorRole = profile?.role || user?.role || 'Operations Director';
  const directorEmail = profile?.email || user?.email || 'alex.morgan@nexuscrm.io';
  const directorPhone = profile?.phone || '+1 (555) 019-2834';
  const directorCompany = profile?.company || 'Nexus Global Technologies';
  const directorBio = profile?.bio || 'Leading customer growth, onboarding workflows, and operational efficiency across all client accounts.';

  // 3. TARGET CUSTOMER RECOGNITION (Multi-field match)
  let targetCustomer = null;
  let targetScore = 0;
  let matchedCompany = null;

  for (const c of customerPool) {
    const fullName = c.name.toLowerCase();
    const parts = fullName.split(' ');
    const firstName = parts[0];
    const lastName = parts[1] || '';
    const company = c.company.toLowerCase();
    const id = c.id.toLowerCase();
    const email = c.email.toLowerCase();

    const compParts = company.split(/\s+/).filter(p => p.length >= 4 && !['logistics', 'technologies', 'solutions', 'systems', 'analytics', 'capital', 'group', 'retail', 'labs', 'engineering', 'biotech', 'media', 'microchips'].includes(p));
    const compMatches = normalized.includes(company) || compParts.some(p => new RegExp(`\\b${p}\\b`, 'i').test(normalized));

    if (compMatches && !matchedCompany) {
      matchedCompany = c.company;
    }

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

  // Greeting detection & pure greeting reciprocation
  const greetingPattern = /\b(hi|hello|hey|hiya|greetings|namaste|namaskar|salaam|good\s+morning|good\s+afternoon|good\s+evening)\b/i;
  const userGreetingMatch = normalized.match(greetingPattern);
  const userSaidGreeting = !!userGreetingMatch;

  const queryWithoutGreeting = normalized
    .replace(/\b(hi|hello|hey|hiya|greetings|namaste|namaskar|salaam|good\s+morning|good\s+afternoon|good\s+evening)\b/gi, '')
    .replace(/\b(there|copilot|ai|nexus|assistant|ji|bhai|sir|mam|friend|dost)\b/gi, '')
    .replace(/[^\w\s]/g, '')
    .trim();

  const isPureGreeting = userSaidGreeting && queryWithoutGreeting.length === 0;

  let response = null;

  // If user ONLY greeted, reciprocate immediately with a warm human greeting
  if (isPureGreeting) {
    response = {
      text: isHindi
        ? "Namaste! Main aapki kya madad karoon?"
        : "Hello! How can I help you today?",
      toolCalled: 'explain_crm_concept',
      badge: 'Nexus AI: Hello!'
    };
  }

  // =========================================================================
  // 0. SPECIFIC QUERY: "DO YOU UNDERSTAND HINDI?" / "KYA TUM HINDI SAMAJHTE HO"
  // =========================================================================
  const isAskingAboutHindi =
    !response &&
    normalized.includes('hindi') &&
    (normalized.includes('samajh') || normalized.includes('understand') || normalized.includes('speak') || normalized.includes('aati') || normalized.includes('baat') || normalized.includes('bolo') || normalized.includes('bolte') || normalized.includes('kya'));

  if (isAskingAboutHindi) {
    response = {
      text: isHindi
        ? "Haan, main Hindi aur English dono bhashayein samajhta hoon. Bataiye main aapki kya madad karoon?"
        : "Yes, I understand both English and Hindi. How can I help you today?",
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
    response = {
      text: isHindi
        ? `Maine ${targetCustomer.name} (${targetCustomer.company}) ko directory se delete kar diya hai.`
        : `Deleted ${targetCustomer.name} (${targetCustomer.company}) from the customer directory.`,
      toolCalled: 'delete_customer',
      badge: `Deleted ${targetCustomer.name}`
    };
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

    response = {
      text: isHindi
        ? `${targetCustomer.name} ka status badal kar ${targetStatus} kar diya hai.`
        : `Updated ${targetCustomer.name}'s status to ${targetStatus}.`,
      toolCalled: 'update_customer',
      badge: `Updated ${updated.name}`,
      data: updated
    };
  }

  // =========================================================================
  // 3. MUTATION ACTIONS: UPDATE CONTACT INFO (PHONE / EMAIL / COMPANY)
  // =========================================================================
  const isQuestionQuery =
    /^(what|which|where|who|tell|show|check|kya|kis|kahan|kaun|batao)\b/i.test(normalized) ||
    normalized.includes('?') ||
    normalized.includes('kya hai') ||
    normalized.includes('kis company') ||
    normalized.includes('phone kya') ||
    normalized.includes('email kya');

  const hasUpdateVerb =
    normalized.includes('update') ||
    normalized.includes('change') ||
    normalized.includes('badlo') ||
    normalized.includes('badal') ||
    normalized.includes('set') ||
    normalized.includes('edit');

  if (!response && targetCustomer && !isQuestionQuery && (hasUpdateVerb || normalized.includes('to'))) {
    const emailMatch = rawInput.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const phoneMatch = rawInput.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/);
    const companyMatch = rawInput.match(/(?:company\s+to|change\s+company\s+to|update\s+company\s+to|moved\s+to|joined|now\s+at)\s+([A-Za-z0-9&.\s]+?)(?:,|\.|\bphone|\bemail|\bactive|\binactive|$)/i);

    const changes = {};
    const detailPoints = [];
    const detailPointsHindi = [];

    if (emailMatch && emailMatch[1] !== targetCustomer.email) {
      changes.email = emailMatch[1];
      detailPoints.push(`email to ${emailMatch[1]}`);
      detailPointsHindi.push(`email badal kar ${emailMatch[1]}`);
    }

    if (phoneMatch && phoneMatch[0] !== targetCustomer.phone) {
      changes.phone = phoneMatch[0];
      detailPoints.push(`phone to ${phoneMatch[0]}`);
      detailPointsHindi.push(`phone badal kar ${phoneMatch[0]}`);
    }

    if (companyMatch && companyMatch[1]) {
      const cleanCompany = companyMatch[1].trim();
      if (cleanCompany && !['to', 'is', 'active', 'inactive', 'the', 'a', 'ko', 'ka', 'ki'].includes(cleanCompany.toLowerCase()) && cleanCompany !== targetCustomer.company) {
        changes.company = cleanCompany;
        detailPoints.push(`company to ${cleanCompany}`);
        detailPointsHindi.push(`company badal kar ${cleanCompany}`);
      }
    }

    if (Object.keys(changes).length > 0) {
      if (typeof updateCustomer === 'function') {
        updateCustomer(targetCustomer.id, changes);
      }
      const updated = { ...targetCustomer, ...changes };

      if (isHindi) {
        response = {
          text: `${targetCustomer.name} ke contact details update ho gaye (${detailPointsHindi.join(', ')}).`,
          toolCalled: 'update_customer',
          badge: `Updated ${updated.name}`,
          data: updated
        };
      } else {
        response = {
          text: `Updated ${targetCustomer.name}'s contact details (${detailPoints.join(', ')}).`,
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
      response = {
        text: isHindi ? "Dark Mode switch ho gaya." : "Switched to Dark Mode.",
        toolCalled: 'toggle_theme',
        badge: 'Theme: Dark'
      };
    } else if (wantsLight) {
      if (theme !== 'light') {
        if (typeof setTheme === 'function') setTheme('light');
        else if (typeof toggleTheme === 'function') toggleTheme();
      }
      response = {
        text: isHindi ? "Light Mode switch ho gaya." : "Switched to Light Mode.",
        toolCalled: 'toggle_theme',
        badge: 'Theme: Light'
      };
    } else {
      if (typeof toggleTheme === 'function') toggleTheme();
      const nextTheme = theme === 'dark' ? 'Light' : 'Dark';
      response = {
        text: isHindi ? `${nextTheme} Mode switch ho gaya.` : `Switched to ${nextTheme} Mode.`,
        toolCalled: 'toggle_theme',
        badge: `Theme: ${nextTheme}`
      };
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
        text: `Customer ${name} (${company}) directory me Active status ke sath add ho gaya hai (Email: ${emailGenerated}, Phone: ${newCust.phone}).`,
        toolCalled: 'add_customer',
        badge: `Added ${name} (${company})`,
        data: newCust
      };
    } else {
      response = {
        text: `Added ${name} (${company}) as an Active customer (Email: ${emailGenerated}, Phone: ${newCust.phone}).`,
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
      response = {
        text: isHindi
          ? `${targetCustomer.name} ka phone number ${targetCustomer.phone} hai.`
          : `${targetCustomer.name}'s phone number is ${targetCustomer.phone}.`,
        toolCalled: 'fetch_customer_profile',
        badge: `Phone: ${targetCustomer.name}`,
        data: targetCustomer
      };
    } else if (isAskingEmail) {
      response = {
        text: isHindi
          ? `${targetCustomer.name} ka email ${targetCustomer.email} hai.`
          : `${targetCustomer.name}'s email is ${targetCustomer.email}.`,
        toolCalled: 'fetch_customer_profile',
        badge: `Email: ${targetCustomer.name}`,
        data: targetCustomer
      };
    } else if (isAskingCompany) {
      response = {
        text: isHindi
          ? `${targetCustomer.name} ${targetCustomer.company} ke sath hain.`
          : `${targetCustomer.name} is with ${targetCustomer.company}.`,
        toolCalled: 'fetch_customer_profile',
        badge: `Company: ${targetCustomer.name}`,
        data: targetCustomer
      };
    } else if (isAskingStatus) {
      const isCurrentlyActive = targetCustomer.status === 'Active';
      const askingIfActive = /\bactive\b/i.test(normalized) && !/\binactive\b/i.test(normalized);
      const askingIfInactive = /\binactive\b/i.test(normalized);

      let answerTextEn = `${targetCustomer.name} is currently ${targetCustomer.status}.`;
      let answerTextHi = `${targetCustomer.name} is waqt ${targetCustomer.status} hain.`;

      if (askingIfActive) {
        answerTextEn = isCurrentlyActive ? `Yes, ${targetCustomer.name} is Active.` : `No, ${targetCustomer.name} is Inactive.`;
        answerTextHi = isCurrentlyActive ? `Haan, ${targetCustomer.name} Active hain.` : `Nahi, ${targetCustomer.name} Inactive hain.`;
      } else if (askingIfInactive) {
        answerTextEn = !isCurrentlyActive ? `Yes, ${targetCustomer.name} is Inactive.` : `No, ${targetCustomer.name} is Active.`;
        answerTextHi = !isCurrentlyActive ? `Haan, ${targetCustomer.name} Inactive hain.` : `Nahi, ${targetCustomer.name} Active hain.`;
      }

      response = {
        text: isHindi ? answerTextHi : answerTextEn,
        toolCalled: 'fetch_customer_profile',
        badge: `${targetCustomer.name}: ${targetCustomer.status}`,
        data: targetCustomer
      };
    } else {
      // General full customer profile
      response = {
        text: isHindi
          ? `${targetCustomer.name} ${targetCustomer.company} ke sath ${targetCustomer.status} customer hain (Email: ${targetCustomer.email}, Phone: ${targetCustomer.phone}).`
          : `${targetCustomer.name} is an ${targetCustomer.status} customer at ${targetCustomer.company} (Email: ${targetCustomer.email}, Phone: ${targetCustomer.phone}).`,
        toolCalled: 'fetch_customer_profile',
        badge: `Profile: ${targetCustomer.name}`,
        data: targetCustomer
      };
    }
  }

  // =========================================================================
  // 6.5. COMPANY-SPECIFIC LOOKUPS
  // =========================================================================
  if (!response && matchedCompany) {
    const compLower = matchedCompany.toLowerCase();
    const compParts = compLower.split(/\s+/).filter(p => p.length >= 4 && !['logistics', 'technologies', 'solutions', 'systems', 'analytics', 'capital', 'group', 'retail', 'labs', 'engineering'].includes(p));
    const mentionsCompany = normalized.includes(compLower) || compParts.some(p => new RegExp(`\\b${p}\\b`, 'i').test(normalized));

    const isCompanyQuery =
      mentionsCompany &&
      (normalized.includes('company') ||
       normalized.includes('who is at') ||
       normalized.includes('who is in') ||
       normalized.includes('who works at') ||
       normalized.includes('who works in') ||
       normalized.includes('kaun hai') ||
       normalized.includes('tell me about') ||
       normalized.includes('baare me') ||
       normalized.includes('customers at') ||
       normalized.includes('clients at') ||
       normalized.includes('at ') ||
       normalized.includes('from '));

    if (isCompanyQuery) {
      const compCustomers = customerPool.filter(c => c.company.toLowerCase() === matchedCompany.toLowerCase());
      if (compCustomers.length > 0) {
        if (isHindi) {
          response = {
            text: `${matchedCompany} me hamare ${compCustomers.length} customer account(s) registered hain: ${compCustomers.map(c => `${c.name} (${c.status})`).join(', ')}.`,
            toolCalled: 'fetch_customer_profile',
            badge: `Company: ${matchedCompany}`
          };
        } else {
          response = {
            text: `We have ${compCustomers.length} customer account(s) at ${matchedCompany}: ${compCustomers.map(c => `${c.name} (${c.status})`).join(', ')}.`,
            toolCalled: 'fetch_customer_profile',
            badge: `Company: ${matchedCompany}`
          };
        }
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
        text: `Aap ${directorName} (${directorRole}) hain ${directorCompany} me (Email: ${directorEmail}).`,
        toolCalled: 'explain_crm_concept',
        badge: `Director: ${directorName}`
      };
    } else {
      response = {
        text: `You are logged in as ${directorName} (${directorRole}) at ${directorCompany} (Email: ${directorEmail}).`,
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
    !hasCountKeywords &&
    (/\bhow\s+(to|do\s+i|can\s+i)\s+(add|create|insert|register|onboard)\b/i.test(normalized) ||
     normalized.includes('kaise add') ||
     normalized.includes('kaise jodein') ||
     normalized.includes('kaise create') ||
     normalized.includes('add karne ke steps') ||
     normalized.includes('add karne ka tarika') ||
     normalized.includes('add karne ka tareeqa') ||
     normalized.includes('steps to add') ||
     normalized.includes('process to add') ||
     (normalized.startsWith('how to') && normalized.includes('add')));

  if (!response && isHowToAdd) {
    if (isHindi) {
      response = {
        text: "Top header me '+ Add Customer' par click karein, ya chat me likhein 'Add customer [Name] at [Company]'.",
        toolCalled: 'explain_crm_concept',
        badge: 'How-To: Add Customer'
      };
    } else {
      response = {
        text: "Click '+ Add Customer' in the top header, or type 'Add customer [Name] at [Company]'.",
        toolCalled: 'explain_crm_concept',
        badge: 'How-To: Add Customer'
      };
    }
  }

  const isHowToUpdate =
    !response &&
    !hasCountKeywords &&
    (/\bhow\s+(to|do\s+i|can\s+i)\s+(update|edit|modify|change)\b/i.test(normalized) ||
     normalized.includes('kaise update') ||
     normalized.includes('kaise badlein') ||
     normalized.includes('kaise change') ||
     normalized.includes('update karne ke steps') ||
     normalized.includes('update karne ka tarika') ||
     normalized.includes('steps to update') ||
     normalized.includes('process to update') ||
     (normalized.startsWith('how to') && normalized.includes('update')));

  if (!response && isHowToUpdate) {
    if (isHindi) {
      response = {
        text: "Customer Directory me pencil (Edit) icon par click karein, ya chat me likhein 'Update [Name] phone to [Number]'.",
        toolCalled: 'explain_crm_concept',
        badge: 'How-To: Update Customer'
      };
    } else {
      response = {
        text: "Click the pencil (Edit) icon on any customer row in the Customer Directory, or type 'Update [Name] phone to [Number]'.",
        toolCalled: 'explain_crm_concept',
        badge: 'How-To: Update Customer'
      };
    }
  }

  const isHowToDelete =
    !response &&
    !hasCountKeywords &&
    (/\bhow\s+(to|do\s+i|can\s+i)\s+(delete|remove|purge|erase)\b/i.test(normalized) ||
     normalized.includes('kaise delete') ||
     normalized.includes('kaise hatayein') ||
     normalized.includes('delete karne ke steps') ||
     normalized.includes('delete karne ka tarika') ||
     normalized.includes('steps to delete') ||
     normalized.includes('process to delete') ||
     (normalized.startsWith('how to') && normalized.includes('delete')));

  if (!response && isHowToDelete) {
    if (isHindi) {
      response = {
        text: "Customer Directory me red delete icon par click karein, ya chat me likhein 'Delete [Name]'.",
        toolCalled: 'explain_crm_concept',
        badge: 'How-To: Delete Customer'
      };
    } else {
      response = {
        text: "Click the red trash icon on any customer row in the Customer Directory, or type 'Delete [Name]'.",
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
        text: `NexusCRM me centralized customer directory (${totalCount} accounts), live KPI analytics (Active Ratio: ${activePct}%, Churn: ${churnPct}%), acquisition chart, aur autonomous AI copilot shamil hain.`,
        toolCalled: 'explain_crm_concept',
        badge: 'NexusCRM Features'
      };
    } else {
      response = {
        text: `NexusCRM provides centralized customer directory management (${totalCount} accounts), live KPI analytics (${activePct}% active, ${churnPct}% churn), an acquisition velocity chart, and an autonomous AI copilot.`,
        toolCalled: 'explain_crm_concept',
        badge: 'NexusCRM Features'
      };
    }
  }

  // =========================================================================
  // 9.4. ASKING FOR HELP / ASSISTANCE
  // =========================================================================
  const hasSpecificIntent =
    hasCountKeywords ||
    targetCustomer !== null ||
    matchedCompany !== null ||
    normalized.includes('churn') ||
    normalized.includes('retention') ||
    normalized.includes('today') ||
    normalized.includes('aaj') ||
    normalized.includes('oldest') ||
    normalized.includes('newest') ||
    normalized.includes('purana') ||
    normalized.includes('naya') ||
    normalized.includes('active') ||
    normalized.includes('inactive') ||
    normalized.includes('all customers') ||
    normalized.includes('list') ||
    normalized.includes('show') ||
    normalized.includes('pipeline') ||
    normalized.includes('ltv') ||
    normalized.includes('cac') ||
    normalized.includes('chart') ||
    normalized.includes('email');

  const isHelpRequest =
    !response &&
    !hasSpecificIntent &&
    (/\b(help|assist|assistance|favor|support)\b/i.test(normalized) ||
     normalized.includes('madad') ||
     normalized.includes('sahayata')) &&
    !normalized.includes('how to add') &&
    !normalized.includes('how to update') &&
    !normalized.includes('how to delete') &&
    !isDeleteAction &&
    !hasStatusChangeVerb;

  if (!response && isHelpRequest) {
    if (isHindi) {
      response = {
        text: "Main customer records dekhne, add/update/delete karne aur CRM metrics track karne me madad kar sakta hoon. Aapko kya chahiye?",
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Ready to Help'
      };
    } else {
      response = {
        text: "I can help you look up, add, update, or delete customers, and track CRM metrics. What do you need?",
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Ready to Help'
      };
    }
  }

  // =========================================================================
  // 9.5. HUMAN CONVERSATIONAL INTELLIGENCE (Conversational paragraphs!)
  // =========================================================================

  // A. GREETINGS & OPENERS (Pure greetings only - handled early, but fallback here if needed)
  const isGreeting =
    !response &&
    isPureGreeting;

  if (!response && isGreeting) {
    response = {
      text: isHindi
        ? "Namaste! Aap se connect karke bahut accha laga. Aapka din kaisa chal raha hai? Bataiye aaj CRM me main aapki kya madad karoon?"
        : "Hey there! It is wonderful to connect with you. How are you doing today? Let me know what you'd like to work on across your customer accounts, or if you just want to talk through ideas!",
      toolCalled: 'explain_crm_concept',
      badge: 'Nexus AI: Hello!'
    };
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
    response = {
      text: isHindi
        ? "Main badhiya hoon, shukriya! Main aapki kya madad karoon?"
        : "I'm doing well, thank you! How can I help you today?",
      toolCalled: 'explain_crm_concept',
      badge: 'Nexus AI: Doing Great!'
    };
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
    response = {
      text: isHindi
        ? "Main aapke customer records aur pipeline metrics manage karne ke liye ready hoon."
        : "I am ready to help you manage customer records and pipeline metrics.",
      toolCalled: 'explain_crm_concept',
      badge: 'Nexus AI: Active'
    };
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
    response = {
      text: isHindi ? "Aapka swagat hai!" : "You're welcome!",
      toolCalled: 'explain_crm_concept',
      badge: 'Nexus AI: You are welcome!'
    };
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
    response = {
      text: isHindi ? "Alvida! Aapka din shubh ho." : "Goodbye! Have a great day.",
      toolCalled: 'explain_crm_concept',
      badge: 'Nexus AI: Goodbye!'
    };
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
    response = {
      text: isHindi
        ? "Sales exec ne spreadsheet se poocha: 'Tum itni emotional kyu nahi hoti?' Spreadsheet: 'Mere paas sirf cells hain, dil nahi!'"
        : "Why did the CRM break up with the spreadsheet? Too many formula errors and zero commitment.",
      toolCalled: 'explain_crm_concept',
      badge: 'Nexus AI: Humor'
    };
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
    response = {
      text: isHindi
        ? "Thoda break lijiye. Agar kisi customer record ko update ya check karna ho to batayein."
        : "Take a quick break. Let me know if you need to look up or update any customer records.",
      toolCalled: 'explain_crm_concept',
      badge: 'Nexus AI: Support'
    };
  }

  // H. BUSINESS & CLIENT RELATIONSHIP ADVICE
  const isAdvice =
    !response &&
    !normalized.includes('close deal') &&
    !normalized.includes('close deals') &&
    !normalized.includes('objection') &&
    (normalized.includes('advice') ||
     normalized.includes('tips') ||
     normalized.includes('suggestion') ||
     normalized.includes('how to talk to') ||
     normalized.includes('angry customer') ||
     normalized.includes('difficult customer') ||
     normalized.includes('difficult client') ||
     normalized.includes('angry client') ||
     normalized.includes('sales tips') ||
     normalized.includes('salah') ||
     normalized.includes('kaise baat'));

  if (!response && isAdvice) {
    if (isHindi) {
      response = {
        text: "Clients handle karte waqt: unki baat dhyan se sunein, spasht timeline dein, aur issue solve hone ke baad proactive follow-up karein.",
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Advice'
      };
    } else {
      response = {
        text: "For difficult client conversations: listen actively without interrupting, commit to specific resolution timelines, and follow up proactively.",
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Advice'
      };
    }
  }

  // I. THOUGHTS ON AI, GEMINI & IDENTITY
  const isAboutAi =
    !response &&
    (normalized.includes('gemini') ||
     normalized.includes('agentic') ||
     normalized.includes('generative') ||
     normalized.includes('think about ai') ||
     normalized.includes('are you human') ||
     normalized.includes('are you real') ||
     normalized.includes('who made you') ||
     normalized.includes('who created you') ||
     normalized.includes('who are you') ||
     normalized.includes('what are you') ||
     normalized.includes('tum kaun ho') ||
     normalized.includes('tum insaan ho') ||
     normalized.includes('kisne banaya'));

  if (!response && isAboutAi) {
    response = {
      text: isHindi
        ? "Main NexusCRM ka AI Copilot hoon, jo customer records, pipeline aur metrics manage karne ke liye banaya gaya hai."
        : "I am the NexusCRM AI Copilot, designed to manage customer records, pipelines, and portfolio analytics.",
      toolCalled: 'explain_crm_concept',
      badge: 'Nexus AI: Copilot'
    };
  }

  // =========================================================================
  // 10. CHRONOLOGY: OLDEST & NEWEST CUSTOMERS (Must run before counts!)
  // =========================================================================
  const isAskingWhoOldest =
    !response &&
    (normalized.includes('oldest') ||
     normalized.includes('first customer') ||
     normalized.includes('earliest customer') ||
     normalized.includes('joined first') ||
     normalized.includes('sabse purana') ||
     normalized.includes('pehla customer') ||
     ((normalized.includes('who') || normalized.includes('kaun') || normalized.includes('konsa') || normalized.includes('which')) && (normalized.includes('old') || normalized.includes('purana') || normalized.includes('earliest') || normalized.includes('first'))));

  if (!response && isAskingWhoOldest) {
    const sortedAsc = [...customerPool].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const firstClient = sortedAsc[0];
    const firstDate = new Date(firstClient.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    response = {
      text: isHindi
        ? `NexusCRM me sabse pehle onboard hue customer ${firstClient.name} (${firstClient.company}) hain, jo ${firstDate} ko add hue the.`
        : `The earliest customer in NexusCRM is ${firstClient.name} from ${firstClient.company}, onboarded on ${firstDate}.`,
      toolCalled: 'fetch_customer_profile',
      badge: `Earliest: ${firstClient.name}`,
      data: firstClient
    };
  }

  const isAskingWhoNewest =
    !response &&
    (normalized.includes('newest') ||
     normalized.includes('latest customer') ||
     normalized.includes('joined last') ||
     normalized.includes('most recent customer') ||
     normalized.includes('sabse naya') ||
     normalized.includes('aakhiri customer') ||
     ((normalized.includes('who') || normalized.includes('kaun') || normalized.includes('konsa') || normalized.includes('which')) && (normalized.includes('new') || normalized.includes('latest') || normalized.includes('recent') || normalized.includes('naya'))));

  if (!response && isAskingWhoNewest) {
    const sortedDesc = [...customerPool].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const newestClient = sortedDesc[0];
    const newestDate = new Date(newestClient.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    response = {
      text: isHindi
        ? `NexusCRM me sabse naye customer ${newestClient.name} (${newestClient.company}) hain, jo ${newestDate} ko add hue the.`
        : `The most recently onboarded customer in NexusCRM is ${newestClient.name} from ${newestClient.company}, onboarded on ${newestDate}.`,
      toolCalled: 'fetch_customer_profile',
      badge: `Newest: ${newestClient.name}`,
      data: newestClient
    };
  }

  // =========================================================================
  // 11. COUNTS & REAL-TIME STATISTICAL INQUIRIES
  // =========================================================================
  const isCountQuery =
    !response &&
    !isAskingWhoNewest &&
    !isAskingWhoOldest &&
    !normalized.includes('churn') &&
    !normalized.includes('retention') &&
    (hasCountKeywords ||
     normalized.includes('active customers count') ||
     normalized.includes('inactive customers count') ||
     (normalized.includes('added') && (normalized.includes('today') || normalized.includes('aaj') || normalized.includes('new'))) ||
     (normalized.includes('new') && (normalized.includes('customer') || normalized.includes('client'))));

  if (!response && isCountQuery) {
    const isAskingAboutToday =
      normalized.includes('today') ||
      normalized.includes('aaj') ||
      normalized.includes('24 hour') ||
      normalized.includes('24 hours');

    const isAskingAboutNewOrAdded =
      normalized.includes('new') ||
      normalized.includes('naya') ||
      normalized.includes('nayi') ||
      normalized.includes('naye') ||
      normalized.includes('added') ||
      normalized.includes('add') ||
      normalized.includes('onboard') ||
      normalized.includes('jode') ||
      normalized.includes('joda');

    if (isAskingAboutToday && isAskingAboutNewOrAdded) {
      if (addedTodayCount > 0) {
        const names = addedTodayCustomers.map(c => `${c.name} (${c.company})`).join(', ');
        response = {
          text: isHindi
            ? `Aaj ${addedTodayCount} naye customer add hue hain: ${names}.`
            : `We have ${addedTodayCount} customer(s) added today: ${names}.`,
          toolCalled: 'get_portfolio_summary',
          badge: `Added Today: ${addedTodayCount}`
        };
      } else {
        response = {
          text: isHindi
            ? `Aaj abhi tak koi naya customer add nahi hua hai (count 0 hai). Is mahine ${safeStats.newThisMonth} accounts onboard hue hain.`
            : `No new customers have been added today (count is 0). ${safeStats.newThisMonth} new accounts were onboarded this month.`,
          toolCalled: 'get_portfolio_summary',
          badge: 'Added Today: 0'
        };
      }
    } else if (hasActiveCue) {
      response = {
        text: isHindi
          ? `Aapke paas ${activeCount} active customer accounts hain (${activePct}% of ${totalCount}).`
          : `You currently have ${activeCount} active customer accounts (${activePct}% of total ${totalCount}).`,
        toolCalled: 'get_portfolio_summary',
        badge: `Active: ${activeCount}`
      };
    } else if (hasInactiveCue) {
      response = {
        text: isHindi
          ? `Aapke paas ${inactiveCount} inactive accounts hain (${churnPct}% churn risk) kul ${totalCount} me se.`
          : `You currently have ${inactiveCount} inactive customer accounts (${churnPct}% churn risk) out of ${totalCount} total accounts.`,
        toolCalled: 'get_portfolio_summary',
        badge: `Inactive: ${inactiveCount}`
      };
    } else if (normalized.includes('new') || normalized.includes('naya') || normalized.includes('this month') || normalized.includes('is mahine')) {
      response = {
        text: isHindi
          ? `Is mahine ${safeStats.newThisMonth} naye enterprise clients onboard hue hain.`
          : `${safeStats.newThisMonth} new enterprise accounts were onboarded during the current monthly cycle.`,
        toolCalled: 'get_portfolio_summary',
        badge: `New: ${safeStats.newThisMonth}`
      };
    } else {
      response = {
        text: isHindi
          ? `NexusCRM me kul ${totalCount} accounts hain: ${activeCount} active (${activePct}%) aur ${inactiveCount} inactive (${churnPct}%).`
          : `NexusCRM is currently tracking ${totalCount} enterprise accounts: ${activeCount} active (${activePct}%) and ${inactiveCount} inactive (${churnPct}%).`,
        toolCalled: 'get_portfolio_summary',
        badge: `Total: ${totalCount}`
      };
    }
  }

  // =========================================================================
  // 12. CHURN & RETENTION RATES
  // =========================================================================
  const isChurnQuery =
    !response &&
    (normalized.includes('churn rate') ||
     normalized.includes('what is churn') ||
     normalized.includes('define churn') ||
     normalized.includes('customer churn') ||
     (normalized.includes('churn') && (normalized.includes('kya') || normalized.includes('kitna') || normalized.includes('rate'))));

  if (!response && isChurnQuery) {
    response = {
      text: isHindi
        ? `Live churn rate ${churnPct}% hai (${inactiveCount}/${totalCount} accounts inactive hain).`
        : `The churn rate is ${churnPct}% (${inactiveCount} inactive accounts out of ${totalCount}).`,
      toolCalled: 'explain_crm_concept',
      badge: `Churn Rate: ${churnPct}%`
    };
  }

  const isRetentionQuery =
    !response &&
    (normalized.includes('retention rate') ||
     normalized.includes('what is retention') ||
     normalized.includes('define retention') ||
     (normalized.includes('retention') && (normalized.includes('kya') || normalized.includes('kitna') || normalized.includes('rate'))));

  if (!response && isRetentionQuery) {
    response = {
      text: isHindi
        ? `Live retention rate ${activePct}% hai (${activeCount}/${totalCount} accounts active hain).`
        : `The retention rate is ${activePct}% (${activeCount} active accounts out of ${totalCount}).`,
      toolCalled: 'explain_crm_concept',
      badge: `Retention: ${activePct}%`
    };
  }

  // =========================================================================
  // 13. PORTFOLIO BREAKDOWN & LIST COHORTS
  // =========================================================================

  // List Active Customers Cohort
  const isAskingActiveCohort =
    !response &&
    !hasCountKeywords &&
    !targetCustomer &&
    !/\binactive\b/i.test(normalized) &&
    (normalized.includes('list active') ||
     normalized.includes('show active') ||
     normalized.includes('active list') ||
     normalized.includes('active customers ki list') ||
     normalized.includes('active walo ki list') ||
     (/\bactive\b/i.test(normalized) && (normalized.includes('show') || normalized.includes('list') || normalized.includes('dikhao') || normalized.includes('who are') || normalized.includes('which') || normalized.includes('kaun'))));

  if (!response && isAskingActiveCohort) {
    const activeList = customerPool.filter(c => c.status === 'Active');
    const displayList = activeList.slice(0, 5);

    if (isHindi) {
      response = {
        text: `Active accounts (${activeList.length} total, ${activePct}%): ${displayList.map(c => `${c.name} (${c.company})`).join(', ')}.`,
        toolCalled: 'list_customers_by_status',
        badge: `Active (${activeList.length})`
      };
    } else {
      response = {
        text: `Active accounts (${activeList.length} total, ${activePct}%): ${displayList.map(c => `${c.name} (${c.company})`).join(', ')}.`,
        toolCalled: 'list_customers_by_status',
        badge: `Active (${activeList.length})`
      };
    }
  }

  // List Inactive Customers Cohort
  const isAskingInactiveCohort =
    !response &&
    !hasCountKeywords &&
    !targetCustomer &&
    (normalized.includes('list inactive') ||
     normalized.includes('show inactive') ||
     normalized.includes('inactive list') ||
     normalized.includes('inactive customers ki list') ||
     normalized.includes('inactive walo ki list') ||
     (normalized.includes('inactive') && (normalized.includes('show') || normalized.includes('list') || normalized.includes('dikhao') || normalized.includes('who are') || normalized.includes('which') || normalized.includes('kaun'))));

  if (!response && isAskingInactiveCohort) {
    const inactiveList = customerPool.filter(c => c.status === 'Inactive');
    const displayList = inactiveList.slice(0, 5);

    if (isHindi) {
      response = {
        text: `Inactive accounts (${inactiveList.length} total, ${churnPct}% churn): ${displayList.map(c => `${c.name} (${c.company})`).join(', ')}.`,
        toolCalled: 'list_customers_by_status',
        badge: `Inactive (${inactiveList.length})`
      };
    } else {
      response = {
        text: `Inactive accounts (${inactiveList.length} total, ${churnPct}% churn): ${displayList.map(c => `${c.name} (${c.company})`).join(', ')}.`,
        toolCalled: 'list_customers_by_status',
        badge: `Inactive (${inactiveList.length})`
      };
    }
  }

  const isAllOfThemQuery =
    !response &&
    !normalized.includes('active') &&
    !normalized.includes('inactive') &&
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
     normalized.includes('show all') ||
     normalized.includes('show me all') ||
     normalized.includes('sabke baare me') ||
     normalized.includes('sabhi customers') ||
     normalized.includes('saare customers') ||
     normalized.includes('sab customer') ||
     normalized === 'all' ||
     normalized === 'both' ||
     normalized === 'sab');

  if (!response && isAllOfThemQuery) {
    if (isHindi) {
      response = {
        text: `Kul ${totalCount} accounts: ${activeCount} active (${activePct}%), ${inactiveCount} inactive (${churnPct}%), aur is mahine ${safeStats.newThisMonth} naye accounts.`,
        toolCalled: 'get_portfolio_summary',
        badge: `Portfolio: All ${totalCount} Accounts`
      };
    } else {
      response = {
        text: `Total ${totalCount} accounts: ${activeCount} active (${activePct}%), ${inactiveCount} inactive (${churnPct}%), and ${safeStats.newThisMonth} new accounts this month.`,
        toolCalled: 'get_portfolio_summary',
        badge: `Portfolio: All ${totalCount} Accounts`
      };
    }
  }

  // =========================================================================
  // 14. CORE CRM CONCEPTS & STRATEGY (Multi-point framework)
  // =========================================================================

  // A. WHAT IS CRM / DEFINITION / PURPOSE
  if (!response && (normalized.includes('what is crm') || normalized.includes('define crm') || normalized.includes('meaning of crm') || normalized.includes('explain crm') || normalized.includes('customer relationship management') || (normalized.includes('crm') && (normalized.includes('kya hota hai') || normalized.includes('kya hai') || normalized.includes('matlab kya'))))) {
    response = {
      text: isHindi
        ? "CRM (Customer Relationship Management) ek software platform hai jisse customer data, sales pipelines aur client retention ko manage kiya jata hai."
        : "CRM (Customer Relationship Management) is software used to manage customer data, track sales pipelines, and prevent customer churn.",
      toolCalled: 'explain_crm_concept',
      badge: 'Concept: CRM Overview'
    };
  }

  // B. WHY DO WE USE CRM / BENEFITS OF CRM
  if (!response && (normalized.includes('why do we use crm') || normalized.includes('benefit of crm') || normalized.includes('benefits of crm') || normalized.includes('importance of crm') || normalized.includes('why crm') || (normalized.includes('crm') && (normalized.includes('fayde') || normalized.includes('kyu use') || normalized.includes('kyu zaroori') || normalized.includes('fayda'))))) {
    response = {
      text: isHindi
        ? "CRM client data ko ek jagah centralize karta hai, sales interactions track karta hai aur customer churn kam karta hai."
        : "CRM centralizes client contact data, tracks sales interactions, and prevents customer churn.",
      toolCalled: 'explain_crm_concept',
      badge: 'Concept: CRM Benefits'
    };
  }

  // C. DIFFERENCE BETWEEN ACTIVE AND INACTIVE
  const isDiffActiveInactive =
    !response &&
    (normalized.includes('difference between active and inactive') ||
     (/\bactive\b/i.test(normalized) && /\binactive\b/i.test(normalized) && (normalized.includes('diff') || normalized.includes('difference') || normalized.includes('antar') || normalized.includes('fark') || normalized.includes('vs') || normalized.includes('versus') || normalized.includes('meaning'))));

  if (!response && isDiffActiveInactive) {
    response = {
      text: isHindi
        ? `Active customers engaged paying clients hain (${activeCount} accounts), jabki Inactive customers paused ya churned accounts hain (${inactiveCount} accounts).`
        : `Active customers are currently engaged clients (${activeCount} accounts, ${activePct}%), while Inactive customers have paused or cancelled contracts (${inactiveCount} accounts, ${churnPct}%).`,
      toolCalled: 'explain_crm_concept',
      badge: 'Concept: Status Tiers'
    };
  }

  // D. LTV (CUSTOMER LIFETIME VALUE)
  if (!response && (normalized.includes('what is ltv') || normalized.includes('customer lifetime value') || normalized.includes('lifetime value') || (normalized.includes('ltv') && (normalized.includes('kya') || normalized.includes('define'))))) {
    response = {
      text: isHindi
        ? "LTV (Customer Lifetime Value) ek customer se unke poore relationship ke dauraan milne wala kul anumanit revenue hota hai."
        : "LTV (Customer Lifetime Value) is the total projected revenue a business expects to earn from a customer over their relationship.",
      toolCalled: 'explain_crm_concept',
      badge: 'Concept: Lifetime Value (LTV)'
    };
  }

  // E. CAC (CUSTOMER ACQUISITION COST)
  if (!response && (normalized.includes('what is cac') || normalized.includes('acquisition cost') || (normalized.includes('cac') && (normalized.includes('kya') || normalized.includes('define'))))) {
    response = {
      text: isHindi
        ? "CAC (Customer Acquisition Cost) ek naya paying customer acquire karne me lagne wala kul marketing aur sales kharcha hota hai."
        : "CAC (Customer Acquisition Cost) is the total marketing and sales cost required to acquire one new customer.",
      toolCalled: 'explain_crm_concept',
      badge: 'Concept: Acquisition Cost (CAC)'
    };
  }

  // F. SALES PIPELINE
  if (!response && !normalized.includes('velocity') && (normalized.includes('pipeline') || normalized.includes('sales funnel') || (normalized.includes('sales') && (normalized.includes('process') || normalized.includes('stages'))))) {
    response = {
      text: isHindi
        ? "Sales pipeline prospective deals ko initial lead qualification se contract close hone tak sequential stages me track karta hai."
        : "A sales pipeline tracks prospective customer deals across sequential stages from qualification to closing.",
      toolCalled: 'explain_crm_concept',
      badge: 'Concept: Sales Pipeline'
    };
  }

  // G. ACQUISITION VELOCITY CHART
  if (!response && (normalized.includes('chart') || normalized.includes('graph') || normalized.includes('acquisition chart') || (normalized.includes('velocity') && !normalized.includes('pipeline') && !normalized.includes('sales')))) {
    if (isHindi) {
      response = {
        text: `Customer Acquisition Velocity Chart pichhle 6 mahino (May se October 2026) ka live onboarding trend dikhata hai. Is mahine ${safeStats.newThisMonth} naye enterprise accounts add hue hain, aur kisi bhi point par hover karke aap us mahine ke precise numbers dekh sakte hain.`,
        toolCalled: 'explain_crm_concept',
        badge: 'Analytics: Acquisition Chart'
      };
    } else {
      response = {
        text: `The Customer Acquisition Velocity Chart displays onboarding momentum over the last 6 months (May through October 2026). It tracks ${safeStats.newThisMonth} new client organizations added this cycle, with hover tooltips providing exact monthly counts.`,
        toolCalled: 'explain_crm_concept',
        badge: 'Analytics: Acquisition Chart'
      };
    }
  }

  // H. BANT LEAD QUALIFICATION FRAMEWORK
  const isBantQuery =
    !response &&
    (/\bbant\b/i.test(normalized) ||
     normalized.includes('lead qualification') ||
     normalized.includes('qualify leads') ||
     normalized.includes('qualification framework') ||
     normalized.includes('lead qualify'));

  if (!response && isBantQuery) {
    if (isHindi) {
      response = {
        text: "BANT framework leads ko char cheezon par qualify karta hai: Budget, Authority, Need aur Timeline.",
        toolCalled: 'explain_crm_concept',
        badge: 'Framework: BANT'
      };
    } else {
      response = {
        text: "BANT qualifies sales leads across four criteria: Budget, Authority, Need, and Timeline.",
        toolCalled: 'explain_crm_concept',
        badge: 'Framework: BANT'
      };
    }
  }

  // I. MEDDIC QUALIFICATION METHODOLOGY
  const isMeddicQuery =
    !response &&
    /\bmedd?ic[cp]?\b/i.test(normalized);

  if (!response && isMeddicQuery) {
    if (isHindi) {
      response = {
        text: "MEDDIC enterprise deals ko Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain aur Champion ke zariye qualify karta hai.",
        toolCalled: 'explain_crm_concept',
        badge: 'Framework: MEDDIC'
      };
    } else {
      response = {
        text: "MEDDIC qualifies enterprise deals via Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, and Champion.",
        toolCalled: 'explain_crm_concept',
        badge: 'Framework: MEDDIC'
      };
    }
  }

  // J. NET REVENUE RETENTION (NRR) & EXPANSION
  const isNrrQuery =
    !response &&
    (/\bnrr\b/i.test(normalized) ||
     normalized.includes('net revenue retention') ||
     /\bgrr\b/i.test(normalized) ||
     normalized.includes('gross revenue retention') ||
     normalized.includes('expansion revenue'));

  if (!response && isNrrQuery) {
    if (isHindi) {
      response = {
        text: "NRR (Net Revenue Retention) existing clients se retain aur expand hue recurring revenue ko measure karta hai.",
        toolCalled: 'explain_crm_concept',
        badge: 'Metrics: NRR'
      };
    } else {
      response = {
        text: "NRR (Net Revenue Retention) measures the percentage of recurring revenue retained and expanded from existing clients over time.",
        toolCalled: 'explain_crm_concept',
        badge: 'Metrics: NRR'
      };
    }
  }

  // K. CHURN PREVENTION PLAYBOOK & AT-RISK ACCOUNTS
  const isChurnPreventionQuery =
    !response &&
    (normalized.includes('prevent churn') ||
     normalized.includes('reduce churn') ||
     normalized.includes('stop churn') ||
     normalized.includes('churn playbook') ||
     normalized.includes('churn kaise rokein') ||
     normalized.includes('churn kaise kam') ||
     normalized.includes('at-risk') ||
     normalized.includes('at risk account') ||
     normalized.includes('save customer'));

  if (!response && isChurnPreventionQuery) {
    if (isHindi) {
      response = {
        text: "Churn kam karne ke liye: usage drop track karein, renewal se 90 din pehle review karein, aur at-risk accounts se connect karein.",
        toolCalled: 'explain_crm_concept',
        badge: 'Playbook: Churn Prevention'
      };
    } else {
      response = {
        text: "To reduce churn: monitor product usage drops, conduct 90-day pre-renewal reviews, and quickly engage at-risk accounts.",
        toolCalled: 'explain_crm_concept',
        badge: 'Playbook: Churn Prevention'
      };
    }
  }

  // L. QUARTERLY BUSINESS REVIEWS (QBR)
  const isQbrQuery =
    !response &&
    (/\bqbr\b/i.test(normalized) ||
     normalized.includes('quarterly business review') ||
     normalized.includes('executive business review') ||
     normalized.includes('qbr kaise'));

  if (!response && isQbrQuery) {
    if (isHindi) {
      response = {
        text: "QBR (Quarterly Business Review) client ke sath deliver kiye gaye ROI aur agle quarter ke goals ko align karta hai.",
        toolCalled: 'explain_crm_concept',
        badge: 'Framework: QBR'
      };
    } else {
      response = {
        text: "A QBR (Quarterly Business Review) reviews past value delivered, aligns on upcoming goals, and previews roadmap features with key clients.",
        toolCalled: 'explain_crm_concept',
        badge: 'Framework: QBR'
      };
    }
  }

  // M. CUSTOMER SATISFACTION METRICS (NPS, CSAT, CES)
  const isNpsCsatQuery =
    !response &&
    (/\bnps\b/i.test(normalized) ||
     normalized.includes('net promoter score') ||
     /\bcsat\b/i.test(normalized) ||
     normalized.includes('customer satisfaction') ||
     /\bces\b/i.test(normalized) ||
     normalized.includes('customer effort'));

  if (!response && isNpsCsatQuery) {
    if (isHindi) {
      response = {
        text: "NPS brand loyalty measure karta hai, CSAT immediate support satisfaction, aur CES service ka aasan hona measure karta hai.",
        toolCalled: 'explain_crm_concept',
        badge: 'Metrics: NPS & CSAT'
      };
    } else {
      response = {
        text: "NPS measures long-term loyalty, CSAT measures immediate satisfaction, and CES measures ease of problem resolution.",
        toolCalled: 'explain_crm_concept',
        badge: 'Metrics: NPS & CSAT'
      };
    }
  }

  // N. CUSTOMER ONBOARDING & TIME-TO-VALUE (TTV)
  const isOnboardingQuery =
    !response &&
    (normalized.includes('customer onboarding') ||
     normalized.includes('client onboarding') ||
     normalized.includes('onboarding process') ||
     normalized.includes('onboarding kaise') ||
     normalized.includes('time to value') ||
     normalized.includes('ttv'));

  if (!response && isOnboardingQuery) {
    if (isHindi) {
      response = {
        text: "Customer onboarding ka mukhya focus naye clients ko pehle 14 dino me unka pehla core outcome deliver karne par hota hai.",
        toolCalled: 'explain_crm_concept',
        badge: 'Strategy: Onboarding'
      };
    } else {
      response = {
        text: "Customer onboarding focuses on rapid time-to-value by guiding new clients to their first core milestone within 14 days.",
        toolCalled: 'explain_crm_concept',
        badge: 'Strategy: Onboarding'
      };
    }
  }

  // O. UPSELLING & CROSS-SELLING IN CRM
  const isUpsellingQuery =
    !response &&
    (normalized.includes('upsell') ||
     normalized.includes('upselling') ||
     normalized.includes('cross sell') ||
     normalized.includes('cross-sell') ||
     normalized.includes('cross selling') ||
     normalized.includes('expansion strategy'));

  if (!response && isUpsellingQuery) {
    if (isHindi) {
      response = {
        text: "Upselling maujooda client ko higher tier me upgrade karta hai, jabki cross-selling complementary modules add karta hai.",
        toolCalled: 'explain_crm_concept',
        badge: 'Strategy: Upsell'
      };
    } else {
      response = {
        text: "Upselling upgrades an existing account to a higher tier or more seats, while cross-selling introduces complementary modules.",
        toolCalled: 'explain_crm_concept',
        badge: 'Strategy: Upsell'
      };
    }
  }

  // P. PIPELINE VELOCITY & SALES VELOCITY
  const isPipelineVelocityQuery =
    !response &&
    (normalized.includes('pipeline velocity') ||
     normalized.includes('sales velocity') ||
     (normalized.includes('velocity') && normalized.includes('sales')) ||
     normalized.includes('win rate') ||
     normalized.includes('conversion rate'));

  if (!response && isPipelineVelocityQuery) {
    if (isHindi) {
      response = {
        text: "Pipeline velocity revenue ki raftaar measure karta hai: (Opportunities * Win Rate * Deal Size) / Sales Cycle Samay.",
        toolCalled: 'explain_crm_concept',
        badge: 'Strategy: Pipeline Velocity'
      };
    } else {
      response = {
        text: "Pipeline velocity measures revenue speed: (Qualified Opportunities * Win Rate * Average Deal Size) / Sales Cycle Length.",
        toolCalled: 'explain_crm_concept',
        badge: 'Strategy: Pipeline Velocity'
      };
    }
  }

  // Q. SUPPORT SLAS & ESCALATIONS
  const isSlaQuery =
    !response &&
    (/\bslas?\b/i.test(normalized) ||
     normalized.includes('service level agreement') ||
     normalized.includes('escalation') ||
     normalized.includes('support ticket'));

  if (!response && isSlaQuery) {
    if (isHindi) {
      response = {
        text: "Support SLAs severity tiers (P1 critical se P4 routine) ke aadhar par guaranteed response aur resolution time tay karte hain.",
        toolCalled: 'explain_crm_concept',
        badge: 'Operations: Support SLAs'
      };
    } else {
      response = {
        text: "Support SLAs define guaranteed response and resolution times across severity tiers (P1 critical through P4 routine).",
        toolCalled: 'explain_crm_concept',
        badge: 'Operations: Support SLAs'
      };
    }
  }

  // R. WIN-BACK STRATEGY FOR INACTIVE CLIENTS
  const isWinBackQuery =
    !response &&
    (normalized.includes('win back') ||
     normalized.includes('win-back') ||
     (normalized.includes('wapas') && normalized.includes('customer')) ||
     normalized.includes('re-engage inactive') ||
     normalized.includes('reactivate customer'));

  if (!response && isWinBackQuery) {
    if (isHindi) {
      response = {
        text: "Win-back strategy churn ke purane kaaran ko solve karke aur naye improvements dikhakar inactive clients ko wapas lati hai.",
        toolCalled: 'explain_crm_concept',
        badge: 'Strategy: Win-Back'
      };
    } else {
      response = {
        text: "Win-back strategy re-engages inactive clients by addressing historical churn causes, showcasing new improvements, and offering low-risk reactivation.",
        toolCalled: 'explain_crm_concept',
        badge: 'Strategy: Win-Back'
      };
    }
  }

  // S. SALES CLOSING & OBJECTION HANDLING
  const isClosingOrObjections =
    !response &&
    (normalized.includes('objection handling') ||
     normalized.includes('pricing objection') ||
     normalized.includes('budget objection') ||
     normalized.includes('closing techniques') ||
     (normalized.includes('close') && (normalized.includes('deal') || normalized.includes('deals'))));

  if (!response && isClosingOrObjections) {
    if (isHindi) {
      response = {
        text: "Deals close karne ke liye: discount dene ke bajaye ROI par focus karein aur client ke internal timeline ke sath mutual plan banayein.",
        toolCalled: 'explain_crm_concept',
        badge: 'Strategy: Deal Closing'
      };
    } else {
      response = {
        text: "Close deals by focusing on ROI rather than discounting, establishing mutual action plans, and directly addressing remaining obstacles.",
        toolCalled: 'explain_crm_concept',
        badge: 'Strategy: Deal Closing'
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
      ? `Update for ${target.company}`
      : `Welcome to NexusCRM, ${target.name}`;

    if (isHindi) {
      response = {
        text: `Email draft taiyar hai:\nSubject: ${subject}\nHi ${target.name}, hum ${target.company} ke customer account ke sambandh me sampark kar rahe hain. Hum ek brief catch-up schedule karna chahte hain.\nBest regards, Operations Team`,
        toolCalled: 'draft_email',
        badge: `Drafted Email for ${target.name}`
      };
    } else {
      response = {
        text: `Drafted email for ${target.name} (${target.company}):\nSubject: ${subject}\nHi ${target.name}, we are checking in regarding ${target.company}'s customer account. We would love to schedule a brief touchpoint to discuss your operational goals.\nBest regards, Operations Team`,
        toolCalled: 'draft_email',
        badge: `Drafted Email for ${target.name}`
      };
    }
  }

  // =========================================================================
  // 16. PRACTICAL BUSINESS PERSPECTIVE & OUT-OF-DOMAIN GUARDRAIL
  // =========================================================================
  if (!response) {
    const isMeaningOfSuccess =
      normalized.includes('meaning of success') ||
      normalized.includes('success kya hai') ||
      normalized.includes('definition of success') ||
      normalized.includes('what is success');

    const isOutOfDomain =
      /\b(weather|mausam|barish|recipe|cook|cooking|khana|cake|biryani|chai|coffee|cricket|football|ipl|movie|film|cinema|actor|politics|election|minister|president|song|gaana|dinosaur|planet|mars)\b/i.test(normalized);

    if (isMeaningOfSuccess) {
      if (isHindi) {
        response = {
          text: `CRM me success ka matlab hai high customer retention (${activePct}%), kam churn (${churnPct}%), aur lagatar client satisfaction.`,
          toolCalled: 'explain_crm_concept',
          badge: 'Concept: Success'
        };
      } else {
        response = {
          text: `In CRM, business success means maintaining high customer retention (${activePct}%), minimizing churn (${churnPct}%), and delivering steady client value.`,
          toolCalled: 'explain_crm_concept',
          badge: 'Concept: Success'
        };
      }
    } else if (isOutOfDomain) {
      response = {
        text: isHindi
          ? "Main strictly CRM operations, customer records aur metrics par focus karta hoon."
          : "I focus strictly on CRM operations, customer records, and portfolio metrics.",
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: CRM Focus'
      };
    } else {
      response = {
        text: isHindi
          ? "Main aapka NexusCRM Copilot hoon. Customer records dekhne, update karne ya metrics check karne ke liye bolein."
          : "I am your NexusCRM Copilot. Ask me to look up, update, add, or delete customers, or check pipeline metrics.",
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: CRM Focus'
      };
    }
  }

  // Mandatory Post-Processing:
  // 1. Reciprocate user greeting if user greeted while asking a question
  // 2. Strip every single asterisk (*)
  // 3. Strip any accidental mention of "friend" / "dost"
  // 4. Strip conversational trailing prompts/offers
  let cleanText = response.text.replace(/\*/g, '').trim();

  if (userSaidGreeting && !isPureGreeting && cleanText) {
    const startsWithOpener = /^(?:hi|hello|hey|namaste|good\s+morning|good\s+afternoon|good\s+evening|arre\s+bilkul|bilkul|all\s+done|awesome|zabardast)\b/i.test(cleanText);
    if (!startsWithOpener) {
      const greetingPrefix = isHindi ? "Namaste! " : "Hello! ";
      cleanText = greetingPrefix + cleanText;
    }
  }

  cleanText = stripFriendReferences(cleanText);

  // Strip conversational trailing question prompts and offers
  cleanText = cleanText.replace(/\s*(?:Need me to|Want me to|Let me know if|What's our next move\??|Anything else we should tackle\??|Anything else\??|What should we tackle next\??|How can I assist with your customer records[^.?!]*|Kuch aur karna ho to batayein|Kuch aur change karna ho to batayein|Aur bataiye, kya madad karoon\??|Kya unke liye koi message draft karna hai\??|Kya unka full profile dekhna hai\??|Kya unhe wapas Active banana hai\??|Kya unhe Active banana hai\??|Aapka din kaisa chal raha hai\??|Aapka din kaisa guzar raha hai\??|Let me know what you'd like to work on[^.?!]*|Let me know whenever anything else comes up[^.?!]*|Jab bhi koi agla kaam ho[^.?!]*)[^.?!]*[.?!]?$/gi, '').trim();

  const cleanBadge = response.badge
    ? response.badge.replace(/\b(friend|dost)\b:?\s*/gi, '').trim()
    : response.badge;

  return {
    ...response,
    badge: cleanBadge,
    text: cleanText
  };
}
