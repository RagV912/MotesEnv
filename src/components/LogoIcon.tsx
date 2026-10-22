import React from 'react';

interface LogoIconProps {
  className?: string;
}

export const LogoIcon: React.FC<LogoIconProps> = ({ className = "h-11 w-11" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={`${className} shrink-0`} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top dark blue semi-circular dome/arch */}
      <path 
        d="M 15 58 A 36 36 0 1 1 85 58" 
        stroke="#1d5ea8" 
        strokeWidth="11" 
        strokeLinecap="round" 
        fill="none"
      />
      
      {/* White background lotus shield/petals */}
      <path 
        d="M 50 64 C 38 64 24 57 24 44 C 24 37 35 37 42 44 C 44 31 46 22 50 22 C 54 22 56 31 58 44 C 65 37 76 37 76 44 C 76 57 62 64 50 64 Z" 
        fill="#ffffff"
      />
      
      {/* Stylized green sprout (4 leaves + head) */}
      {/* Top-Left Leaf */}
      <path 
        d="M 50 54 C 42 50 34 40 38 36 C 43 35 48 46 50 54 Z" 
        fill="#3dbb5e"
      />
      {/* Top-Right Leaf */}
      <path 
        d="M 50 54 C 58 50 66 40 62 36 C 57 35 52 46 50 54 Z" 
        fill="#3dbb5e"
      />
      {/* Bottom-Left Leaf */}
      <path 
        d="M 50 54 C 40 54 30 48 32 44 C 36 43 45 50 50 54 Z" 
        fill="#3dbb5e"
      />
      {/* Bottom-Right Leaf */}
      <path 
        d="M 50 54 C 60 54 70 48 68 44 C 64 43 55 50 50 54 Z" 
        fill="#3dbb5e"
      />
      {/* Center Circle (Head) */}
      <circle cx="50" cy="34" r="6" fill="#3dbb5e" />
      
      {/* Flowing Water Waves */}
      {/* Bottom Wave (Medium blue, behind) */}
      <path 
        d="M 12 73 C 28 60 48 82 70 68 C 82 60 89 64 94 67 C 80 77 62 73 46 80 C 28 87 18 83 12 73 Z" 
        fill="#1caedd"
      />
      {/* Top Wave (Light cyan/blue, in front) */}
      <path 
        d="M 6 68 C 24 54 46 76 68 62 C 80 54 88 59 94 62 C 80 72 60 68 44 75 C 26 82 15 78 6 68 Z" 
        fill="#43cfea"
      />
    </svg>
  );
};

export default LogoIcon;
