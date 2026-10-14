import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { checkBackendHealth } from '../../services/apiClient';
import {
  User,
  Mail,
  Phone,
  Building,
  Moon,
  Sun,
  Shield,
  Save,
  CheckCircle2,
  Sparkles,
  Palette,
  Bell,
  RefreshCw,
  Sliders,
  Server,
  Database,
  Activity,
  Wifi
} from 'lucide-react';

export default function SettingsScreen() {
  const {
    profile,
    updateProfile,
    theme,
    toggleTheme,
    resetCustomers,
    customers,
    isBackendConnected,
    isSyncing,
    refreshFromBackend
  } = useApp();

  const [pingStatus, setPingStatus] = useState(null);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  const [formData, setFormData] = useState({
    name: profile.name || '',
    email: profile.email || '',
    role: profile.role || '',
    phone: profile.phone || '',
    company: profile.company || '',
    bio: profile.bio || ''
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [dataResetSuccess, setDataResetSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  const handleResetData = async () => {
    await resetCustomers();
    setDataResetSuccess(true);
    setTimeout(() => {
      setDataResetSuccess(false);
    }, 3000);
  };

  const handlePingBackend = async () => {
    setPingStatus('checking');
    const t0 = performance.now();
    try {
      const ok = await checkBackendHealth();
      const latency = Math.round(performance.now() - t0);
      if (ok) {
        setPingStatus({ ok: true, latency });
      } else {
        setPingStatus({ ok: false, error: 'Offline / Bad status' });
      }
    } catch (err) {
      setPingStatus({ ok: false, error: err.message || 'Connection failed' });
    }
    setTimeout(() => setPingStatus(null), 6000);
  };

  const handleForceSync = async () => {
    setSyncStatusMsg('Syncing with SQLite...');
    try {
      const res = await refreshFromBackend();
      if (res) {
        setSyncStatusMsg(`Synced ${res.length} customers from SQLite!`);
      } else {
        setSyncStatusMsg('Sync failed or offline');
      }
    } catch {
      setSyncStatusMsg('Error syncing with backend');
    }
    setTimeout(() => setSyncStatusMsg(''), 4000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Settings Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          System &amp; Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your appearance theme, workspace profile, and data preferences
        </p>
      </div>

      {/* 1. Appearance / Dark Mode Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Interface Theme &amp; Appearance
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select your preferred aesthetic. Your choice is automatically persisted across sessions.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Light Theme Option Card */}
          <button
            type="button"
            id="theme-select-light-btn"
            onClick={() => {
              if (theme === 'dark') toggleTheme();
            }}
            className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all ${
              theme === 'light'
                ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20 shadow-md'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Light Theme
                </span>
                {theme === 'light' && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Clean daylight palette with crisp slate backgrounds and soft borders.
              </p>
            </div>
          </button>

          {/* Dark Theme Option Card */}
          <button
            type="button"
            id="theme-select-dark-btn"
            onClick={() => {
              if (theme === 'light') toggleTheme();
            }}
            className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all ${
              theme === 'dark'
                ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/20 shadow-md'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-900/60 text-indigo-400 flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Dark Theme
                </span>
                {theme === 'dark' && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Sleek obsidian night view with reduced eye strain and neon contrast.
              </p>
            </div>
          </button>
        </div>

        {/* Quick Toggle switch row */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Current active mode:
            </span>
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
              {theme}
            </span>
          </div>

          <button
            type="button"
            id="toggle-theme-switch-btn"
            onClick={toggleTheme}
            className="flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            <span>Toggle to {theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </div>

      {/* 2. Profile Details Form Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Admin Profile &amp; Identity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update your personal name, contact channel, and organizational role.
              </p>
            </div>
          </div>

          {savedSuccess && (
            <span
              id="profile-saved-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 animate-fade-in"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Settings Saved
            </span>
          )}
        </div>

        {/* Profile Avatar Card */}
        <div className="my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-14 h-14 rounded-full object-cover ring-4 ring-indigo-500/20"
          />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {profile.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {profile.role} • {profile.company}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="settings-name-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
              >
                Full Name
              </label>
              <input
                id="settings-name-input"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Work Email */}
            <div>
              <label
                htmlFor="settings-email-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
              >
                Work Email
              </label>
              <input
                id="settings-email-input"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Role Title */}
            <div>
              <label
                htmlFor="settings-role-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
              >
                Job Title / Role
              </label>
              <input
                id="settings-role-input"
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Direct Phone */}
            <div>
              <label
                htmlFor="settings-phone-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
              >
                Direct Phone
              </label>
              <input
                id="settings-phone-input"
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Bio / Operational Note */}
          <div>
            <label
              htmlFor="settings-bio-input"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
            >
              Operational Focus / Bio
            </label>
            <textarea
              id="settings-bio-input"
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end">
            <button
              type="submit"
              id="save-profile-btn"
              className="flex items-center gap-2 py-2.5 px-6 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 active:scale-[0.98] transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. FastAPI & SQLite Infrastructure Diagnostics */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  FastAPI &amp; SQLite Infrastructure
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isBackendConnected
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  {isBackendConnected ? 'Connected (Port 8001)' : 'Offline / Local Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Persistent full-stack architecture connecting React via Vite proxy to Python FastAPI and SQLite database.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              id="ping-fastapi-btn"
              onClick={handlePingBackend}
              disabled={pingStatus === 'checking'}
              className="py-2 px-3.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800/60 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Activity className={`w-3.5 h-3.5 ${pingStatus === 'checking' ? 'animate-spin' : ''}`} />
              <span>
                {pingStatus === 'checking'
                  ? 'Pinging...'
                  : pingStatus?.ok
                  ? `Active (${pingStatus.latency}ms)`
                  : 'Ping FastAPI'}
              </span>
            </button>

            <button
              type="button"
              id="sync-sqlite-btn"
              onClick={handleForceSync}
              disabled={isSyncing}
              className="py-2 px-3.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Force Sync</span>
            </button>
          </div>
        </div>

        {/* Sync message if present */}
        {syncStatusMsg && (
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{syncStatusMsg}</span>
          </div>
        )}

        {/* Diagnostic Metadata Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Backend Service
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Server className="w-3.5 h-3.5 text-indigo-500" />
              <span>FastAPI 1.0.0 (Uvicorn)</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Proxied via /api to 127.0.0.1:8001</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Database Engine
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span>SQLite (crm.db)</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{customers.length} records currently in memory</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              AI Copilot Endpoint
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>/api/copilot/chat</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Stores messages in copilot_chats table</span>
          </div>
        </div>
      </div>

      {/* 4. Data Diagnostics & Reset */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Mock Data Management
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reset or restore the original 28 seeded customer profiles in local storage.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="reset-mock-dataset-btn"
            onClick={handleResetData}
            className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            {dataResetSuccess ? 'Restored Initial 28 Records!' : 'Reset Seed Customers'}
          </button>
        </div>
      </div>
    </div>
  );
}
