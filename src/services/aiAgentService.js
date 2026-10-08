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
        ? "Namaste! Aap se baat karke bahut accha laga. Aapka din kaisa chal raha hai? Bataiye aaj CRM me main aapki kya madad karoon?"
        : "Hey there! It is wonderful to connect with you. How are you doing today? Let me know what you'd like to work on across your customer accounts, or if you just want to talk through ideas!",
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
        ? "Arre haan bilkul! Main Hindi aur English dono bhashayein bahut acche se samajhta hoon. Kisi bhi customer ke baare me poochna ho, status badalwana ho, records delete karwana ho, ya CRM me koi bhi help chahiye ho, bas bejhijhak bataiye. Main hamesha aapki madad ke liye tayyar hoon!"
        : "Of course! You and I can chat in both Hindi and English anytime. You can ask me anything about our customers, have me update statuses, delete accounts, or just explain how things work in the CRM. How can I help you today?",
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
        text: `Arre bilkul, ho gaya! Maine ${targetCustomer.name} (${targetCustomer.company}) ko directory se hata diya hai aur saare dashboard numbers update ho gaye hain. Kuch aur karna ho to bataiye!`,
        toolCalled: 'delete_customer',
        badge: `Deleted ${targetCustomer.name}`
      };
    } else {
      response = {
        text: `All done! I just removed ${targetCustomer.name} (${targetCustomer.company}, ID ${targetCustomer.id}) from the customer directory for you, and all your dashboard metrics are refreshed. Anything else we should tackle?`,
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
        text: `Bilkul, ho gaya! Maine ${targetCustomer.name} (${targetCustomer.company}) ka status badal kar ${targetStatus} kar diya hai. Yeh turant browser storage me save ho gaya hai. Aur bataiye, kya madad karoon?`,
        toolCalled: 'update_customer',
        badge: `Updated ${updated.name}`,
        data: updated
      };
    } else {
      response = {
        text: `You got it! I just updated ${targetCustomer.name}'s status to ${targetStatus} for you. The change is saved to your browser storage and updated everywhere. What's our next move?`,
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
          text: `Maine update kar diya! ${targetCustomer.name} (${targetCustomer.company}) ke details badal gaye hain (${detailPointsHindi.join(', ')}) aur browser storage me save ho gaye hain. Kuch aur change karna ho to bataiye!`,
          toolCalled: 'update_customer',
          badge: `Updated ${updated.name}`,
          data: updated
        };
      } else {
        response = {
          text: `Got you covered! I've updated ${targetCustomer.name}'s contact details (${detailPoints.join(', ')}). It's saved directly to your browser storage now. Let me know if you want to tweak anything else!`,
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
        text: isHindi
          ? "Arre bilkul! Maine Dark Mode on kar diya hai. Aankhon ke liye kaafi aaramdaayak hai na?"
          : "You got it! Switched us over to Dark Mode. Much easier on the eyes, right?",
        toolCalled: 'toggle_theme',
        badge: 'Theme: Dark'
      };
    } else if (wantsLight) {
      if (theme !== 'light') {
        if (typeof setTheme === 'function') setTheme('light');
        else if (typeof toggleTheme === 'function') toggleTheme();
      }
      response = {
        text: isHindi
          ? "Bilkul! Workspace Light Mode par switch kar diya hai, ekdum saaf aur fresh!"
          : "Bright and fresh! Switched us over to Light Mode for a clean daylight look.",
        toolCalled: 'toggle_theme',
        badge: 'Theme: Light'
      };
    } else {
      if (typeof toggleTheme === 'function') toggleTheme();
      const nextTheme = theme === 'dark' ? 'Light' : 'Dark';
      response = {
        text: isHindi
          ? `Arre bilkul! Workspace theme badal kar ${nextTheme} Mode kar diya gaya hai.`
          : `You got it! Switched workspace appearance to ${nextTheme} Mode, and updated your preferences in browser storage.`,
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
        text: `Zabardast! Maine ${name} (${company}) ko directory me add kar diya hai aur status Active kar diya hai (Email: ${emailGenerated}, Phone: ${newCust.phone}). Live dashboard me bhi numbers sync ho gaye hain!`,
        toolCalled: 'add_customer',
        badge: `Added ${name} (${company})`,
        data: newCust
      };
    } else {
      response = {
        text: `Awesome! I just added ${name} (${company}) to your directory with email ${emailGenerated} and phone ${newCust.phone}. The account is now Active and synced across all your metrics. Want me to pull up their card?`,
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
          ? `Yeh lijiye, ${targetCustomer.name} ka direct phone number ${targetCustomer.phone} hai. Wo ${targetCustomer.company} me hain (${targetCustomer.email}). Kya unke liye koi message draft karna hai?`
          : `Here is ${targetCustomer.name}'s direct phone number: ${targetCustomer.phone}. They're with ${targetCustomer.company} (${targetCustomer.email}). Need me to help you call or draft a message for them?`,
        toolCalled: 'fetch_customer_profile',
        badge: `Phone: ${targetCustomer.name}`,
        data: targetCustomer
      };
    } else if (isAskingEmail) {
      response = {
        text: isHindi
          ? `Yeh lijiye, ${targetCustomer.name} ka email address ${targetCustomer.email} hai, aur direct phone ${targetCustomer.phone} hai. Kya unhe koi email bhejna hai?`
          : `Here you go! ${targetCustomer.name}'s email address is ${targetCustomer.email}, and their direct phone is ${targetCustomer.phone}. Need me to draft an email for them?`,
        toolCalled: 'fetch_customer_profile',
        badge: `Email: ${targetCustomer.name}`,
        data: targetCustomer
      };
    } else if (isAskingCompany) {
      response = {
        text: isHindi
          ? `${targetCustomer.name} ${targetCustomer.company} ke sath hain, aur unka account is waqt ${targetCustomer.status} hai. Unke baare me kuch aur jaan-na ho to bataiye!`
          : `${targetCustomer.name} is with ${targetCustomer.company}, and their account is currently ${targetCustomer.status}. Let me know if you need any other details on them!`,
        toolCalled: 'fetch_customer_profile',
        badge: `Company: ${targetCustomer.name}`,
        data: targetCustomer
      };
    } else if (isAskingStatus) {
      const isCurrentlyActive = targetCustomer.status === 'Active';
      const askingIfActive = /\bactive\b/i.test(normalized) && !/\binactive\b/i.test(normalized);
      const askingIfInactive = /\binactive\b/i.test(normalized);

      let answerTextEn = `I checked for you—${targetCustomer.name} is currently ${targetCustomer.status} with ${targetCustomer.company}. Let me know if you want me to change their status or check their contact info!`;
      let answerTextHi = `Maine check kiya—${targetCustomer.name} is waqt ${targetCustomer.company} ke sath ${targetCustomer.status} hain. Agar status badalna ho ya contact details chahiye ho, to bas bataiye.`;

      if (askingIfActive) {
        answerTextEn = isCurrentlyActive
          ? `Yes! ${targetCustomer.name} is currently an Active customer with ${targetCustomer.company}. Want me to pull up their full card?`
          : `No, ${targetCustomer.name} is currently Inactive with ${targetCustomer.company}. Want me to switch them back to Active for you?`;
        answerTextHi = isCurrentlyActive
          ? `Haan ji, ${targetCustomer.name} is waqt ${targetCustomer.company} ke sath ek Active customer hain! Kya unka full profile dekhna hai?`
          : `Nahi, ${targetCustomer.name} is waqt ${targetCustomer.company} ke sath Inactive hain. Kya unhe wapas Active banana hai?`;
      } else if (askingIfInactive) {
        answerTextEn = !isCurrentlyActive
          ? `Yes, ${targetCustomer.name} is currently Inactive with ${targetCustomer.company}. Want me to switch them to Active?`
          : `No, ${targetCustomer.name} is currently Active with ${targetCustomer.company}!`;
        answerTextHi = !isCurrentlyActive
          ? `Haan ji, ${targetCustomer.name} is waqt ${targetCustomer.company} ke sath Inactive hain. Kya unhe Active banana hai?`
          : `Nahi, ${targetCustomer.name} is waqt ${targetCustomer.company} ke sath Active hain!`;
      }

      response = {
        text: isHindi ? answerTextHi : answerTextEn,
        toolCalled: 'fetch_customer_profile',
        badge: `${targetCustomer.name}: ${targetCustomer.status}`,
        data: targetCustomer
      };
    } else {
      // General full customer profile dossier (Huge data: keep points!)
      if (isHindi) {
        response = {
          text: [
            `Yeh lijiye, ${targetCustomer.name} ki poori profile jankari:`,
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
            `Here is everything you need on ${targetCustomer.name} from our records:`,
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
            text: `${matchedCompany} ke sath hamare ${compCustomers.length} customer account(s) registered hain: ${compCustomers.map(c => `${c.name} (${c.status}, Email: ${c.email}, Phone: ${c.phone})`).join(', ')}. Inme se kisi ki details inspect ya update karni ho to bataiye!`,
            toolCalled: 'fetch_customer_profile',
            badge: `Company: ${matchedCompany}`
          };
        } else {
          response = {
            text: `We currently have ${compCustomers.length} customer account(s) at ${matchedCompany}: ${compCustomers.map(c => `${c.name} (${c.status}, Email: ${c.email}, Phone: ${c.phone})`).join(', ')}. Let me know if you would like me to draft an email or update any records for them!`,
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
        text: `Arre yeh to aap khud hain! Aap ${directorName} (${directorRole}) hain ${directorCompany} me. Aapka email ${directorEmail} aur direct phone ${directorPhone} hai. Screen ke top bar me apne avatar badge par click karke apni credentials inspect ya Settings me edit kar sakte hain.`,
        toolCalled: 'explain_crm_concept',
        badge: `Director: ${directorName}`
      };
    } else {
      response = {
        text: `That's you! You're logged in as ${directorName} (${directorRole}) at ${directorCompany}. You can reach them at ${directorEmail} or ${directorPhone}, or click the Director avatar badge in the top navigation bar to open your credentials modal.`,
        toolCalled: 'explain_crm_concept',
        badge: `Director: ${directorName}`
      };
    }
  }

  // =========================================================================
  // 8. HOW-TO WORKFLOW GUIDES (Huge sequential data: points used!)
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
        text: [
          "Naya customer add karne ke steps yeh rahe:",
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
          "Here is the easiest way we can add a new customer together:",
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
        text: [
          "Customer update karne ke aasan tareeqe yeh rahe:",
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
          "Here are the ways you and I can update customer records:",
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
        text: [
          "Customer delete karne ke tareeqe yeh rahe:",
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
          "Here is how we can remove a customer record whenever you need:",
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
  // 9. FEATURES & APP OVERVIEW (Huge multi-pillar data: points used!)
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
          "Yeh rahe hamare NexusCRM platform ke mukhya features aur suvidhayein:",
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
        text: "Bilkul! Main aapke poore CRM operations me practical madad ke liye tayyar hoon. Bataiye kya karna hai? Kisi customer ki contact details dekhni ho, status active ya inactive karna ho, naya client jodna ho, ya churn aur pipeline metrics samajhne ho—bas bejhijhak batayein, main turant sab sambhal loonga!",
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Always Here to Help'
      };
    } else {
      response = {
        text: "I am ready to assist across all your CRM operations. Whether you need to look up customer contact details, update an account status, add someone new, break down churn economics, or draft an outreach note, I am here to execute it practically for you. What is on your mind?",
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Always Here to Help'
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
        ? "Main bilkul badhiya aur fully operational hoon, poochne ke liye shukriya! Hamare sabhi enterprise accounts synced hain aur pipeline smooth chal rahi hai. Aapka din kaisa guzar raha hai?"
        : "I am doing fantastic, thanks so much for asking! All our enterprise accounts are synced and running smoothly across your pipeline. How is your day going so far?",
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
        ? "Main yahan active hoon, aapke customer accounts aur metrics par nazar banaye hue aur aapke agle command ke liye ready! Bataiye, abhi hum kis customer ya task par kaam karein?"
        : "Right now, I am actively monitoring your customer accounts and pipeline metrics, ready for your next request. What would you like to tackle across your accounts?",
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
      text: isHindi
        ? "Aapka bahut-bahut shukriya! Aapki madad karke mujhe sach me khushi hoti hai. Jab bhi koi agla kaam ho ya sawal aaye, bas batayein."
        : "You are so very welcome! It is genuinely a pleasure collaborating with you to keep your client operations seamless. Let me know whenever anything else comes up!",
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
      text: isHindi
        ? "Alvida aur apna dhyan rakhiyega! Aapke sabhi updates browser storage me surakshit hain, aur jab bhi aap wapas aayenge main yahin milunga."
        : "Goodbye and take great care of yourself! All your recent edits are safely stored in your browser storage, and I will be right here whenever you return.",
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
        ? "Yeh lijiye ek mazedaar chutkula: Ek sales executive ne spreadsheet se poocha, 'Tum itni emotional kyu nahi hoti?' Spreadsheet boli, 'Kyuki mere paas sirf Cells hain, dil nahi! Aur jab bhi problem aati hai, main bas #REF! bol kar chup ho jaati hoon!'"
        : "Here is a lighthearted joke for your workday: Why did the customer relationship manager break up with the spreadsheet? Because there were way too many trust issues with VLOOKUP, zero real-time commitment, and every time things got serious, it just threw a #VALUE! error!",
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
        ? "Main samajh sakta hoon. Client operations aur account management me kaafi mental energy lagti hai. Chhota sa 5 minute ka break lijiye. Jo bhi repetitive data ya status updates ka kaam ho, aap seedhe mujhe de dijiye—main autonomous tareeqe se turant kar doonga. Aap zaroori strategy par focus karein."
        : "I completely understand. Managing customer accounts and operations requires significant mental energy. Take a quick break and pace yourself. Hand any repetitive updates, status changes, or data searches over to me—I'll handle them autonomously so you can recharge.",
      toolCalled: 'explain_crm_concept',
      badge: 'Nexus AI: Empathy'
    };
  }

  // H. BUSINESS & CLIENT RELATIONSHIP ADVICE (Detailed advice: points used!)
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
        text: [
          "Mushkil clients aur sales handling ke liye 4 prabhavi practical tips:",
          "1. Active Listening: Pehle client ko apni poori baat aur frustration keh lene dein bina beech me toke.",
          "2. Empathy First: 'Main aapki pareshani poori tarah samajh sakta hoon' keh kar unka gussa de-escalate karein.",
          "3. Clear Timeline Commitment: Kehne ke bajaye ki 'dekh lenge', unhe concrete milestone dein jaise 'aaj sham 4 baje tak technical team ka solution mil jayega'.",
          "4. Proactive Follow-up: Issue resolve hone ke 48 ghante baad check-in message bhejein taaki unka vishwas mazboot ho sake."
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
          "4. Proactive Closure: Once resolved, check in 48 hours later to ensure everything continues running smoothly."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Practical Advice'
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
    if (normalized.includes('gemini')) {
      response = {
        text: isHindi
          ? "Main Google Gemini-grade conversational reasoning aur practical intelligence par chalne wala Nexus CRM Copilot hoon. Mera mission hai bilkul practical, real-world business analyst ki tarah aapse communicate karna aur aapke CRM ke har pehlu ko sambhalna—chahe pipeline velocity ho, customer churn mitigation ho, LTV/CAC optimization ho ya live directory updates. Main bina kisi generic gyaan ke bilkul actionable business insights deliver karta hoon. Bataiye, aapke customer portfolio me abhi hum kis workflow par focus karein?"
          : "I operate on Google Gemini-grade reasoning and practical conversational intelligence as your dedicated Nexus CRM Copilot. My architecture is designed to think through real-world business challenges—focusing purely on your customer lifecycle, pipeline velocity, churn mitigation, and portfolio analytics. I combine conversational depth with direct autonomous execution in your CRM database. What client account or pipeline metric would you like to review today?",
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Gemini Intelligence'
      };
    } else if (normalized.includes('agentic') || normalized.includes('generative')) {
      response = {
        text: isHindi
          ? "Nexus Copilot dono ka ek practical hybrid hai. Ek taraf generative AI ki tarah main natural language samajhta hoon, human-like reasoning ke sath context analyze karta hoon aur persuasive customer emails draft karta hoon. Dusri taraf ek autonomous agentic AI ki tarah main live CRM database me direct actions execute karta hoon—jaise customer status badalna, naye accounts onboard karna, aur churn metrics calculate karna. Yeh combination enterprise CRM operations ke liye sabse practical aur powerful setup hai."
          : "Nexus Copilot is a practical synthesis of both generative and agentic AI. As generative AI, I process natural language nuances, analyze business context with human-like reasoning, and draft tailored client communications. As an autonomous agentic AI, I directly execute actions against your live CRM database—updating customer records, onboarding new organizations, and recalculating churn metrics in real time. For enterprise CRM operations, this gives you practical, end-to-end execution.",
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Agentic Architecture'
      };
    } else {
      response = {
        text: isHindi
          ? "Main NexusCRM ka autonomous Copilot hoon, jo Google Gemini-grade intelligence aur practical business logic ke sath banaya gaya hai. Mera pura focus strictly aapke CRM ecosystem—customers, pipeline, churn prevention aur client relationship management—par hai. Main data entry aur routine operational tasks ko automate karta hoon taaki aap high-value strategy aur customer growth par dhyan de sakein. Bataiye aaj CRM me main aapki kya madad karoon?"
          : "I am the autonomous NexusCRM Copilot, engineered with Google Gemini-grade reasoning and practical business intellect. My entire intelligence is dedicated to your CRM ecosystem—empowering your customer lifecycle, pipeline velocity, churn reduction, and account management. By automating routine operations and providing actionable data insights, I help you focus on high-impact customer relationships. How can I assist across your accounts today?",
        toolCalled: 'explain_crm_concept',
        badge: 'Nexus AI: Thoughts on AI'
      };
    }
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
        ? `NexusCRM me sabse pehle onboard hue customer ${firstClient.name} (${firstClient.company}) hain, jo ${firstDate} ko ${firstClient.status} status ke sath add hue the (Email: ${firstClient.email}).`
        : `The earliest onboarded customer in NexusCRM is ${firstClient.name} from ${firstClient.company}, onboarded on ${firstDate} with ${firstClient.status} status (Email: ${firstClient.email}). They've been with us the longest!`,
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
        ? `NexusCRM me sabse naye onboard hue customer ${newestClient.name} (${newestClient.company}) hain, jo ${newestDate} ko ${newestClient.status} status ke sath add hue the (Phone: ${newestClient.phone}).`
        : `The most recently onboarded customer in NexusCRM is ${newestClient.name} from ${newestClient.company}, onboarded on ${newestDate} with ${newestClient.status} status (Phone: ${newestClient.phone}). Brand new to the team!`,
      toolCalled: 'fetch_customer_profile',
      badge: `Newest: ${newestClient.name}`,
      data: newestClient
    };
  }

  // =========================================================================
  // 11. COUNTS & REAL-TIME STATISTICAL INQUIRIES (Direct concise sentences!)
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
            ? `Aaj hamari directory me ${addedTodayCount} naye customer add hue hain: ${names}! Is mahine kul ${safeStats.newThisMonth} naye accounts onboard hue hain, aur total directory me ${totalCount} enterprise accounts hain.`
            : `We have ${addedTodayCount} customer(s) newly added today: ${names}! Overall during this monthly cycle, we've onboarded ${safeStats.newThisMonth} new client organizations across our ${totalCount} total accounts.`,
          toolCalled: 'get_portfolio_summary',
          badge: `Added Today: ${addedTodayCount}`
        };
      } else {
        response = {
          text: isHindi
            ? `Aaj abhi tak koi naya customer add nahi hua hai (aaj ka count 0 hai). Lekin is mahine kul ${safeStats.newThisMonth} naye enterprise clients onboard hue hain, aur directory me kul ${totalCount} accounts chal rahe hain. Agar aap kisi ko add karna chahte hain, to bas mujhe boliye jaise "Add customer Sarah at Netflix" aur main turant jod doonga!`
            : `No new customers have been added today yet (today's count is 0). However, we have onboarded ${safeStats.newThisMonth} new client organizations during this monthly cycle, bringing our total to ${totalCount} enterprise accounts. If you'd like to add a new client right now, just say "Add customer [Name] at [Company]" and I'll add them instantly!`,
          toolCalled: 'get_portfolio_summary',
          badge: 'Added Today: 0'
        };
      }
    } else if (hasActiveCue) {
      response = {
        text: isHindi
          ? `Aapke paas abhi ${activeCount} active customer accounts hain, jo kul ${totalCount} accounts ka ${activePct}% hissa hai. Kisi account ko inspect karna hai?`
          : `You currently have ${activeCount} active customer accounts, representing ${activePct}% of your total ${totalCount} enterprise portfolio. Need me to pull up anyone in particular?`,
        toolCalled: 'get_portfolio_summary',
        badge: `Active: ${activeCount}`
      };
    } else if (hasInactiveCue) {
      response = {
        text: isHindi
          ? `Aapke paas abhi ${inactiveCount} inactive accounts hain (${churnPct}% churn risk) kul ${totalCount} accounts me se. Kya kisi ke liye win-back email draft karna hai?`
          : `Right now you have ${inactiveCount} inactive customer accounts (${churnPct}% churn risk) out of ${totalCount} total accounts. Want me to draft a win-back email for any of them?`,
        toolCalled: 'get_portfolio_summary',
        badge: `Inactive: ${inactiveCount}`
      };
    } else if (normalized.includes('new') || normalized.includes('naya') || normalized.includes('this month') || normalized.includes('is mahine')) {
      response = {
        text: isHindi
          ? `Is mahine ${safeStats.newThisMonth} naye enterprise clients onboard hue hain! Aaj abhi tak ${addedTodayCount} customer add hue hain.`
          : `We've had ${safeStats.newThisMonth} new client organizations onboarded during the current monthly cycle, and ${addedTodayCount} added today!`,
        toolCalled: 'get_portfolio_summary',
        badge: `New: ${safeStats.newThisMonth}`
      };
    } else {
      response = {
        text: isHindi
          ? `NexusCRM me abhi kul ${totalCount} enterprise accounts hain: ${activeCount} active (${activePct}%), ${inactiveCount} inactive (${churnPct}%), aur is mahine ${safeStats.newThisMonth} naye accounts onboard hue hain.`
          : `NexusCRM is currently tracking ${totalCount} enterprise accounts for us: ${activeCount} active (${activePct}%), ${inactiveCount} inactive (${churnPct}%), and ${safeStats.newThisMonth} new accounts onboarded this month.`,
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
    const isDirectRateQuestion = normalized.includes('kitna') || normalized.includes('current') || normalized.includes('today') || normalized.includes('what is the');
    if (isDirectRateQuestion) {
      response = {
        text: isHindi
          ? `Aapka live churn rate abhi ${churnPct}% hai, jisme kul ${totalCount} me se ${inactiveCount} accounts inactive hain. Hum unhe re-engage karne ke liye outreach kar sakte hain!`
          : `Your live churn rate is currently ${churnPct}%, with ${inactiveCount} out of ${totalCount} enterprise accounts inactive. We can definitely work on reaching out to win them back!`,
        toolCalled: 'explain_crm_concept',
        badge: `Churn Rate: ${churnPct}%`
      };
    } else {
      if (isHindi) {
        response = {
          text: [
            "NexusCRM me Churn Rate ki jankari:",
            `1. Live Churn Rate: Abhi ${churnPct}% hai (${inactiveCount} accounts ${totalCount} me se inactive hain).`,
            "2. Paribhasha: Churn rate un customers ka percentage hai jinhone contract pause ya cancel kar diya hai.",
            "3. Calculation Formula: (Inactive Customers / Total Customers) guna 100.",
            "4. Industry Benchmark: Top B2B SaaS companies me churn 5% se 7% se kam hona chahiye."
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
            "4. Industry Benchmark: Top-tier B2B enterprise organizations aim for annual churn rates below 5% to 7%."
          ].join('\n'),
          toolCalled: 'explain_crm_concept',
          badge: `Churn Rate: ${churnPct}%`
        };
      }
    }
  }

  const isRetentionQuery =
    !response &&
    (normalized.includes('retention rate') ||
     normalized.includes('what is retention') ||
     normalized.includes('define retention') ||
     (normalized.includes('retention') && (normalized.includes('kya') || normalized.includes('kitna') || normalized.includes('rate'))));

  if (!response && isRetentionQuery) {
    const isDirectRateQuestion = normalized.includes('kitna') || normalized.includes('current') || normalized.includes('today') || normalized.includes('what is the');
    if (isDirectRateQuestion) {
      response = {
        text: isHindi
          ? `Aapka live retention rate abhi ${activePct}% hai, jisme kul ${totalCount} me se ${activeCount} accounts active hain. Yeh kaafi mazboot number hai!`
          : `Your live retention rate is currently ${activePct}%, with ${activeCount} out of ${totalCount} enterprise accounts active. That's a strong, healthy foundation!`,
        toolCalled: 'explain_crm_concept',
        badge: `Retention: ${activePct}%`
      };
    } else {
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
  }

  // =========================================================================
  // 13. PORTFOLIO BREAKDOWN & LIST COHORTS (Huge list data: points used!)
  // =========================================================================

  // List Active Customers Cohort (Huge list data: points used!)
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
        text: [
          `Yeh rahi NexusCRM me Active Accounts ki list (${activeList.length} total, ${activePct}% active ratio):`,
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

  // List Inactive Customers Cohort (Huge list data: points used!)
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
        text: [
          `Yeh rahi NexusCRM me Inactive Accounts ki list (${inactiveList.length} total, ${churnPct}% churn risk):`,
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
    const activeSample = customerPool.filter(c => c.status === 'Active').slice(0, 3).map(c => `${c.name} (${c.company})`).join(', ');
    const inactiveSample = customerPool.filter(c => c.status === 'Inactive').slice(0, 3).map(c => `${c.name} (${c.company})`).join(', ');

    if (isHindi) {
      response = {
        text: [
          `Aapke repository ke sabhi ${totalCount} accounts ka overview yeh raha:`,
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

  // =========================================================================
  // 14. CORE CRM CONCEPTS & STRATEGY (Multi-point framework)
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
          "Here is what CRM stands for and how it functions for us:",
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
          "CRM system use karne ke mukhya fayde yeh rahe:",
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
          "Key benefits of using a modern CRM system:",
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
          "Active aur Inactive accounts me antar (difference) yeh raha:",
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
          "Difference between active and inactive accounts in NexusCRM:",
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
          "Customer Lifetime Value (LTV) ki jankari yeh rahi:",
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
          "Customer Acquisition Cost (CAC) ki jankari yeh rahi:",
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

  // F. SALES PIPELINE (5 Stages: points used!)
  if (!response && !normalized.includes('velocity') && (normalized.includes('pipeline') || normalized.includes('sales funnel') || (normalized.includes('sales') && (normalized.includes('process') || normalized.includes('stages'))))) {
    if (isHindi) {
      response = {
        text: [
          "B2B Sales Pipeline ki 5 stages yeh rahi:",
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
          "Enterprise B2B sales pipeline stages:",
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
        text: [
          "BANT Lead Qualification Framework ka practical istemaal:",
          "1. Budget (बजट): Kya client ke paas aapke software ke liye dedicated budget allocated hai ya executive business case banana padega?",
          "2. Authority (अधिकार): Kya aap direct Economic Buyer se baat kar rahe hain jinke paas final signing power hai?",
          "3. Need (ज़रूरत): Unka critical operational pain point kya hai aur use solve na karne par unka kitna nuksan ho raha hai?",
          "4. Timeline (समयसीमा): Unka deployment target kab ka hai (e.g. current quarter ya next fiscal year)?",
          "Practical Tip: Client ko interrogative feel na karayein; discovery conversation ke dauraan yeh 4 points naturally validate karein."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Framework: BANT Qualification'
      };
    } else {
      response = {
        text: [
          "Practical Application of the BANT Lead Qualification Framework:",
          "1. Budget: Does the prospect have dedicated capital allocated, or will an out-of-cycle executive sign-off be required?",
          "2. Authority: Are you directly engaging the Economic Buyer who signs off on funds, or an internal evaluator?",
          "3. Need: What is the high-impact operational pain point, and what is the real cost of doing nothing?",
          "4. Timeline: What is their concrete target go-live date (e.g. end of quarter or next fiscal cycle)?",
          "Practical Rule: Avoid interrogating the buyer; weave these qualification checks naturally into your discovery conversations."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Framework: BANT Qualification'
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
        text: [
          "Enterprise B2B Sales me MEDDIC Methodology ka practical framework:",
          "1. Metrics (M): Client aapke software se measurable ROI kaise calculate karega (e.g. 25% efficiency boost).",
          "2. Economic Buyer (E): Budget authority rakhne wala senior leader jo purchase approve karega.",
          "3. Decision Criteria (D): Technical, financial aur security standards jinke aadhar par vendor select hoga.",
          "4. Decision Process (D): Legal, procurement aur vendor onboarding ke exact steps aur review dates.",
          "5. Identify Pain (I): Company ki wo core samasya jiska direct revenue ya risk impact hai.",
          "6. Champion (C): Client organization ke andar ka trusted stakeholder jo aapke product ko internally advocate kar raha hai."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Framework: MEDDIC'
      };
    } else {
      response = {
        text: [
          "Enterprise B2B MEDDIC Qualification Framework:",
          "1. Metrics: The quantifiable economic impact and ROI the client expects to achieve.",
          "2. Economic Buyer: The executive stakeholder holding discretionary budget authority.",
          "3. Decision Criteria: The technical, vendor, and commercial standards used to evaluate options.",
          "4. Decision Process: The internal procurement, legal, and security milestones required to close.",
          "5. Identify Pain: The high-priority operational blocker driving the purchase urgency.",
          "6. Champion: The trusted internal stakeholder who actively sells on your behalf when you are not in the room."
        ].join('\n'),
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
        text: [
          "Net Revenue Retention (NRR) ki practical jankari:",
          "1. Definition: Yeh batata hai ki pichhle saal ke existing customers se recurring revenue kitna badha ya ghata, naye acquisitions ko count kiye bina.",
          "2. Formula: (Starting ARR + Expansion - Contraction - Churn) / (Starting ARR) guna 100.",
          "3. Benchmark: Top SaaS companies me NRR 115% se 130% hota hai, jiska matlab hai ki business existing clients se organically grow kar raha hai.",
          "4. Significance: Existing client ko expand karna naya customer acquire karne se 5 guna sasta hota hai."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Metrics: NRR & Growth'
      };
    } else {
      response = {
        text: [
          "Understanding Net Revenue Retention (NRR):",
          "1. Definition: Measures the percentage of recurring revenue retained from existing customers over a period, incorporating expansions, contractions, and churn.",
          "2. Formula: (Starting ARR + Expansion - Contraction - Churn) / (Starting ARR) multiplied by 100.",
          "3. Industry Benchmark: Best-in-class SaaS companies target NRR above 115% to 125%, proving that customer expansion outpaces churn.",
          "4. Practical Advantage: Expanding revenue within existing accounts costs roughly 5 times less than acquiring brand-new logos."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Metrics: NRR & Growth'
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
        text: [
          "Enterprise Churn Prevention ke 4 practical steps:",
          "1. Telemetry aur Usage Track Karein: Weekly logins aur feature usage kam hote hi automated alert trigger karein.",
          "2. Renewal se 90 Din Pehle Review: Contract renewal aane se pehle Executive Sponsor ke sath QBR schedule karein.",
          "3. Proactive Intervention Play: Agar client disengaged hai, to unhe immediate tailored training aur leadership touchpoint provide karein.",
          "4. Root Cause Feedback: Agar koi customer churn hota hai, to exit review lekar product aur onboarding gaps ko turant fix karein."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Playbook: Churn Prevention'
      };
    } else {
      response = {
        text: [
          "Practical 4-Step Enterprise Churn Prevention Playbook:",
          "1. Telemetry and Early Warnings: Set automated alerts for drops in weekly active logins, license usage, or open support escalations.",
          "2. 90-Day Renewal Pre-Wiring: Conduct an Executive Business Review 90 days before contract expiry to validate ROI before renewal talks.",
          "3. Rapid Save Interventions: For disengaged accounts, immediately deploy customer engineering to eliminate friction and re-train staff.",
          "4. Exit Autopsies: Systematically document churn reasons (pricing, champion departure, missing features) to harden your product roadmap."
        ].join('\n'),
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
        text: [
          "High-Impact Quarterly Business Review (QBR) ka framework:",
          "1. Business Value aur ROI Review: Pichhle 90 dino me unhone aapke software se kya business milestone hasil kiya wo show karein.",
          "2. Mutual Goal Alignment: Agle quarter ke key objectives aur project deadlines par sahmat hon.",
          "3. Product Roadmap Preview: Aane wale exclusive features aur enhancements unke executive leaders ke samne present karein.",
          "4. Expansion Opportunities: Nayi teams ya departments ke liye rollout plan discuss karein."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Framework: QBR Execution'
      };
    } else {
      response = {
        text: [
          "How to Conduct a High-Impact Quarterly Business Review (QBR):",
          "1. Deliver Demonstrable ROI: Lead with quantifiable business outcomes achieved in the past 90 days, not raw feature usage.",
          "2. Align on Upcoming Objectives: Document their primary company goals for the next quarter and how your platform supports them.",
          "3. Share Strategic Roadmap: Preview upcoming features relevant to their workflow to build long-term commitment.",
          "4. Identify Expansion Vectors: Discuss departmental rollouts, additional seat licensing, or premium modules naturally."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Framework: QBR Execution'
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
        text: [
          "Customer Experience aur Satisfaction ke 3 core metrics:",
          "1. Net Promoter Score (NPS): 0 se 10 scale par loyalty measure karta hai (Promoters 9-10, Passives 7-8, Detractors 0-6). Formula: % Promoters minus % Detractors.",
          "2. Customer Satisfaction Score (CSAT): Kisi specific interaction ya support ticket ke baad 1 se 5 star rating ke sath instant feedback leta hai.",
          "3. Customer Effort Score (CES): Yeh dekhta hai ki client ke liye samasya solve karwana kitna aasan ya mushkil tha.",
          "Practical Action: Detractor feedback milne par 24 ghante ke andar direct phone call karke issue solve karein."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Metrics: NPS & CSAT'
      };
    } else {
      response = {
        text: [
          "Core Customer Experience Metrics (NPS, CSAT, CES):",
          "1. Net Promoter Score (NPS): Measures long-term brand loyalty on a 0-10 scale (Promoters 9-10, Passives 7-8, Detractors 0-6). Calculated as % Promoters minus % Detractors.",
          "2. Customer Satisfaction (CSAT): Transactional rating gathered immediately after a specific interaction or support resolution.",
          "3. Customer Effort Score (CES): Evaluates how easy or friction-free it was for the client to resolve their request.",
          "Practical Rule: Contact Detractors within 24 hours of receiving survey responses; rapid personal outreach converts 40% into advocates."
        ].join('\n'),
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
        text: [
          "Enterprise Customer Onboarding aur Time-to-Value (TTV) Strategy:",
          "1. Discovery to Kickoff Handoff: Sales team se sabhi customer requirements aur expectations Customer Success team ko transfer karein.",
          "2. Mutual Action Plan (MAP): Dono teams ke beech 30-day timeline aur clear milestones define karein.",
          "3. First 'Aha' Moment: Pehle 7 se 14 dino ke andar client ko product ki core value deliver karein taaki unka adoption pakka ho sake.",
          "4. Success Celebration: Onboarding complete hone par executive sponsors ko completion summary aur initial ROI report bhejein."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Strategy: Customer Onboarding'
      };
    } else {
      response = {
        text: [
          "Best Practices for Customer Onboarding and Time-to-Value (TTV):",
          "1. Seamless Sales-to-Success Handoff: Ensure zero repeat questioning; transfer all technical requirements and stakeholder context internally.",
          "2. Mutual Action Plan (MAP): Establish a shared 30-day implementation calendar with assigned owners on both sides.",
          "3. Accelerate First Value: Guide users to their primary 'Aha!' milestone within the first 14 days to lock in organizational momentum.",
          "4. Executive Milestone Sign-Off: Send a formal onboarding completion summary showcasing early adoption wins to the Economic Buyer."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Strategy: Customer Onboarding'
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
        text: [
          "CRM me Upselling aur Cross-selling ki practical guidelines:",
          "1. Upselling: Client ko unke maujooda plan se higher tier, zyada user seats, ya premium SLA par upgrade karwana.",
          "2. Cross-selling: Client ko unke primary software ke sath koi complementary module ya analytics add-on provide karna.",
          "3. Sahi Timing: Kabhi bhi support issues ya open tickets ke dauraan upsell na karein; hamesha unke kisi successful outcome ke baad pitch karein.",
          "4. Value-Based Approach: Pricing feature ke aadhar par nahi, balki unke business cost reduction ya revenue uplift ke aadhar par frame karein."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Strategy: Upsell & Expansion'
      };
    } else {
      response = {
        text: [
          "Practical Rules for Upselling and Cross-Selling:",
          "1. Upselling: Upgrading an existing account to a higher subscription tier, increased user seats, or enterprise SLAs.",
          "2. Cross-selling: Introducing complementary product modules or services that expand functionality for adjacent teams.",
          "3. The Golden Rule of Timing: Never pitch expansions when an account has unresolved support tickets; pitch immediately after a verified ROI milestone.",
          "4. Value-Framed Positioning: Frame upgrades around organizational efficiency and risk mitigation rather than software feature tiers."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Strategy: Upsell & Expansion'
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
        text: [
          "Sales Pipeline Velocity ka practical formula aur levers:",
          "1. Core Formula: Velocity = (Opportunities ki Sankhya * Win Rate * Average Deal Size) / (Sales Cycle ka Samay).",
          "2. Win Rate Badhana: Unqualified leads ko shuru me hi disqualify karein taaki team high-probability deals par focus kar sake.",
          "3. Cycle Time Kam Karna: Mutual Action Plan aur clear timelines dekar decision delay ko rokein.",
          "4. Practical Impact: Agar win rate 5% badhe aur sales cycle 10 din kam ho, to annualized revenue 25% se zyada grow kar sakta hai."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Strategy: Pipeline Velocity'
      };
    } else {
      response = {
        text: [
          "Understanding and Accelerating Pipeline Velocity:",
          "1. The Core Equation: Pipeline Velocity = (Number of Qualified Opportunities * Win Rate * Average Deal Size) / (Sales Cycle Length).",
          "2. Maximizing Win Rates: Ruthlessly disqualify low-fit prospects early so reps spend bandwidth only on high-conversion deals.",
          "3. Compressing Sales Cycles: Implement structured mutual action plans and define exact closing milestones with decision-makers.",
          "4. Operational Leverage: A 5% improvement in win rate combined with a 10-day reduction in sales cycle often yields a 25%+ surge in annual revenue."
        ].join('\n'),
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
        text: [
          "Enterprise CRM Support SLAs aur Escalations:",
          "1. First Response Time (FRT): Ticket create hone ke baad pehle response ka tay samay (e.g. Critical ke liye 15 minute).",
          "2. Resolution Time: Samasya ko poori tarah theek karne ki agreed commitment.",
          "3. Severity Tiers: P1 (System Down - Emergency), P2 (Major Impact - Core feature blocked), P3 (Minor Glitch - Workaround available), P4 (General Inquiry).",
          "4. Escalation Protocol: P1 issues me lead engineer aur customer success director ko turant 30-minute updates par loop me rakhein."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Operations: Support SLAs'
      };
    } else {
      response = {
        text: [
          "Enterprise Support SLAs and Escalation Protocols:",
          "1. First Response Time (FRT): The contractual window before an initial human engineer response (e.g. under 15 minutes for P1 outages).",
          "2. Mean Time to Resolution (MTTR): The targeted window to completely resolve the underlying issue.",
          "3. Severity Tiering: P1 (Critical Outage / Core System Halted), P2 (Major Degradation / Core Feature Blocked), P3 (Moderate Issue / Workaround Available), P4 (Routine Consultation).",
          "4. Escalation Management: On P1 tickets, establish dedicated bridge lines and push executive status updates every 30 minutes until restored."
        ].join('\n'),
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
        text: [
          "Inactive aur Churned Customers ko wapas lane ki Win-Back Strategy:",
          "1. Past Reason Diagnose Karein: Check karein ki unhone service kyu pause ya cancel ki thi (pricing, missing feature, ya support issue).",
          "2. New Value Showcase Karein: Unhe batayein ki unka specific blocker kaise solve kiya gaya hai (e.g. 'Humne wo feature live kar diya hai jiska aapko intezaar tha').",
          "3. Zero-Risk Trial Offer: 30-day complimentary pilot ya tailored renewal discount offer karein.",
          "4. Action: Aap 'Draft email for [Customer Name]' bolkar abhi tailored win-back outreach draft karwa sakte hain."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Strategy: Win-Back Outreach'
      };
    } else {
      response = {
        text: [
          "Proven Win-Back Framework for Inactive Client Accounts:",
          "1. Diagnose Historical Churn Drivers: Identify why the account paused (e.g. pricing, workflow integration gaps, or leadership changes).",
          "2. Present Tailored Improvements: Reach out showing that their primary friction point has been engineered away or improved.",
          "3. Low-Friction Re-Onboarding: Offer a 30-day reactivation pilot or grandfathered renewal incentive to minimize adoption risk.",
          "4. Immediate Execution: You can say 'Draft email for [Name]' right now to generate a custom re-engagement message."
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Strategy: Win-Back Outreach'
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
        text: [
          "Enterprise Deals Close karne aur Objections handle karne ke practical rules:",
          "1. Pricing Objection: Price kam karne ke bajaye, unke risk aur return (ROI) par focus karein. Batayein ki samasya hal na karne ki cost kitni zyada hai.",
          "2. Timeline Delay Objection: 'Mutual Action Plan' create karein aur unke board/leadership deadlines se go-live date reverse-engineer karein.",
          "3. Champion Enablement: Apne internal champion ko executive deck aur one-pager provide karein taaki wo internal meeting me deal push kar sake.",
          "4. The Closing Ask: Direct poochhein: 'Agar hum is timeline aur security compliance par sahmat hote hain, to kya contract sign karne me koi aur rukawat bachi hai?'"
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Strategy: Deal Closing'
      };
    } else {
      response = {
        text: [
          "Practical Rules for Closing Enterprise Deals and Handling Objections:",
          "1. Pricing Pushback: Never discount reactively. Shift discussion to the financial cost of inaction and proven payback timeframe.",
          "2. Timing and Delay Objections: Reverse-engineer the schedule from the client's internal quarterly objectives using a Mutual Action Plan.",
          "3. Arming Your Champion: Equip your internal champion with an executive business case so they can sell when you are not in the boardroom.",
          "4. The Direct Close: Ask the definitive closing question: 'Assuming we satisfy this security protocol and timeline, what other obstacles stand in the way of signing?'"
        ].join('\n'),
        toolCalled: 'explain_crm_concept',
        badge: 'Strategy: Deal Closing'
      };
    }
  }

  // =========================================================================
  // 15. EMAIL DRAFTING (Multi-field email template: points used!)
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
          text: `Business aur CRM ke practical nazariye se, success ka matlab hai: customers ke sath compounding trust aur continuous value create karna. Jab aapka retention rate high hota hai, churn kam rehta hai aur clients aapke solution ko indispensable maante hain, tab sustainable revenue growth automatically follow karti hai. Aapke NexusCRM me abhi ${activePct}% retention rate hai (${activeCount} active accounts)—ise 85%+ le jana ek practical business success target hai.`,
          toolCalled: 'explain_crm_concept',
          badge: 'Nexus AI: Conversational'
        };
      } else {
        response = {
          text: `From a practical business and CRM standpoint, real success is about creating compounding trust and demonstrable ROI for your customers. When retention is high, churn is low, and your clients view your platform as mission-critical, revenue growth and customer advocacy follow automatically. In NexusCRM, we currently hold an ${activePct}% retention rate across our ${totalCount} accounts—pushing that toward 85%+ is a concrete, measurable success milestone.`,
          toolCalled: 'explain_crm_concept',
          badge: 'Nexus AI: Conversational'
        };
      }
    } else if (isOutOfDomain) {
      if (isHindi) {
        response = {
          text: `Main Google Gemini-grade reasoning par chalne wala ek dedicated CRM Copilot hoon, isliye mera focus strictly aapke enterprise customer accounts, sales pipeline, churn mitigation aur portfolio metrics par kendrit hai. Non-CRM vishayon ke bajaye, chaliye aapke customer accounts aur business workflows par concentrate karte hain. Aapke database me abhi ${totalCount} accounts hain (${activeCount} active, ${inactiveCount} inactive)—bataiye inme se kis customer ya pipeline metric par hum kaam karein?`,
          toolCalled: 'explain_crm_concept',
          badge: 'Nexus AI: CRM Focus'
        };
      } else {
        response = {
          text: `I operate with Google Gemini-grade intelligence specifically dedicated to enterprise CRM operations, customer directory management, sales pipeline velocity, and client retention. To deliver maximum business value, I stay strictly focused on your CRM workflows. Looking at your live portfolio of ${totalCount} accounts with an ${activePct}% retention rate, how can I assist with your customer records, deal workflows, or outreach today?`,
          toolCalled: 'explain_crm_concept',
          badge: 'Nexus AI: CRM Focus'
        };
      }
    } else {
      if (isHindi) {
        response = {
          text: `Yeh ek dilchasp sawal hai. Practical business aur CRM operations ke nazariye se, har outcome consistency, clear expectations aur data-driven execution par depend karta hai. NexusCRM me abhi aapke ${totalCount} accounts (${activeCount} active, ${inactiveCount} inactive) live track ho rahe hain. Agar kisi specific customer, pipeline status ya CRM metric par action lena ho, to bas batayein!`,
          toolCalled: 'explain_crm_concept',
          badge: 'Nexus AI: Conversational'
        };
      } else {
        response = {
          text: `That is an interesting inquiry. From a practical business and CRM operations perspective, sustainable results always come down to consistency, clear accountability, and data-driven execution. Across NexusCRM, we are currently managing ${totalCount} accounts with an ${activePct}% active retention rate. If you would like to inspect a customer, adjust an account status, or optimize your pipeline, just say the word!`,
          toolCalled: 'explain_crm_concept',
          badge: 'Nexus AI: Conversational'
        };
      }
    }
  }

  // Mandatory Post-Processing:
  // 1. Reciprocate user greeting if user greeted while asking a question
  // 2. Strip every single asterisk (*)
  // 3. Strip any accidental mention of "friend" / "dost"
  // 4. Clean any badge mentioning "friend" or "dost"
  let cleanText = response.text.replace(/\*/g, '').trim();

  if (userSaidGreeting && !isPureGreeting && cleanText) {
    const startsWithOpener = /^(?:hi|hello|hey|namaste|good\s+morning|good\s+afternoon|good\s+evening|arre\s+bilkul|bilkul|all\s+done|awesome|zabardast)\b/i.test(cleanText);
    if (!startsWithOpener) {
      const greetingPrefix = isHindi ? "Namaste! " : "Hello! ";
      cleanText = greetingPrefix + cleanText;
    }
  }

  cleanText = stripFriendReferences(cleanText);

  const cleanBadge = response.badge
    ? response.badge.replace(/\b(friend|dost)\b:?\s*/gi, '').trim()
    : response.badge;

  return {
    ...response,
    badge: cleanBadge,
    text: cleanText
  };
}
