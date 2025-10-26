import React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  tip: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ children, tip, position = 'top' }) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative group flex items-center">
      {children}
      <div
        className={`absolute ${positionClasses[position]} w-max max-w-xs p-2 text-xs text-white bg-slate-800 dark:bg-slate-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none`}
      >
        {tip}
      </div>
    </div>
  );
};

export default Tooltip;
