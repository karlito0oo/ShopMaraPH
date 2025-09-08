import React from 'react';
import { MobileFilterButton } from './MobileFilterButton';

interface ProductFilterHeaderProps {
  searchKeyword: string;
  onKeywordChange: (keyword: string) => void;
  isFilterOpen: boolean;
  onFilterOpenChange: (isOpen: boolean) => void;
}

const ProductFilterHeader: React.FC<ProductFilterHeaderProps> = ({
  searchKeyword,
  onKeywordChange,
  isFilterOpen,
  onFilterOpenChange
}) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 md:col-span-3">
      <div className="w-full sm:w-64">
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="Search products..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
        />
      </div>
      <MobileFilterButton 
        isOpen={isFilterOpen} 
        onOpenChange={onFilterOpenChange}
        className="sm:w-auto"
      />
    </div>
  );
};

export default ProductFilterHeader;
