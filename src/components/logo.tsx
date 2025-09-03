import { cn } from '@/lib/utils';
import React from 'react';

export const Logo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 800 150"
    className={cn("w-auto h-10", className)}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');
          .logo-text {
            font-family: 'Anton', sans-serif;
            font-size: 80px;
            font-weight: 400;
            text-anchor: middle;
            dominant-baseline: central;
            letter-spacing: 0.05em;
          }
        `}
      </style>
    </defs>
    
    <rect width="800" height="150" className="fill-white" />
    
    {/* Group for hover effect */}
    <g className="group">
        {/* Stroke - Changes on hover */}
        <text 
            x="400" 
            y="75" 
            className="logo-text fill-transparent stroke-red-600 group-hover:stroke-yellow-400" 
            strokeWidth="3"
        >
            POPPER ESPAÑA
        </text>
        {/* Fill - Changes on hover */}
        <text 
            x="400" 
            y="75" 
            className="logo-text fill-yellow-400 group-hover:fill-red-600"
        >
            POPPER ESPAÑA
        </text>
    </g>
  </svg>
);