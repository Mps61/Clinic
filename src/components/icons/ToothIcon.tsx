import React from 'react';

interface ToothIconProps {
  className?: string;
}

export const ToothIcon: React.FC<ToothIconProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M7.5 2C5 2 3 4.2 3 7.2c0 2.8 1.4 6 2.3 8.7.7 1.9 1.4 3.7 1.8 5.6.2 1.1 1.1 1.9 2.2 1.9 1.4 0 2.2-.8 2.4-2 .4-2.2 1.1-4.2 1.8-6.1.1-.2.2-.2.3 0 .7 1.9 1.4 3.9 1.8 6.1.2 1.2 1 2 2.4 2 1.1 0 2-.8 2.2-1.9.4-1.9 1.1-3.7 1.8-5.6.9-2.7 2.3-5.9 2.3-8.7C21 4.2 19 2 16.5 2c-2.1 0-3.8 1.2-4.5 2.3-.7-1.1-2.4-2.3-4.5-2.3z" />
  </svg>
);
