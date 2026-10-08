import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  ShieldCheck,
  Plus,
  Bell,
  Sparkles
} from 'lucide-react';

export default function AppLayout({ children, onOpenAddCustomer }) {
  const {
    user,
    profile,
    logout,
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    stats,
    openDirectorProfile
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'customers',
      label: 'Customer Directory',
      icon: Users,
      badge: stats.total
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null
    }
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-offwhite dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
            Nexus<span className="text-indigo-600 dark:text-indigo-400">CRM</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 p-5 shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                    Nexus<span className="text-indigo-600 dark:text-indigo-400">CRM</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <nav className="mt-6 space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== null && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer / User */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openDirectorProfile();
                }}
                className="flex items-center gap-3 w-full text-left p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                title="Click to view Operations Director profile"
              >
                <div className="relative shrink-0">
                  <img
                    src={user?.avatar || profile?.avatar}
                    alt={user?.name || profile?.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/40 group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                </div>
                <div className="truncate flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {user?.name || profile?.name}
                  </p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate">
                    {user?.role || profile?.role || 'Operations Director'}
                  </p>
                </div>
              </button>

              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 border-r border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shrink-0 h-screen sticky top-0 justify-between p-5">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Nexus<span className="text-indigo-600 dark:text-indigo-400">CRM</span>
              </span>
              <span className="block text-[10px] uppercase tracking-widest font-semibold text-slate-400 dark:text-slate-500">
                Enterprise Cloud
              </span>
            </div>
          </div>

          {/* Quick Action Button */}
          {onOpenAddCustomer && (
            <button
              onClick={onOpenAddCustomer}
              className="w-full mb-6 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Customer</span>
            </button>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1">
              Main Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}-btn`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Controls */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          {/* Dark / Light Mode Switcher */}
          <button
            onClick={toggleTheme}
            id="sidebar-theme-toggle-btn"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
              <span>{theme === 'dark' ? 'Light Appearance' : 'Dark Appearance'}</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
              {theme}
            </span>
          </button>

          {/* User Profile Info & Logout */}
          <div className="flex items-center justify-between px-2 py-1.5">
            <button
              type="button"
              onClick={openDirectorProfile}
              id="sidebar-director-profile-btn"
              className="flex items-center gap-2.5 min-w-0 text-left p-1 -m-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Click to view Operations Director profile"
            >
              <div className="relative shrink-0">
                <img
                  src={user?.avatar || profile?.avatar}
                  alt={user?.name || profile?.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/30 group-hover:ring-indigo-500 group-hover:scale-105 transition-all shadow-sm"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {user?.name || profile?.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  {user?.role || profile?.role || 'Operations Director'}
                </p>
              </div>
            </button>

            <button
              onClick={logout}
              id="sidebar-logout-btn"
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0 ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        {/* Top Desktop Bar */}
        <div className="hidden md:flex items-center justify-between px-8 py-4 border-b border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md sticky top-0 z-30">
          <div>
            <h2 className="text-base font-bold capitalize text-slate-900 dark:text-white">
              {activeTab === 'dashboard'
                ? 'Executive Dashboard'
                : activeTab === 'customers'
                ? 'Customer Directory'
                : 'Account Settings'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeTab === 'dashboard'
                ? 'Live overview of customer pipeline and growth metrics'
                : activeTab === 'customers'
                ? 'Manage, search, and update client records'
                : 'Manage system preferences, profile, and theme'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onOpenAddCustomer && activeTab !== 'customers' && (
              <button
                onClick={onOpenAddCustomer}
                className="flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Customer</span>
              </button>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live System</span>
            </div>

            {/* Clickable Operations Director Profile Chip */}
            <button
              type="button"
              onClick={openDirectorProfile}
              id="topbar-director-profile-btn"
              className="flex items-center gap-2 py-1 pl-1.5 pr-2.5 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer group"
              title="Click to view Operations Director profile"
            >
              <div className="relative">
                <img
                  src={user?.avatar || profile?.avatar}
                  alt={user?.name || profile?.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-indigo-500/40 group-hover:scale-105 transition-transform"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-slate-900 animate-pulse" />
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                  {user?.name || profile?.name}
                </p>
                <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">
                  {user?.role || profile?.role || 'Operations Director'}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Page Inner Content */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
