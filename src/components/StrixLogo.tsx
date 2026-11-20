import React from 'react';

interface StrixLogoProps {
  className?: string;
}

/**
 * Authentic Floating QR Code Matrix Mark (Standalone icon for Favicon & compact avatars)
 * - 3 classical 2D optical finder patterns (white rounded borders with electric cyan inner dots)
 * - Authentic matrix data modules in alternating electric cyan and crisp white
 */
export const StrixLogoMark: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 select-none`}
      aria-label="Strix QR Mark"
    >
      <defs>
        <linearGradient id="sq-cyan-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>

      {/* Top-Left Finder Eye */}
      <rect x="1" y="1" width="12" height="12" rx="3" stroke="#ffffff" strokeWidth="2" fill="none" />
      <rect x="4.5" y="4.5" width="5" height="5" rx="1.2" fill="#38bdf8" />

      {/* Top-Right Finder Eye */}
      <rect x="23" y="1" width="12" height="12" rx="3" stroke="#ffffff" strokeWidth="2" fill="none" />
      <rect x="26.5" y="4.5" width="5" height="5" rx="1.2" fill="#38bdf8" />

      {/* Bottom-Left Finder Eye */}
      <rect x="1" y="23" width="12" height="12" rx="3" stroke="#ffffff" strokeWidth="2" fill="none" />
      <rect x="4.5" y="26.5" width="5" height="5" rx="1.2" fill="#38bdf8" />

      {/* QR Data Modules / Matrix Nodes */}
      <rect x="16" y="2" width="4" height="4" rx="1" fill="#38bdf8" />
      <rect x="16" y="9" width="4" height="4" rx="1" fill="#ffffff" fillOpacity="0.9" />
      <rect x="2" y="16" width="4" height="4" rx="1" fill="#ffffff" fillOpacity="0.9" />
      <rect x="9" y="16" width="4" height="4" rx="1" fill="#38bdf8" />
      <rect x="16" y="16" width="4" height="4" rx="1" fill="#ffffff" />

      {/* 4th Quadrant Modules */}
      <rect x="23" y="16" width="4" height="4" rx="1" fill="#ffffff" fillOpacity="0.8" />
      <rect x="30" y="16" width="4" height="4" rx="1" fill="#38bdf8" />
      <rect x="16" y="23" width="4" height="4" rx="1" fill="#38bdf8" />
      <rect x="16" y="30" width="4" height="4" rx="1" fill="#ffffff" fillOpacity="0.9" />
      <rect x="23" y="23" width="5" height="5" rx="1.2" fill="#ffffff" />
      <rect x="30" y="23" width="5" height="5" rx="1.2" fill="#38bdf8" />
      <rect x="23" y="30" width="5" height="5" rx="1.2" fill="#38bdf8" />
      <rect x="30" y="30" width="5" height="5" rx="1.2" fill="#ffffff" />
    </svg>
  );
};

/**
 * Official Strix QR Brand Mark (Viewfinder Edition)
 * - Left: Precision 2D vector QR matrix
 * - Center: High-contrast bold "STRIX" brand typography
 * - Right: Targeting optical viewfinder bracket reticle framing "QR" in cyan glow
 */
export const StrixLogo: React.FC<StrixLogoProps> = ({ className = 'h-8.5 w-auto' }) => {
  return (
    <svg
      viewBox="0 0 170 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none`}
      role="img"
      aria-label="Strix QR"
    >
      <defs>
        <linearGradient id="sq-cyan-lockup" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>

      {/* Authentic QR Symbol (Left) */}
      <g transform="translate(0, 1)">
        {/* Top-Left Eye */}
        <rect x="1" y="1" width="12" height="12" rx="3" stroke="#ffffff" strokeWidth="2" fill="none" />
        <rect x="4.5" y="4.5" width="5" height="5" rx="1.2" fill="#38bdf8" />

        {/* Top-Right Eye */}
        <rect x="23" y="1" width="12" height="12" rx="3" stroke="#ffffff" strokeWidth="2" fill="none" />
        <rect x="26.5" y="4.5" width="5" height="5" rx="1.2" fill="#38bdf8" />

        {/* Bottom-Left Eye */}
        <rect x="1" y="23" width="12" height="12" rx="3" stroke="#ffffff" strokeWidth="2" fill="none" />
        <rect x="4.5" y="26.5" width="5" height="5" rx="1.2" fill="#38bdf8" />

        {/* QR Data Modules / Matrix Nodes */}
        <rect x="16" y="2" width="4" height="4" rx="1" fill="#38bdf8" />
        <rect x="16" y="9" width="4" height="4" rx="1" fill="#ffffff" fillOpacity="0.9" />
        <rect x="2" y="16" width="4" height="4" rx="1" fill="#ffffff" fillOpacity="0.9" />
        <rect x="9" y="16" width="4" height="4" rx="1" fill="#38bdf8" />
        <rect x="16" y="16" width="4" height="4" rx="1" fill="#ffffff" />

        {/* 4th quadrant modules */}
        <rect x="23" y="16" width="4" height="4" rx="1" fill="#ffffff" fillOpacity="0.8" />
        <rect x="30" y="16" width="4" height="4" rx="1" fill="#38bdf8" />
        <rect x="16" y="23" width="4" height="4" rx="1" fill="#38bdf8" />
        <rect x="16" y="30" width="4" height="4" rx="1" fill="#ffffff" fillOpacity="0.9" />
        <rect x="23" y="23" width="5" height="5" rx="1.2" fill="#ffffff" />
        <rect x="30" y="23" width="5" height="5" rx="1.2" fill="#38bdf8" />
        <rect x="23" y="30" width="5" height="5" rx="1.2" fill="#38bdf8" />
        <rect x="30" y="30" width="5" height="5" rx="1.2" fill="#ffffff" />
      </g>

      {/* Brand Typography (STRIX) */}
      <text
        x="48"
        y="26.5"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontWeight="900"
        fontSize="20"
        fill="#ffffff"
        letterSpacing="0.8"
      >
        STRIX
      </text>

      {/* QR Optical Viewfinder Reticle Tag [ QR ] */}
      <g transform="translate(122, 5.5)">
        {/* Reticle Corner Brackets */}
        <path d="M0 6 V2 H4" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M38 6 V2 H34" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M0 20 V24 H4" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M38 20 V24 H34" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Reticle Interior Glass Badge */}
        <rect x="3" y="3" width="32" height="20" rx="4" fill="url(#sq-cyan-lockup)" fillOpacity="0.18" />
        <text
          x="19"
          y="18"
          textAnchor="middle"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontSize="14"
          fill="#38bdf8"
          letterSpacing="1"
        >
          QR
        </text>
      </g>
    </svg>
  );
};
