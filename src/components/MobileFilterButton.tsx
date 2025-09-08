import React from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';

interface MobileFilterButtonProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  className?: string;
}

export const MobileFilterButton: React.FC<MobileFilterButtonProps> = ({
  isOpen,
  onOpenChange,
  className = ''
}) => {
  return (
    <button 
      onClick={() => onOpenChange(!isOpen)}
      className={`md:hidden flex items-center justify-center space-x-2 w-full bg-black text-white py-3 px-4 rounded-lg shadow hover:bg-gray-900 transition-colors ${className}`}
      aria-label="Show Filters"
    >
      <FunnelIcon className="w-5 h-5" />
      <span>Filter Products</span>
    </button>
  );
};
