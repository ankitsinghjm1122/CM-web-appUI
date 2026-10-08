import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  User,
  Mail,
  Phone,
  Building,
  ShieldCheck,
  Award,
  Calendar,
  Check,
  Copy,
  Settings,
  Sparkles,
  ExternalLink,
  Crown
} from 'lucide-react';

export default function OperationsDirectorModal() {
  const {
    isDirectorProfileOpen,
    closeDirectorProfile,
    user,
    profile,
    setActiveTab,
    stats
  } = useApp();

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isDirectorProfileOpen) {
        closeDirectorProfile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirectorProfileOpen, closeDirectorProfile]);

  if (!isDirectorProfileOpen) return null;

  const currentName = user?.name || profile?.name || 'Alex Morgan';
  const currentEmail = user?.email || profile?.email || 'alex.morgan@nexuscrm.io';
  const currentRole = user?.role || profile?.role || 'Operations Director';
  const currentPhone = profile?.phone || '+1 (555) 019-2834';
  const currentCompany = profile?.company || 'Nexus Global Technologies';
  const currentAvatar = user?.avatar || profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
  const currentBio = profile?.bio || 'Leading customer growth, onboarding workflows, and operational efficiency across all client accounts.';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(currentEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(currentPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleGoToSettings = () => {
    closeDirectorProfile();
    setActiveTab('settings');
  };

  return (
    <div
      id="director-profile-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md animate-fade-in"
      onClick={closeDirectorProfile}
    >
      <div
        id="director-profile-modal"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl shadow-indigo-950/30 overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Banner */}
        <div className="relative h-28 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 p-4 flex justify-between items-start">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[11px] font-semibold">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>Executive Profile • {currentRole}</span>
          </div>

          <button
            id="close-director-profile-btn"
            onClick={closeDirectorProfile}
            className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            title="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="px-6 pt-0 pb-6">
          {/* Avatar and Quick Controls */}
          <div className="relative flex justify-between items-end -mt-12 mb-3">
            <div className="relative">
              <img
                src={currentAvatar}
                alt={currentName}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl bg-slate-100 dark:bg-slate-800"
              />
              <span
                className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse"
                title="Active Session"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGoToSettings}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Account Settings</span>
              </button>
            </div>
          </div>

          {/* Name & Title */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {currentName}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                <ShieldCheck className="w-3 h-3 text-indigo-500" />
                Superadmin
              </span>
            </div>

            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
              {currentRole} • {currentCompany}
            </p>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {currentBio}
            </p>
          </div>

          {/* 3 Metric Pills */}
          <div className="grid grid-cols-3 gap-2.5 my-4">
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
              <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                System Role
              </span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Director
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
              <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Accounts
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {stats.total} Managed
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
              <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Access Level
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Full Control
              </span>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Operational Coordinates
            </h3>

            {/* Email */}
            <div className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Executive Email</p>
                  <a
                    href={`mailto:${currentEmail}`}
                    className="font-medium text-slate-900 dark:text-white hover:text-indigo-600 transition-colors"
                  >
                    {currentEmail}
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Copy Email"
              >
                {copiedEmail ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between text-xs py-1 border-t border-slate-200/60 dark:border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Direct Line</p>
                  <a
                    href={`tel:${currentPhone}`}
                    className="font-medium text-slate-900 dark:text-white hover:text-indigo-600 transition-colors"
                  >
                    {currentPhone}
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyPhone}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Copy Phone"
              >
                {copiedPhone ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Organization */}
            <div className="flex items-center justify-between text-xs py-1 border-t border-slate-200/60 dark:border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Building className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Department</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Operations &amp; Customer Success
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            NexusCRM Administrator Profile
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGoToSettings}
              className="px-3.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-xs font-semibold transition-colors cursor-pointer"
            >
              Edit in Settings
            </button>
            <button
              type="button"
              onClick={closeDirectorProfile}
              className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
