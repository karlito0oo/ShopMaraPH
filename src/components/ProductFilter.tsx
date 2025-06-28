import React from 'react';
import type { ProductCategory, ProductSize } from '../types/product';

interface ProductFilterProps {
  activeCategory?: ProductCategory;
  onCategoryChange?: (category: ProductCategory) => void;
  activeSize: ProductSize;
  onSizeChange: (size: ProductSize) => void;
  searchKeyword: string;
  onKeywordChange: (keyword: string) => void;
  showCategoryFilter?: boolean;
  hideSoldProducts?: boolean;
  onHideSoldChange?: (hide: boolean) => void;
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  activeCategory = 'all',
  onCategoryChange,
  activeSize,
  onSizeChange,
  searchKeyword,
  onKeywordChange,
  showCategoryFilter = true,
  hideSoldProducts = false,
  onHideSoldChange
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
      {/* Search Filter */}
      <div className="mb-6">
        <h3 className="text-gray-800 font-semibold text-sm uppercase tracking-wider mb-3">Search</h3>
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="Search products..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
        />
      </div>

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
  );
};

export default ProductFilter; 