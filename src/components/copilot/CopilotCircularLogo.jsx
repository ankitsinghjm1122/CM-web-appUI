import React, { useId } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Nexus Copilot Circular Icon Pattern
 * Precision-crafted concentric circles, orbital tracks, and core luminescence.
 */
export default function CopilotCircularLogo({ size = 48, showStatus = false, className = '' }) {
  const uniqueId = useId().replace(/:/g, '');
  const gradId = `copilot-grad-${uniqueId}`;
  const radialId = `copilot-radial-${uniqueId}`;
  const iconSize = Math.max(14, Math.round(size * 0.44));

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer ambient glow ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-violet-600 blur-[3px] opacity-75 animate-pulse-ring pointer-events-none" />

      {/* SVG Geometric Circular Pattern */}
      <svg
        className="absolute inset-0 w-full h-full rounded-full pointer-events-none"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#D946EF" />
          </linearGradient>
          <radialGradient id={radialId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="65%" stopColor="#3730A3" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </radialGradient>
        </defs>

        {/* 1. Outermost subtle circular guide */}
        <circle
          cx="50"
          cy="50"
          r="48"
          stroke={`url(#${gradId})`}
          strokeWidth="1.2"
          strokeOpacity="0.8"
        />

        {/* 2. Outer Orbital Dashed Circle (Clockwise slow spin) */}
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="#C7D2FE"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          strokeOpacity="0.75"
          className="animate-spin-slow origin-center"
        />

        {/* 3. Inner Counter-spinning dotted circular ring */}
        <circle
          cx="50"
          cy="50"
          r="35"
          stroke="#E0E7FF"
          strokeWidth="1"
          strokeDasharray="2 3"
          strokeOpacity="0.5"
          className="animate-spin-reverse origin-center"
        />

        {/* 4. Core Solid Circular Disc */}
        <circle
          cx="50"
          cy="50"
          r="29"
          fill={`url(#${radialId})`}
          stroke="#818CF8"
          strokeWidth="1"
          strokeOpacity="0.9"
        />

        {/* 5. Concentric micro-ring inside core */}
        <circle
          cx="50"
          cy="50"
          r="23"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="0.8"
        />

        {/* 6. Geometric Cardinal Dots on the Circular Pattern */}
        <circle cx="50" cy="8" r="1.5" fill="#FCD34D" />
        <circle cx="92" cy="50" r="1.5" fill="#818CF8" />
        <circle cx="50" cy="92" r="1.5" fill="#FCD34D" />
        <circle cx="8" cy="50" r="1.5" fill="#818CF8" />
      </svg>

      {/* Center AI Luminary Sparkles Motif */}
      <div className="relative z-10 flex items-center justify-center text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.7)] pointer-events-none">
        <Sparkles style={{ width: iconSize, height: iconSize }} />
      </div>

      {/* Active Online Status Dot */}
      {showStatus && (
        <span
          className="absolute top-0 right-0 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse shadow-md z-20 pointer-events-none"
          style={{ width: Math.max(8, Math.round(size * 0.22)), height: Math.max(8, Math.round(size * 0.22)) }}
        />
      )}
    </div>
  );
}
