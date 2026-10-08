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

const scenarios = [
  // A. PURE GREETINGS -> MUST GREET BACK
  {
    query: "hi",
    check: (res) => /hey there|hello|connect with you/i.test(res.text) && res.badge === 'Nexus AI: Hello!',
    description: "Pure 'hi' reciprocates greeting"
  },
  {
    query: "hello",
    check: (res) => /hey there|hello|connect with you/i.test(res.text) && res.badge === 'Nexus AI: Hello!',
    description: "Pure 'hello' reciprocates greeting"
  },
  {
    query: "namaste",
    check: (res) => /namaste/i.test(res.text) && res.badge === 'Nexus AI: Hello!',
    description: "Pure 'namaste' reciprocates greeting in Hindi"
  },
  {
    query: "good morning",
    check: (res) => /hey there|hello|connect with you/i.test(res.text) && res.badge === 'Nexus AI: Hello!',
    description: "Pure 'good morning' reciprocates greeting"
  },

  // B. GREETING + QUESTION -> MUST GREET AND ANALYZE EXACT DATA
  {
    query: "hi, how many customers are newly added today?",
    check: (res) => /hello|hey/i.test(res.text) && /0|today/i.test(res.text) && res.badge.includes('Added Today'),
    description: "Greets back AND analyzes today customer additions"
  },
  {
    query: "hello, what is our churn rate?",
    check: (res) => /hello|hey/i.test(res.text) && /25%/i.test(res.text) && res.badge.includes('Churn Rate'),
    description: "Greets back AND analyzes live churn rate"
  },
  {
    query: "hey, who is Eleanor Vance?",
    check: (res) => /hello|hey/i.test(res.text) && /Hillcrest BioTech/i.test(res.text) && /eleanor/i.test(res.text),
    description: "Greets back AND returns Eleanor's dossier"
  },
  {
    query: "namaste, aaj kitne naye customer add hue hain?",
    check: (res) => /namaste/i.test(res.text) && /aaj/i.test(res.text) && /0/i.test(res.text),
    description: "Greets back in Hindi AND analyzes today additions"
  },

  // C. DATA QUESTIONS -> EXACT DATA ANALYSIS (NO GREETING PREPEND REQUIRED)
  {
    query: "how many customers are newly added today?",
    check: (res) => !res.text.startsWith('Hello! ') && /0|today/i.test(res.text) && res.badge.includes('Added Today'),
    description: "Analyzes today's customer count without forced greeting"
  },
  {
    query: "who is our newest customer?",
    check: (res) => /newest|most recently/i.test(res.text) && res.badge.includes('Newest'),
    description: "Analyzes newest customer chronology (NOT count!)"
  },
  {
    query: "who is our oldest customer?",
    check: (res) => /earliest|oldest/i.test(res.text) && res.badge.includes('Earliest'),
    description: "Analyzes oldest customer chronology"
  },
  {
    query: "show me all active customers",
    check: (res) => /Active Accounts/i.test(res.text) && res.badge.includes('Active'),
    description: "Analyzes and lists active cohort"
  },
  {
    query: "show me all inactive customers",
    check: (res) => /Inactive Accounts/i.test(res.text) && res.badge.includes('Inactive'),
    description: "Analyzes and lists inactive cohort"
  },
  {
    query: "who is at Apex Global?",
    check: (res) => /Apex Global/i.test(res.text) && res.badge.includes('Apex Global'),
    description: "Analyzes customers belonging to Apex Global company"
  },
  {
    query: "is Eleanor Vance active?",
    check: (res) => /Yes.*Active/i.test(res.text) && res.badge.includes('Eleanor Vance'),
    description: "Analyzes Eleanor's active status"
  },
  {
    query: "what is Marcus Brody's phone number?",
    check: (res) => /phone/i.test(res.text) && /\+1-555-0102|\+1 \(555\)/i.test(res.text),
    description: "Analyzes Marcus Brody's phone number"
  },
  {
    query: "can you help me find total customer count?",
    check: (res) => /28 enterprise accounts/i.test(res.text) && res.badge.includes('Total'),
    description: "Answers count query even when worded with 'help me'"
  },
  {
    query: "what is our retention rate?",
    check: (res) => /75%/i.test(res.text) && res.badge.includes('Retention'),
    description: "Analyzes live retention rate percentage"
  }
];

async function run() {
  console.log("Running Greeting & Exact Data Analysis Verification...\n");
  let passed = 0;
  let failed = 0;

  for (const s of scenarios) {
    const res = await processCopilotMessage(s.query, mockContext);
    const hasFriend = /\bfriend\b/i.test(res.text) || /\bdost\b/i.test(res.text);
    const hasAsterisk = /\*/.test(res.text);
    const passedCheck = s.check(res) && !hasFriend && !hasAsterisk;

    if (passedCheck) {
      console.log(`✅ PASS: ${s.description}`);
      console.log(`   Query: "${s.query}"`);
      console.log(`   Badge: [${res.badge}]`);
      console.log(`   Preview: "${res.text.split('\n')[0].substring(0, 100)}..."\n`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${s.description}`);
      console.error(`   Query: "${s.query}"`);
      console.error(`   Badge: [${res.badge}]`);
      console.error(`   Response: "${res.text}"`);
      console.error(`   hasFriend: ${hasFriend}, hasAsterisk: ${hasAsterisk}\n`);
      failed++;
    }
  }

  console.log(`========================================`);
  console.log(`Total: ${scenarios.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

run();
