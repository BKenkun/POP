
import React from 'react';

export const Logo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 450 200"
    className={className}
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
            letter-spacing: 0.025em;
          }
        `}
      </style>
    </defs>
    
    <g transform="rotate(-5 225 100)">
      {/* --- POPPER --- */}
      <g>
        {/* White Outline */}
        <text x="225" y="65" className="logo-text" fill="white" stroke="white" strokeWidth="12" strokeLinejoin="round">POPPER</text>
        {/* Red 3D Extrusion */}
        <text x="225" y="65" className="logo-text" fill="#D9362D">POPPER</text>
        {/* Yellow Top Text */}
        <text x="220" y="60" className="logo-text" fill="#FDCB3F">POPPER</text>
        {/* Dark Red Inner Stroke */}
        <text x="220" y="60" className="logo-text" fill="none" stroke="#C12928" strokeWidth="2">POPPER</text>
      </g>

      {/* --- ESPAÑA --- */}
      <g>
        {/* White Outline */}
        <text x="225" y="145" className="logo-text" fill="white" stroke="white" strokeWidth="12" strokeLinejoin="round">ESPAÑA</text>
        {/* Red 3D Extrusion */}
        <text x="225" y="145" className="logo-text" fill="#D9362D">ESPAÑA</text>
        {/* Yellow Top Text */}
        <text x="220" y="140" className="logo-text" fill="#FDCB3F">ESPAÑA</text>
         {/* Dark Red Inner Stroke */}
        <text x="220" y="140" className="logo-text" fill="none" stroke="#C12928" strokeWidth="2">ESPAÑA</text>
      </g>
    </g>
  </svg>
);
