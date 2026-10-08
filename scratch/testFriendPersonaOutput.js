import { processCopilotMessage } from '../src/services/aiAgentService.js';

const mockContext = {
  customers: [
    { id: 'CUST-001', name: 'Eleanor Vance', company: 'Apex Global', email: 'eleanor@apex.io', phone: '+1-555-0101', status: 'Active' },
    { id: 'CUST-002', name: 'Marcus Brody', company: 'Zenith Labs', email: 'marcus@zenith.io', phone: '+1-555-0102', status: 'Inactive' }
  ],
  stats: { total: 2, active: 1, inactive: 1, newThisMonth: 1 },
  deleteCustomer: (id) => console.log('Deleted customer:', id),
  updateCustomer: (id, fields) => console.log('Updated customer:', id, fields),
  toggleTheme: () => console.log('Toggled theme'),
  profile: { name: 'Sdfghj', role: 'Operations Director', email: 'alex@nexuscrm.io' }
};

const samples = [
  "hey friend, can you help me?",
  "kya tum meri madad karoge?",
  "who is Eleanor Vance?",
  "Marcus ka phone number batao",
  "can you make Marcus active?",
  "Eleanor ko delete kar do",
  "what is CRM and why do we need it?",
  "how are you feeling today?"
];

async function run() {
  for (const s of samples) {
    console.log(`\n=============================\nUSER: "${s}"`);
    const res = await processCopilotMessage(s, mockContext);
    console.log(`COPILOT (${res.toolCalled || 'no_tool'}, badge: ${res.badge}):\n${res.text}`);
    if (res.text.includes('*')) {
      console.error('ERROR: Contains asterisk!');
    }
  }
}

run();
