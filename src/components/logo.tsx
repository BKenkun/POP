import { cn } from '@/lib/utils';
import React from 'react';

export const Logo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 -15 1000 170"
    className={cn('w-auto h-8', className)}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@900&display=swap');
          .logo-text {
            font-family: 'Inter', sans-serif;
            font-size: 120px;
            font-weight: 900;
            text-anchor: middle;
            dominant-baseline: central;
            letter-spacing: -0.01em;
          }
          .logo-bg-stroke { stroke: hsl(var(--background)); }
          .logo-accent-fill { fill: hsl(var(--accent)); }
          .logo-primary-stroke { stroke: hsl(var(--primary)); }
          .logo-accent-stroke { stroke: hsl(var(--accent)); }
        `}
      </style>
    </defs>
    <g transform="skewX(-15) translate(20, 0)">
      {/* Layer 1: Sticker Outline (Thick White Stroke) */}
      <text
        x="500"
        y="85"
        className="logo-text fill-none logo-bg-stroke"
        strokeWidth="20"
        strokeLinejoin="round"
      >
        POPPER ESPAÑA
      </text>

      {/* Layer 2: 3D Extrusion (Red/Accent) - Positioned slightly offset for shadow */}
      <text x="502" y="87" className="logo-text logo-accent-fill">
        POPPER ESPAÑA
      </text>

       {/* Layer 3: Inner Stroke (Yellow/Primary) - Positioned centrally */}
      <text
        x="500"
        y="85"
        className="logo-text fill-none logo-primary-stroke"
        strokeWidth="3"
        strokeLinejoin="miter"
      >
        POPPER ESPAÑA
      </text>

      {/* Layer 4: Main Text Fill (Red/Accent) - Centered */}
      <text x="500" y="85" className="logo-text logo-accent-fill">
        POPPER ESPAÑA
      </text>
    </g>
  </svg>
);
