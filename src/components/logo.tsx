
import React from 'react';

export const Logo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 400 60"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
        `}
      </style>
    </defs>

    {/* Text "POPPER ESPAÑA" */}
    <g style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '48px', fontWeight: 'bold', letterSpacing: '0.05em' }}>
      {/* White Shadow/Stroke */}
      <text x="10" y="45" fill="white" stroke="white" strokeWidth="2" strokeLinejoin="round">POPPER ESPAÑA</text>
      {/* Red Main Text */}
      <text x="10" y="45" fill="#c9302c">POPPER ESPAÑA</text>
    </g>
  </svg>
);
