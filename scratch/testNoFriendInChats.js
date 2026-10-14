
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

const testQueries = [
  // 1. Greetings & human banter
  "hi",
  "hello",
  "hey there",
  "how are you?",
  "aap kaise ho?",
  "kya chal raha hai?",
  "tell me a joke",
  "mujhe ek joke sunao",
  "i feel tired today",
  "what should i do about a difficult client?",
  "are you an agentic ai or generative ai?",
  "thank you so much",
  "bahut dhanyawad",
  "bye",
  "alvida",
  
  // 2. Specific metrics and data
  "how many customers are newly added today?",
  "aaj kitne naye customer add hue hain?",
  "total customers kitne hain?",
  "what is our churn rate?",
  "hamara churn rate kitna hai?",
  "who is our oldest client?",
  "sabse purana client kaun hai?",
  "who is our newest customer?",
  "show me all active customers",
  "show me inactive customers",

  // 3. CRM concepts
  "what is crm?",
  "crm kya hota hai?",
  "why do we use crm?",
  "crm ke kya fayde hain?",
  "difference between active and inactive",
  "active aur inactive me kya antar hai?",
  "what is ltv?",
  "what is cac?",
  "explain the sales pipeline",
  "tell me about the acquisition velocity chart",

  // 4. Operations & Mutations
  "how do i add a customer?",
  "delete Eleanor Vance",
  "set David Kim to Inactive",
  "switch to light theme",
  "give me contact info for Marcus Vance",
  "draft an email to Eleanor Vance",

  // 5. Fallback general questions
  "what is the meaning of success?",
  "kya tum meri madad kar sakte ho?",
  "can you help me with something general?"
];

async function runTests() {
  console.log(`Starting 'No Friend / No Dost' verification across ${testQueries.length} test queries...\n`);
  let passed = 0;
  let failed = 0;

  for (const query of testQueries) {
    const res = await processCopilotMessage(query, mockContext);
    const text = res.text || '';
    const badge = res.badge || '';

    const hasFriendInText = /\bfriend\b/i.test(text);
    const hasDostInText = /\bdost\b/i.test(text);
    const hasFriendInBadge = /\bfriend\b/i.test(badge);
    const hasDostInBadge = /\bdost\b/i.test(badge);
    const hasAsterisk = /\*/.test(text);

    if (hasFriendInText || hasDostInText || hasFriendInBadge || hasDostInBadge || hasAsterisk) {
      console.error(`❌ FAILED for query: "${query}"`);
      if (hasFriendInText) console.error(`   Found 'friend' in text: "${text.substring(0, 100)}..."`);
      if (hasDostInText) console.error(`   Found 'dost' in text: "${text.substring(0, 100)}..."`);
      if (hasFriendInBadge) console.error(`   Found 'friend' in badge: "${badge}"`);
      if (hasDostInBadge) console.error(`   Found 'dost' in badge: "${badge}"`);
      if (hasAsterisk) console.error(`   Found asterisk in text!`);
      failed++;
    } else {
      console.log(`✅ PASSED [${res.toolCalled || 'none'}] [${res.badge}]: "${query}"`);
      passed++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Total: ${testQueries.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
