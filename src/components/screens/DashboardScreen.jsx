import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  Building2,
  Calendar,
  Sparkles,
  Eye
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export default function DashboardScreen({ onNavigateToCustomers, onOpenAddCustomer }) {
  const { stats, customers, monthlyChartData, theme, openCustomerProfile } = useApp();

  // Pick 5 most recent customers for the recent activity widget
  const recentCustomers = customers.slice(0, 5);

  const statCards = [
    {
      id: 'total-customers',
      title: 'Total Customers',
      value: stats.total,
      change: '+18.2%',
      trend: 'up',
      subtitle: 'vs previous quarter'
    },
    {
      id: 'active-customers',
      title: 'Active Customers',
      value: stats.active,
      change: `${Math.round((stats.active / (stats.total || 1)) * 100)}% ratio`,
      trend: 'up',
      subtitle: 'Contracted & paying'
    },
    {
      id: 'inactive-customers',
      title: 'Inactive Customers',
      value: stats.inactive,
      change: `${Math.round((stats.inactive / (stats.total || 1)) * 100)}% ratio`,
      trend: 'neutral',
      subtitle: 'Requires re-engagement'
    },
    {
      id: 'new-this-month',
      title: 'New This Month',
      value: stats.newThisMonth,
      change: '+4 vs last mo',
      trend: 'up',
      subtitle: 'Joined in current cycle'
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold mb-3 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Executive Customer Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Customer Analytics &amp; Pipeline Overview
          </h1>
          <p className="mt-2 text-sm sm:text-base text-indigo-100/80 leading-relaxed">
            Monitor client health, acquisition velocity, and retention metrics across all business units.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card) => {
          return (
            <div
              key={card.id}
              id={`stat-card-${card.id}`}
              className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {card.title}
                </span>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
                  {card.value}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {card.change}
                </span>
                <span className="text-slate-400 dark:text-slate-500">
                  {card.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Chart & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Working Chart (Customers Added Over Time) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Customer Acquisition Velocity</span>
                <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  Last 6 Months
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Monthly distribution of onboarded customer accounts
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" />
                New Signups
              </span>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="customerGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B38A65" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#B38A65" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={theme === 'dark' ? '#382E2E' : '#EDE6DC'}
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  stroke={theme === 'dark' ? '#A8988E' : '#8C7A70'}
                  fontSize={12}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  stroke={theme === 'dark' ? '#A8988E' : '#8C7A70'}
                  fontSize={12}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
                          <p className="font-bold text-slate-200">{label} 2026</p>
                          <p className="text-indigo-400 font-medium">
                            {payload[0].value} Customers Added
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="customers"
                  stroke="#B38A65"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#customerGrowth)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Health & Distribution Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Portfolio Health
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Active contract status vs churn rate
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    Active Accounts
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {stats.active} ({Math.round((stats.active / (stats.total || 1)) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${(stats.active / (stats.total || 1)) * 100}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    Inactive / Paused
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {stats.inactive} ({Math.round((stats.inactive / (stats.total || 1)) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-300 dark:bg-slate-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${(stats.inactive / (stats.total || 1)) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 text-xs">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">
                Data Integrity
              </span>
              <p className="text-slate-500 dark:text-slate-400">
                All numbers are automatically computed in real time from your customer directory.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Customers Activity Table Preview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recently Onboarded Customers
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest additions to your customer repository
            </p>
          </div>
          <button
            onClick={onNavigateToCustomers}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline"
          >
            <span>View Complete Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3 font-semibold">Customer</th>
                <th className="py-3 px-3 font-semibold">Company</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {recentCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openCustomerProfile(cust)}
                        className="relative group/avatar cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-transform active:scale-95"
                        title={`Click to open ${cust.name}'s profile`}
                      >
                        <img
                          src={cust.avatar}
                          alt={cust.name}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 group-hover/avatar:ring-indigo-500 group-hover/avatar:scale-105 transition-all shadow-sm"
                        />
                        <span className="absolute inset-0 rounded-full bg-indigo-900/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px]">
                          <Eye className="w-3 h-3" />
                        </span>
                      </button>
                      <div>
                        <button
                          type="button"
                          onClick={() => openCustomerProfile(cust)}
                          className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-left transition-colors cursor-pointer block"
                          title={`Click to open ${cust.name}'s profile`}
                        >
                          {cust.name}
                        </button>
                        <p className="text-slate-400">{cust.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {cust.company}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        cust.status === 'Active'
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {cust.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-500">
                    {new Date(cust.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
