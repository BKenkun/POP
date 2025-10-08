
import { cn } from '@/lib/utils';
import React from 'react';

export const Logo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 -15 1100 170"
    className={cn('w-auto h-10', className)}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      {/* We can't import fonts directly in SVG, but next/font in the layout makes it available */}
      <style>
        {`
          .logo-text {
            font-family: var(--font-inter), sans-serif;
            font-size: 120px;
            font-weight: 900;
            text-anchor: middle;
            dominant-baseline: central;
            letter-spacing: -0.01em;
          }
          .logo-bg-stroke { stroke: hsl(var(--background)); }
          .logo-primary-fill { fill: hsl(var(--primary)); }
          .logo-primary-stroke { stroke: hsl(var(--primary)); }
          .logo-destructive-fill { fill: hsl(var(--destructive)); }
        `}
      </style>
    </defs>
    <g transform="skewX(-15) translate(40, 0)">
      {/* Layer 1: Sticker Outline (Thick White Stroke) */}
      <text
        x="500"
        y="85"
        className="logo-text fill-none logo-bg-stroke"
        strokeWidth="20"
        strokeLinejoin="round"
      >
        POPPER ONLINE
      </text>

      {/* Layer 2: 3D Extrusion (Yellow/Primary) - Positioned slightly offset for shadow */}
      <text x="502" y="87" className="logo-text logo-primary-fill">
        POPPER ONLINE
      </text>

       {/* Layer 3: Inner Stroke (Red/Destructive) - Positioned centrally */}
      <text
        x="500"
        y="85"
        className="logo-text fill-none logo-destructive-fill"
        strokeWidth="3"
        strokeLinejoin="miter"
      >
        POPPER ONLINE
      </text>

      {/* Layer 4: Main Text Fill (Red/Destructive) - Centered */}
      <text x="500" y="85" className="logo-text logo-destructive-fill">
        POPPER ONLINE
      </text>
    </g>
  </svg>
);
