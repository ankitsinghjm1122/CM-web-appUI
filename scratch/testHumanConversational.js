import { processCopilotMessage } from '../src/services/aiAgentService.js';

const mockContext = {
  customers: [
    { id: 'CUST-001', name: 'Eleanor Vance', company: 'Apex Global', email: 'eleanor@apex.io', phone: '+1-555-0101', status: 'Active' },
    { id: 'CUST-002', name: 'Marcus Brody', company: 'Zenith Labs', email: 'marcus@zenith.io', phone: '+1-555-0102', status: 'Inactive' }
  ],
  stats: { total: 2, active: 1, inactive: 1, newThisMonth: 1 },
  theme: 'dark'
};

const conversationalPrompts = [
  'hi',
  'hello how are you doing?',
  'kaise ho aap?',
  'kya kar rahe ho?',
  'thank you so much',
  'bahut shukriya',
  'tell me a joke',
  'kuch funny sunao',
  'i am feeling tired today',
  'how do i handle an angry customer?',
  'what do you think about ai?',
  'goodbye see you later',
  'alvida phir milte hain'
];

async function test() {
  for (const q of conversationalPrompts) {
    console.log('====================================================');
    console.log('USER:', q);
    const res = await processCopilotMessage(q, mockContext);
    console.log('BADGE:', res.badge);
    console.log('ASTERISK?:', res.text.includes('*'));
    console.log('REPLY:');
    console.log(res.text);
    console.log();
  }
}

test();
