import { processCopilotMessage } from '../src/services/aiAgentService.js';

const mockContext = {
  customers: [
    { id: 'CUST-001', name: 'Eleanor Vance', company: 'Apex Global', email: 'eleanor@apex.io', phone: '+1-555-0101', status: 'Active', createdAt: '2026-10-02T10:30:00Z' },
    { id: 'CUST-002', name: 'Marcus Brody', company: 'Zenith Labs', email: 'marcus@zenith.io', phone: '+1-555-0102', status: 'Inactive', createdAt: '2026-10-04T14:15:00Z' }
  ],
  stats: { total: 2, active: 1, inactive: 1, newThisMonth: 1 },
  deleteCustomer: () => {},
  updateCustomer: () => {},
  toggleTheme: () => {},
  profile: { name: 'Sdfghj', role: 'Operations Director', email: 'alex@nexuscrm.io' }
};

const testQueries = [
  "how many customers are newly added today",
  "how many customers added today",
  "kitne customers add hue aaj",
  "how to add a customer",
  "how do i add a customer",
  "how many customers do we have",
  "how many active customers"
];

async function run() {
  console.log("=== RUNNING NEWLY ADDED TODAY & HOW-TO DISPATCH TESTS ===");
  for (const q of testQueries) {
    const res = await processCopilotMessage(q, mockContext);
    console.log(`\nQUERY: "${q}"`);
    console.log(`TOOL: ${res.toolCalled}, BADGE: ${res.badge}`);
    console.log(`REPLY:\n${res.text}`);

    // Check assertions
    if (q.includes("how many customers are newly added today")) {
      if (res.text.includes("Here is the easiest way we can add")) {
        console.error("FAILED! Returned tutorial instead of count!");
      } else {
        console.log("SUCCESS! Returned count / stat answer!");
      }
    }
    if (q.includes("how to add a customer")) {
      if (!res.text.includes("1. ")) {
        console.error("FAILED! Expected tutorial with numbered points!");
      } else {
        console.log("SUCCESS! Returned tutorial with numbered points!");
      }
    }
  }
}

run();
