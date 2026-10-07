# NexusCRM — Modern Customer Management Dashboard UI

NexusCRM is a responsive, feature-complete Customer Relationship Management (CRM) web application UI built with **React**, **Tailwind CSS**, and **Vite**. It provides customer analytics, pipeline tracking, directory search/filters, full mock CRUD operations with instant reactivity, and a persistent dark mode theme.

---

## 🚀 Live Demo & Key Highlights

- **Zero Backend Required:** All customer records, session states, profile details, and theme configurations persist seamlessly using browser `localStorage`.
- **Full Reactivity:** Adding, editing, or deleting a customer dynamically recalculates dashboard KPI cards (Total, Active, Inactive, New this month) and updates the growth chart in real time.
- **Persistent Theming:** Seamless dark mode toggle with persistent state across page reloads.
- **Enterprise-Ready UX:** Includes loading indicators, empty states, confirmation dialogs, inline form validation, and responsive layouts for mobile (375px), tablet, and desktop.

---

## 🛠️ Technology Stack & AI Tooling

### Tech Stack
- **Framework:** React 18+ (Functional Components, Hooks, Context API)
- **Styling:** Tailwind CSS (Class-based dark mode, custom color palette)
- **Bundler:** Vite
- **Icons:** Lucide React
- **Data Visualization:** Recharts (Interactive Area & Bar Chart with gradients)

### AI Tools Utilized
- **AI Coding Agent:** Antigravity / Cursor / Claude Code (Architecture design, Context store implementation, component breakdown, and Git commit staging)
- **AI UI Assistance:** Inspired by clean modern design patterns from v0.dev and Lovable (glassmorphism cards, micro-interactions, responsive sidebars)

---

## 🖥️ Screen-by-Screen Feature Walkthrough

### 1. Login Page (`/src/components/screens/LoginScreen.jsx`)
- Email & password validation with inline error messaging.
- Format verification (RFC-compliant email pattern regex & minimum password length).
- Password visibility toggle (Show/Hide).
- "Autofill Demo Credentials" button for one-click testing (`alex.morgan@nexuscrm.io`).
- Redirects to Dashboard immediately upon submission.

### 2. Executive Dashboard (`/src/components/screens/DashboardScreen.jsx`)
- **4 Real-Time Summary Cards:**
  - **Total Customers:** Live count of all customer records.
  - **Active Customers:** Real-time count & ratio of active accounts.
  - **Inactive Customers:** Count & percentage of paused/churned accounts.
  - **New This Month:** Dynamic filter of customers registered in the current monthly cycle.
- **Interactive Acquisition Chart:** Area chart displaying customer signups across the last 6 months with custom gradients and hover tooltips.
- **Portfolio Health Breakdown:** Visual progress indicators showing contract health.
- **Recent Signups Preview:** Quick preview table with 1-click navigation to the full directory.

### 3. Customer Directory (`/src/components/screens/CustomerListScreen.jsx`)
- **Initial Dataset:** Seeded with 28 realistic customer profiles with names, companies, emails, avatars, and statuses.
- **Instant Search:** Real-time filtering by name, email, or company as the user types.
- **Status Filter:** Segment table by `All`, `Active`, or `Inactive` with counter badges.
- **Pagination:** 10 records per page with Previous/Next controls and page numbers.
- **Delete Confirmation Modal:** Custom dialog to prevent accidental deletions.
- **Empty State:** Friendly graphic and clear filters CTA when searches return 0 results.
- **Reset Seed Data:** Built-in button to restore the original 28 records at any time.

### 4. Add / Edit Customer Form (`/src/components/screens/CustomerFormModal.jsx`)
- Dedicated modal supporting both creation and updating of customer accounts.
- Field validation:
  - **Name:** Required (minimum 2 characters).
  - **Email:** Required with RFC email regex validation.
  - **Phone:** Required with standard phone pattern verification (minimum 10 digits).
  - **Company:** Required.
  - **Status:** Required (`Active` vs `Inactive`).
- Immediate propagation: Saving updates both the table and dashboard KPI statistics instantly.

### 5. Settings Page (`/src/components/screens/SettingsScreen.jsx`)
- **Dark Mode Switcher:** Dedicated theme selector cards and instant toggle button. Persisted in `localStorage` so choices stay active upon refresh.
- **Profile Management:** Editable Admin Name, Work Email, Job Role, Phone, Company, and Bio note with a visual confirmation toast upon save.
- **Mock Data Diagnostic:** Reset action to re-seed demo data.

---

## 📦 Getting Started (Local Setup)

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm or yarn

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd <REPOSITORY_FOLDER>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Open [http://localhost:5173](http://localhost:5173) in your web browser.

5. **Build for production (Optional):**
   ```bash
   npm run build
   ```

---

### 6. Autonomous AI Copilot Agent (`/src/components/copilot/CopilotDrawer.jsx`)
- **Interactive Drawer:** Floating action button with pulse indicator and expandable slide-over drawer.
- **Natural Language Tool Calling:**
  - `add_customer`: Parses name, company, email, phone, and status from natural language and adds directly to React state.
  - `delete_customer`: Removes customer by name or query.
  - `filter_customers`: Auto-navigates and switches status filters (`Active` vs `Inactive`).
  - `get_portfolio_summary`: Generates automated health briefings and churn risk analyses.
  - `draft_email`: Generates personalized customer outreach and re-engagement emails.
  - `toggle_theme`: Switches between Light and Dark mode.
- **Zero Configuration:** Works 100% out of the box in the browser without external API key requirements.

---

## 📦 Getting Started (Local Setup)

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm or yarn

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd <REPOSITORY_FOLDER>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Open [http://localhost:5173](http://localhost:5173) in your web browser.

5. **Build for production (Optional):**
   ```bash
   npm run build
   ```

---

## 📁 Project Architecture

```
├── public/                 # Static assets & icons
├── src/
│   ├── assets/             # Branding assets
│   ├── components/
│   │   ├── common/         # Reusable ConfirmDialog, Modals, Badges
│   │   ├── copilot/        # CopilotDrawer (Floating AI Assistant with Tool Execution)
│   │   ├── layout/         # AppLayout (Sidebar, Mobile Drawer, Header)
│   │   └── screens/
│   │       ├── LoginScreen.jsx
│   │       ├── DashboardScreen.jsx
│   │       ├── CustomerListScreen.jsx
│   │       ├── CustomerFormModal.jsx
│   │       └── SettingsScreen.jsx
│   ├── context/
│   │   └── AppContext.jsx  # Centralized React Context for Auth, Customers, Theme & Metrics
│   ├── data/
│   │   └── mockCustomers.js# 28 Seeded customer records
│   ├── services/
│   │   └── aiAgentService.js# AI Intent classification & tool execution engine
│   ├── App.jsx             # Main router and screen controller
│   ├── index.css           # Tailwind base styles and theme directives
│   └── main.jsx            # React root mount wrapped with AppProvider
├── tailwind.config.js      # Tailwind CSS configuration with class dark mode
├── vite.config.js          # Vite build config
└── README.md               # Project documentation
```

---

## 📜 Git Commit History

The project development was structured with incremental commits matching each screen completion requirement:

1. `ef4c098 feat(auth): implement login page with form validation and mock credentials`
2. `ff2e42f feat(dashboard): implement dashboard with 4 summary cards, growth chart, and layout`
3. `c25665a feat(customers): implement customer list table with search, status filters, pagination, and delete confirmation`
4. `e3f112d feat(customers): implement add and edit customer modal form with full validation`
5. `b3ff0e0 feat(settings): implement settings page with profile management and persistent dark mode`
6. `06cc7f9 docs: add comprehensive README with setup guide, architecture, and AI tool attribution`
7. `feat(ai-agent): implement autonomous AI Copilot drawer with tool calling and CRM actions`
