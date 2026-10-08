import { processCopilotMessage } from '../src/services/aiAgentService.js';

const mockContext = {
  customers: [
    { id: 'CUST-001', name: 'Eleanor Vance', company: 'Apex Global', email: 'eleanor@apex.io', phone: '+1-555-0101', status: 'Active' },
    { id: 'CUST-002', name: 'Marcus Brody', company: 'Zenith Labs', email: 'marcus@zenith.io', phone: '+1-555-0102', status: 'Inactive' }
  ],
  stats: { total: 2, active: 1, inactive: 1, newThisMonth: 1 },
  deleteCustomer: () => {},
  updateCustomer: () => {},
  toggleTheme: () => {},
  profile: { name: 'Sdfghj', role: 'Operations Director', email: 'alex@nexuscrm.io' }
};

const tests = [
  // Normal / Conversational (Should NOT have numbered points '1. ')
  { q: 'hello', expectPoints: false },
  { q: 'how are you?', expectPoints: false },
  { q: 'kaise ho aap?', expectPoints: false },
  { q: 'can you help me with crm and customer info?', expectPoints: false },
  { q: 'kya tum meri madad kar sakte ho?', expectPoints: false },
  { q: 'i need help with customers', expectPoints: false },
  { q: 'thank you', expectPoints: false },
  { q: 'tell me a joke', expectPoints: false },
  { q: 'is marcus active?', expectPoints: false },
  { q: 'marcus ka phone number kya hai', expectPoints: false },
  { q: 'delete eleanor', expectPoints: false },
  { q: 'make eleanor inactive', expectPoints: false },
  { q: 'who is the operations director?', expectPoints: false },
  { q: 'how many active customers are there?', expectPoints: false },
  { q: 'churn rate kitna hai?', expectPoints: false },

  // Huge Data / Tutorials / Lists (SHOULD have numbered points '1. ')
  { q: 'how to add a customer', expectPoints: true },
  { q: 'how to update customer', expectPoints: true },
  { q: 'how to delete customer', expectPoints: true },
  { q: 'what are the features of nexuscrm', expectPoints: true },
  { q: 'list all customers', expectPoints: true },
  { q: 'sabke baare me batao', expectPoints: true },
  { q: 'list active customers', expectPoints: true },
  { q: 'what is sales pipeline', expectPoints: true },
  { q: 'how do i handle an angry customer?', expectPoints: true }
];

async function run() {
  let passed = 0;
  for (const t of tests) {
    const res = await processCopilotMessage(t.q, mockContext);
    const hasPoints = /\b1\.\s/.test(res.text);
    const hasAsterisk = res.text.includes('*');
    const ok = (hasPoints === t.expectPoints) && !hasAsterisk;
    if (ok) passed++;
    console.log(`[${ok ? 'PASS' : 'FAIL'}] "${t.q}" -> hasPoints: ${hasPoints} (expected: ${t.expectPoints}), asterisk: ${hasAsterisk}`);
    console.log(`     Response preview: "${res.text.split('\n')[0].slice(0, 80)}..."`);
  }
  console.log(`\nResult: ${passed}/${tests.length} tests passed.`);
}

run();
