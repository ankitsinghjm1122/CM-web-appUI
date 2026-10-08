import { processCopilotMessage } from '../src/services/aiAgentService.js';
import { INITIAL_CUSTOMERS } from '../src/data/mockCustomers.js';

const mockContext = {
  customers: INITIAL_CUSTOMERS,
  stats: {
    total: INITIAL_CUSTOMERS.length,
    active: INITIAL_CUSTOMERS.filter(c => c.status === 'Active').length,
    inactive: INITIAL_CUSTOMERS.filter(c => c.status === 'Inactive').length,
    activePercentage: Math.round((INITIAL_CUSTOMERS.filter(c => c.status === 'Active').length / INITIAL_CUSTOMERS.length) * 100),
    churnRate: Math.round((INITIAL_CUSTOMERS.filter(c => c.status === 'Inactive').length / INITIAL_CUSTOMERS.length) * 100),
    newThisMonth: 12
  },
  theme: 'dark'
};

const tests = [
  // 1. GEMINI IDENTITY & PRACTICAL COPILOT PERSONA
  {
    query: "are you gemini?",
    lang: "en",
    check: (res) => /Google Gemini-grade reasoning/i.test(res.text) && /CRM/i.test(res.text) && res.badge === 'Nexus AI: Gemini Intelligence',
    description: "Gemini identity in English"
  },
  {
    query: "kya tum gemini ho?",
    lang: "hi",
    check: (res) => /Google Gemini-grade/i.test(res.text) && /practical/i.test(res.text) && res.badge === 'Nexus AI: Gemini Intelligence',
    description: "Gemini identity in Hindi"
  },
  {
    query: "gemini jese baat karo",
    lang: "hi",
    check: (res) => /Google Gemini-grade/i.test(res.text) && /CRM/i.test(res.text),
    description: "Gemini style request in Hindi"
  },

  // 2. CRM DOMAINS & PRACTICAL FRAMEWORKS (EVERYTHING RELATED TO CRM)
  {
    query: "what is the bant framework?",
    lang: "en",
    check: (res) => /BANT Lead Qualification/i.test(res.text) && /Budget/i.test(res.text) && res.badge.includes('BANT'),
    description: "BANT framework in English"
  },
  {
    query: "meddic sales methodology explain karo",
    lang: "hi",
    check: (res) => /MEDDIC Methodology/i.test(res.text) && /Economic Buyer/i.test(res.text) && res.badge.includes('MEDDIC'),
    description: "MEDDIC methodology in Hindi"
  },
  {
    query: "what is net revenue retention nrr?",
    lang: "en",
    check: (res) => /Net Revenue Retention/i.test(res.text) && /115%/i.test(res.text) && res.badge.includes('NRR'),
    description: "NRR metric explanation in English"
  },
  {
    query: "churn kaise rokein?",
    lang: "hi",
    check: (res) => /Churn Prevention/i.test(res.text) && /Executive Sponsor/i.test(res.text) && res.badge.includes('Churn Prevention'),
    description: "Churn prevention playbook in Hindi"
  },
  {
    query: "how to conduct a qbr?",
    lang: "en",
    check: (res) => /Quarterly Business Review/i.test(res.text) && /ROI/i.test(res.text) && res.badge.includes('QBR'),
    description: "QBR execution framework in English"
  },
  {
    query: "what is nps and csat?",
    lang: "en",
    check: (res) => /Net Promoter Score/i.test(res.text) && /CSAT/i.test(res.text) && res.badge.includes('NPS'),
    description: "NPS and CSAT explanation in English"
  },
  {
    query: "customer onboarding ka process kya hai?",
    lang: "hi",
    check: (res) => /Customer Onboarding/i.test(res.text) && /Aha/i.test(res.text) && res.badge.includes('Onboarding'),
    description: "Customer onboarding best practices in Hindi"
  },
  {
    query: "explain upselling and cross selling in crm",
    lang: "en",
    check: (res) => /Upselling/i.test(res.text) && /Cross-selling/i.test(res.text) && res.badge.includes('Upsell'),
    description: "Upselling and cross-selling in English"
  },
  {
    query: "what is pipeline velocity?",
    lang: "en",
    check: (res) => /Pipeline Velocity/i.test(res.text) && /Win Rate/i.test(res.text) && res.badge.includes('Pipeline Velocity'),
    description: "Pipeline velocity formula in English"
  },
  {
    query: "sla kya hota hai?",
    lang: "hi",
    check: (res) => /Support SLAs/i.test(res.text) && /First Response Time/i.test(res.text) && res.badge.includes('SLAs'),
    description: "Support SLA definition in Hindi"
  },
  {
    query: "inactive customer ko wapas kaise layein win back?",
    lang: "hi",
    check: (res) => /Win-Back/i.test(res.text) && /Diagnose/i.test(res.text) && res.badge.includes('Win-Back'),
    description: "Win-back framework in Hindi"
  },
  {
    query: "how do i close deals and handle pricing objections?",
    lang: "en",
    check: (res) => /Closing/i.test(res.text) && /Pricing/i.test(res.text) && res.badge.includes('Deal Closing'),
    description: "Objection handling and deal closing in English"
  },

  // 3. OUT-OF-DOMAIN GUARDRAIL REDIRECTION (POLITELY REDIRECT TO CRM)
  {
    query: "how to bake a chocolate cake?",
    lang: "en",
    check: (res) => /Gemini-grade/i.test(res.text) && /CRM/i.test(res.text) && res.badge === 'Nexus AI: CRM Focus',
    description: "Out-of-domain recipe query redirected to CRM in English"
  },
  {
    query: "aaj ka mausam kaisa hai?",
    lang: "hi",
    check: (res) => /Gemini-grade/i.test(res.text) && /CRM/i.test(res.text) && res.badge === 'Nexus AI: CRM Focus',
    description: "Out-of-domain weather query redirected to CRM in Hindi"
  },
  {
    query: "who won the cricket match today?",
    lang: "en",
    check: (res) => /CRM/i.test(res.text) && res.badge === 'Nexus AI: CRM Focus',
    description: "Out-of-domain cricket query redirected to CRM in English"
  },
  {
    query: "suggest me a good bollywood movie",
    lang: "en",
    check: (res) => /CRM/i.test(res.text) && res.badge === 'Nexus AI: CRM Focus',
    description: "Out-of-domain movie query redirected to CRM in English"
  }
];

async function run() {
  console.log(`Starting Gemini Practical CRM Verification across ${tests.length} tests...\n`);
  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    const res = await processCopilotMessage(t.query, mockContext);
    const text = res.text || '';
    const badge = res.badge || '';

    const hasFriendInText = /\bfriend\b/i.test(text);
    const hasDostInText = /\bdost\b/i.test(text);
    const hasFriendInBadge = /\bfriend\b/i.test(badge);
    const hasDostInBadge = /\bdost\b/i.test(badge);
    const hasAsterisk = /\*/.test(text);
    const passedCheck = t.check(res);

    if (hasFriendInText || hasDostInText || hasFriendInBadge || hasDostInBadge || hasAsterisk || !passedCheck) {
      console.error(`❌ FAILED: ${t.description}`);
      console.error(`   Query: "${t.query}"`);
      console.error(`   Badge: [${badge}]`);
      console.error(`   Text: "${text.substring(0, 150)}..."`);
      if (hasFriendInText) console.error(`   Forbidden: found 'friend' in text`);
      if (hasDostInText) console.error(`   Forbidden: found 'dost' in text`);
      if (hasAsterisk) console.error(`   Forbidden: found asterisk (*) in text`);
      if (!passedCheck) console.error(`   Failed custom check!`);
      failed++;
    } else {
      console.log(`✅ PASS: ${t.description}`);
      console.log(`   Badge: [${badge}]`);
      console.log(`   Preview: "${text.split('\n')[0].substring(0, 90)}..."\n`);
      passed++;
    }
  }

  console.log(`========================================`);
  console.log(`Total: ${tests.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

run();
