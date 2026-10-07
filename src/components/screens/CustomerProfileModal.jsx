import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Edit3,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ArrowRight
} from 'lucide-react';

export default function CustomerProfileModal({ onEditCustomer }) {
  const { profileCustomer, closeCustomerProfile, updateCustomer } = useApp();

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && profileCustomer) {
        closeCustomerProfile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [profileCustomer, closeCustomerProfile]);

  if (!profileCustomer) return null;

  const handleCopyEmail = () => {
    if (profileCustomer.email) {
      navigator.clipboard.writeText(profileCustomer.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleCopyPhone = () => {
    if (profileCustomer.phone) {
      navigator.clipboard.writeText(profileCustomer.phone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const handleToggleStatus = () => {
    const nextStatus = profileCustomer.status === 'Active' ? 'Inactive' : 'Active';
    updateCustomer(profileCustomer.id, { status: nextStatus });
    // Also update local view in profileCustomer
    profileCustomer.status = nextStatus;
  };

  const handleEditClick = () => {
    const target = { ...profileCustomer };
    closeCustomerProfile();
    if (typeof onEditCustomer === 'function') {
      onEditCustomer(target);
    }
  };

  const formattedDate = new Date(profileCustomer.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const isActive = profileCustomer.status === 'Active';

  return (
    <div
      id="customer-profile-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in"
      onClick={closeCustomerProfile}
    >
      <div
        id="customer-profile-modal"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl shadow-indigo-950/30 overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Banner */}
        <div className="relative h-28 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-4 flex justify-between items-start">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Customer Profile</span>
          </div>

          <button
            id="close-profile-modal-btn"
            onClick={closeCustomerProfile}
            className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            title="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Header (Avatar + Identity) */}
        <div className="px-6 pt-0 pb-5">
          <div className="relative flex justify-between items-end -mt-12 mb-3">
            {/* Large Avatar Photo */}
            <div className="relative">
              <img
                src={profileCustomer.avatar}
                alt={profileCustomer.name}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl bg-slate-100 dark:bg-slate-800"
              />
              <span
                className={`absolute bottom-1 right-1 w-4 h-4 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                  isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
                title={isActive ? 'Active Client' : 'Inactive Client'}
              />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleStatus}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isActive
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                }`}
              >
                {isActive ? 'Mark Inactive' : 'Mark Active'}
              </button>

              <button
                type="button"
                onClick={handleEditClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
          </div>

          {/* Name & Basic Info */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {profileCustomer.name}
              </h2>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
                }`}
              >
                {isActive ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-amber-500" />
                )}
                {profileCustomer.status}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                <Building className="w-3.5 h-3.5 text-indigo-500" />
                <span>{profileCustomer.company}</span>
              </div>
              <span>•</span>
              <span className="font-mono text-[11px] text-slate-400">
                ID: {profileCustomer.id}
              </span>
            </div>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-3 gap-2.5 my-4">
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
              <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Status
              </span>
              <span className={`text-xs font-bold ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {profileCustomer.status}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
              <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Client Tier
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Enterprise
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
              <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Onboarded
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {new Date(profileCustomer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Contact Coordinates
            </h3>

            {/* Email Row */}
            <div className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Verified Email</p>
                  <a
                    href={`mailto:${profileCustomer.email}`}
                    className="font-medium text-slate-900 dark:text-white hover:text-indigo-600 transition-colors"
                  >
                    {profileCustomer.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors"
                  title="Copy email"
                >
                  {copiedEmail ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Phone Row */}
            <div className="flex items-center justify-between text-xs py-1 border-t border-slate-200/60 dark:border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Direct Phone</p>
                  <a
                    href={`tel:${profileCustomer.phone}`}
                    className="font-medium text-slate-900 dark:text-white hover:text-indigo-600 transition-colors"
                  >
                    {profileCustomer.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors"
                  title="Copy phone"
                >
                  {copiedPhone ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Joined Date Row */}
            <div className="flex items-center justify-between text-xs py-1 border-t border-slate-200/60 dark:border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Onboarding Record</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {formattedDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Health Context Note */}
          <div className="mt-3.5 p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-indigo-900 dark:text-indigo-200">
              <span className="font-bold">Account Context: </span>
              {isActive
                ? `${profileCustomer.name} is actively contracted with ${profileCustomer.company} with ongoing commercial service.`
                : `${profileCustomer.name}'s account is currently inactive. Consider drafting a re-engagement outreach email.`}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            NexusCRM Client Profile
          </span>

          <button
            type="button"
            onClick={closeCustomerProfile}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
