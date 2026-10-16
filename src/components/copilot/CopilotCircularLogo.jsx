import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

/**
 * Nexus Copilot Executive CRM AI Icon
 * Clean, modern, enterprise assistant aesthetic matching Oat Milk & Soft Latte palette.
 */
export default function CopilotCircularLogo({ size = 48, showStatus = false, className = '' }) {
  const iconSize = Math.max(14, Math.round(size * 0.46));
  const sparkSize = Math.max(8, Math.round(size * 0.22));

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl select-none transition-all ${className}`}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #B38A65 0%, #9C734E 100%)',
        boxShadow: '0 4px 14px rgba(179, 138, 101, 0.35)'
      }}
    >
      {/* Subtle clean inner highlight */}
      <div className="absolute inset-0.5 rounded-[14px] border border-white/25 pointer-events-none" />

      {/* Modern Executive CRM Bot Icon */}
      <div className="relative z-10 flex items-center justify-center text-white">
        <Bot style={{ width: iconSize, height: iconSize }} strokeWidth={2} />
      </div>

      {/* Tiny subtle Sparkle badge top-right inside */}
      <div className="absolute top-1 right-1 text-white/80 pointer-events-none">
        <Sparkles style={{ width: sparkSize, height: sparkSize }} />
      </div>

      {/* Active Online Status Dot */}
      {showStatus && (
        <span
          className="absolute -top-0.5 -right-0.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 shadow-sm z-20 pointer-events-none"
          style={{
            width: Math.max(9, Math.round(size * 0.22)),
            height: Math.max(9, Math.round(size * 0.22))
          }}
        />
      )}
    </div>
  );
}

