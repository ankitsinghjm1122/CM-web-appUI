import { processCopilotMessage } from '../src/services/aiAgentService.js';

const mockContext = {
  customers: [
    { id: 'CUST-001', name: 'Eleanor Vance', company: 'Apex Global', email: 'eleanor@apex.io', phone: '+1-555-0101', status: 'Active' },
    { id: 'CUST-002', name: 'Marcus Brody', company: 'Zenith Labs', email: 'marcus@zenith.io', phone: '+1-555-0102', status: 'Inactive' }
  ],
  stats: { total: 2, active: 1, inactive: 1, newThisMonth: 1 },
  updateCustomer: (id, chg) => { console.log('ACTION updateCustomer:', id, chg); },
  deleteCustomer: (id) => { console.log('ACTION deleteCustomer:', id); },
  addCustomer: (cust) => { console.log('ACTION addCustomer:', cust); },
  theme: 'dark',
  toggleTheme: () => { console.log('ACTION toggleTheme'); },
  setTheme: (t) => { console.log('ACTION setTheme:', t); },
  profile: {
    name: 'Sdfghj',
    role: 'Operations Director',
    email: 'alex.morgan@nexuscrm.io',
    phone: '+1 (555) 019-2834',
    company: 'Nexus Global Technologies',
    bio: 'Leading customer growth and onboarding workflows.'
  }
};

const testQueries = [
  // 1. Action: Delete variations
  'delete eleanor',
  'can you delete eleanor',
  'please delete eleanor',
  'eleanor ko delete kar do',
  'eleanor ko hata do',

  // 2. Action: Status update variations
  'make eleanor inactive',
  'eleanor ko inactive kar do',
  'change eleanor status to inactive',
  'eleanor ka status inactive kar do',
  'marcus ko active karo',
  'set marcus to active',

  // 3. Director / User variations
  'who is operations director',
  'who is sdfghj',
  'director kaun hai',
  'who is admin',
  'what is director email',

  // 4. How-To & Features
  'how to add a customer',
  'customer kaise add karein',
  'how to update customer',
  'how to delete customer',
  'what are the features',
  'what is this app',

  // 5. Lookups & Status checks
  'is marcus active',
  'is eleanor active',
  'eleanor ka phone number kya hai',
  'marcus ka email kya hai',
  'who is eleanor',

  // 6. Counts & Stats
  'how many active customers',
  'kitne active customer hain',
  'how many inactive customers',
  'churn rate kitna hai',
  'sabke baare me batao',

  // 7. Theme
  'dark mode karo',
  'light mode karo'
];

async function run() {
  for (const q of testQueries) {
    console.log('====================================================');
    console.log('PROMPT:', q);
    const res = await processCopilotMessage(q, mockContext);
    console.log('TOOL:', res.toolCalled, '| BADGE:', res.badge);
    console.log('ASTERISK?:', res.text.includes('*'));
    console.log('FIRST 2 LINES:');
    console.log(res.text.split('\n').slice(0, 3).join('\n'));
  }
}

run();
