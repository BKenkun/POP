import React from 'react';

export const Logo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 800 150"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');
          .logo-text {
            font-family: 'Anton', sans-serif;
            font-size: 100px;
            font-weight: 400;
            text-anchor: middle;
            dominant-baseline: central;
            letter-spacing: 0.05em;
          }
        `}
      </style>
    </defs>
    
    <g transform="rotate(-3 400 75)">
      {/* White Sticker Outline */}
      <text x="400" y="75" className="logo-text" fill="white" stroke="white" strokeWidth="14" strokeLinejoin="round">POPPER ESPAÑA</text>
      {/* Red 3D Extrusion */}
      <text x="400" y="75" className="logo-text" fill="#D9362D">POPPER ESPAÑA</text>
      {/* Yellow Top Text */}
      <text x="398" y="72" className="logo-text" fill="#FDCB3F">POPPER ESPAÑA</text>
      {/* Dark Red Inner Stroke */}
      <text x="398" y="72" className="logo-text" fill="none" stroke="#C12928" strokeWidth="2.5">POPPER ESPAÑA</text>
    </g>
  </svg>
);