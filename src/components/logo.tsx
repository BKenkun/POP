import { cn } from '@/lib/utils';
import React from 'react';

export const Logo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 800 450"
    className={cn("w-auto h-16", className)}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');
          .logo-text {
            font-family: 'Anton', sans-serif;
            font-size: 150px;
            font-weight: 400;
            text-anchor: middle;
            dominant-baseline: central;
            letter-spacing: 0.02em;
          }
        `}
      </style>
    </defs>

    <g transform="skewX(-10) translate(20, 0)">
       {/* Layer 1: Sticker Outline (Thick White Stroke) */}
      <text 
          x="400" 
          y="155" 
          className="logo-text fill-none"
          stroke="white"
          strokeWidth="40"
          strokeLinejoin="round"
      >
        POPPER
      </text>
      <text 
          x="400" 
          y="315" 
          className="logo-text fill-none"
          stroke="white"
          strokeWidth="40"
          strokeLinejoin="round"
      >
        ESPAÑA
      </text>

      {/* Layer 2: 3D Extrusion (Red) */}
      <text 
          x="405" 
          y="160" 
          className="logo-text fill-[#c9302c]"
      >
        POPPER
      </text>
      <text 
          x="405" 
          y="320" 
          className="logo-text fill-[#c9302c]"
      >
        ESPAÑA
      </text>
      
      {/* Layer 3: Main Text Fill (Yellow) with Red Outline */}
      <text 
          x="400" 
          y="155" 
          className="logo-text fill-[#f0ad4e]"
          stroke="#c9302c"
          strokeWidth="5"
          strokeLinejoin="miter"
      >
        POPPER
      </text>
      <text 
          x="400" 
          y="315" 
          className="logo-text fill-[#f0ad4e]"
          stroke="#c9302c"
          strokeWidth="5"
          strokeLinejoin="miter"
      >
        ESPAÑA
      </text>
    </g>
  </svg>
);