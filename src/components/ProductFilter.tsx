import React, { useState } from 'react';
import type { ProductCategory, ProductSize } from '../types/product';
import { FunnelIcon } from '@heroicons/react/24/outline';

interface ProductFilterProps {
  activeCategory?: ProductCategory;
  onCategoryChange?: (category: ProductCategory) => void;
  activeSize: ProductSize;
  onSizeChange: (size: ProductSize) => void;
  showCategoryFilter?: boolean;
  hideSoldProducts?: boolean;
  onHideSoldChange?: (hide: boolean) => void;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  activeCategory = 'all',
  onCategoryChange,
  activeSize,
  onSizeChange,
  showCategoryFilter = true,
  hideSoldProducts = false,
  onHideSoldChange,
  isOpen = false,
  onOpenChange
}) => {
  const handleClose = () => onOpenChange?.(false);

  return (
    <div className="relative">
      {/* Filter Panel */}
      <div className={`
        bg-white rounded-lg shadow-sm
        md:block md:p-6 md:static
        ${isOpen 
          ? 'fixed inset-0 z-40 p-6 overflow-y-auto bg-white' 
          : 'hidden'
        }
      `}>
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-black p-2 rounded-full hover:bg-gray-100"
            aria-label="Close Filters"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Container */}
        <div className="space-y-6 md:pb-0 pb-20">
          {/* Hide Sold Products Toggle */}
          <div className="mb-6">
            <h3 className="text-gray-800 font-semibold text-sm uppercase tracking-wider mb-3">Availability</h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hideSold"
                checked={hideSoldProducts}
                onChange={(e) => onHideSoldChange?.(e.target.checked)}
                className="form-checkbox h-4 w-4 text-black focus:ring-black rounded"
              />
              <label htmlFor="hideSold" className="ml-2 text-gray-700 cursor-pointer select-none">
                Hide Sold Products
              </label>
            </div>
          </div>

          {/* Category Filter */}
          {showCategoryFilter && onCategoryChange && (
            <div className="mb-6">
              <h3 className="text-gray-800 font-semibold text-sm uppercase tracking-wider mb-3">Category</h3>
              <div className="space-y-3">
                <label className="flex items-center cursor-pointer group">
                  <input 
                    type="radio" 
                    id="all" 
                    name="category" 
                    checked={activeCategory === 'all'}
                    onChange={() => onCategoryChange('all')}
                    className="form-radio text-black focus:ring-black h-4 w-4"
                  />
                  <span className="ml-3 text-gray-700 group-hover:text-black transition-colors">All Products</span>
                </label>
                <label className="flex items-center cursor-pointer group">
                  <input 
                    type="radio" 
                    id="men" 
                    name="category" 
                    checked={activeCategory === 'men'}
                    onChange={() => onCategoryChange('men')}
                    className="form-radio text-black focus:ring-black h-4 w-4"
                  />
                  <span className="ml-3 text-gray-700 group-hover:text-black transition-colors">Men</span>
                </label>
                <label className="flex items-center cursor-pointer group">
                  <input 
                    type="radio" 
                    id="women" 
                    name="category" 
                    checked={activeCategory === 'women'}
                    onChange={() => onCategoryChange('women')}
                    className="form-radio text-black focus:ring-black h-4 w-4"
                  />
                  <span className="ml-3 text-gray-700 group-hover:text-black transition-colors">Women</span>
                </label>
              </div>
            </div>
          )}

          {/* Size Filter */}
          <div className="mb-6">
            <h3 className="text-gray-800 font-semibold text-sm uppercase tracking-wider mb-3">Size</h3>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer group">
                <input 
                  type="radio" 
                  id="size-all" 
                  name="size" 
                  checked={activeSize === 'all'}
                  onChange={() => onSizeChange('all')}
                  className="form-radio text-black focus:ring-black h-4 w-4"
                />
                <span className="ml-3 text-gray-700 group-hover:text-black transition-colors">All Sizes</span>
              </label>
              {(['xs', 's', 'm', 'l', 'xl', 'xxl'] as ProductSize[]).map((size) => (
                <label key={size} className="flex items-center cursor-pointer group">
                  <input 
                    type="radio" 
                    id={`size-${size}`}
                    name="size" 
                    checked={activeSize === size}
                    onChange={() => onSizeChange(size)}
                    className="form-radio text-black focus:ring-black h-4 w-4"
                  />
                  <span className="ml-3 text-gray-700 group-hover:text-black transition-colors">{size.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Apply Button */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <button
            onClick={handleClose}
            className="w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-900 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;
