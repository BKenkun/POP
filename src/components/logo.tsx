
import React from 'react';

export const Logo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 280 120"
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

    {/* Bottle */}
    <g transform="translate(90 -5)">
        {/* Bottle Body Red */}
        <path d="M40,50 L45,40 L95,40 L100,50 Z" fill="#d9534f" />
        <path d="M45,40 L50,30 L90,30 L95,40 Z" fill="#c9302c" />
        <path d="M50,30 L55,20 L85,20 L90,30 Z" fill="#d9534f" />

        {/* Bottle Cap */}
        <path d="M58,20 L58,10 L82,10 L82,20 Z" fill="#c9302c" />
         {/* Cap lines */}
        <g stroke="#F7DC6F" strokeWidth="1.5">
            <line x1="60" y1="12" x2="60" y2="18" />
            <line x1="63" y1="12" x2="63" y2="18" />
            <line x1="66" y1="12" x2="66" y2="18" />
            <line x1="69" y1="12" x2="69" y2="18" />
            <line x1="72" y1="12" x2="72" y2="18" />
            <line x1="75" y1="12" x2="75" y2="18" />
            <line x1="78" y1="12" x2="78" y2="18" />
            <line x1="80" y1="12" x2="80" y2="18" />
        </g>
    </g>

    {/* Text "POPPER" */}
    <g style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '48px', fontWeight: 'bold', letterSpacing: '0.025em' }}>
      {/* Shadow */}
      <text x="10" y="75" fill="#c9302c" transform="translate(3, 3)">POPPER</text>
      {/* Main Text */}
      <text x="10" y="75" fill="#f0ad4e">POPPER</text>
    </g>

    {/* Text "ESPAÑA" */}
    <g style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '48px', fontWeight: 'bold', letterSpacing: '0.025em' }}>
       {/* Shadow */}
      <text x="50" y="110" fill="#c9302c" transform="translate(3, 3)">ESPAÑA</text>
      {/* Main Text */}
      <text x="50" y="110" fill="#f0ad4e">ESPAÑA</text>
    </g>
  </svg>
);
