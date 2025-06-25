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
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  activeCategory = 'all',
  onCategoryChange,
  activeSize,
  onSizeChange,
  searchKeyword,
  onKeywordChange,
  showCategoryFilter = true,
}) => {
  return (
    <div className="space-y-6">
      {/* Search Filter */}
      <div className="mb-6">
        <h3 className="font-medium text-sm mb-2">Search</h3>
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="Search products..."
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      {/* Category Filter */}
      {showCategoryFilter && onCategoryChange && (
        <div className="mb-6">
          <h3 className="font-medium text-sm mb-2">Category</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input 
                type="radio" 
                id="all" 
                name="category" 
                checked={activeCategory === 'all'}
                onChange={() => onCategoryChange('all')}
                className="mr-2"
              />
              <label htmlFor="all">All Products</label>
            </div>
            <div className="flex items-center">
              <input 
                type="radio" 
                id="men" 
                name="category" 
                checked={activeCategory === 'men'}
                onChange={() => onCategoryChange('men')}
                className="mr-2"
              />
              <label htmlFor="men">Men</label>
            </div>
            <div className="flex items-center">
              <input 
                type="radio" 
                id="women" 
                name="category" 
                checked={activeCategory === 'women'}
                onChange={() => onCategoryChange('women')}
                className="mr-2"
              />
              <label htmlFor="women">Women</label>
            </div>
          </div>
        </div>
      )}

      {/* Size Filter */}
      <div className="mb-6">
        <h3 className="font-medium text-sm mb-2">Size</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <input 
              type="radio" 
              id="size-all" 
              name="size" 
              checked={activeSize === 'all'}
              onChange={() => onSizeChange('all')}
              className="mr-2"
            />
            <label htmlFor="size-all">All Sizes</label>
          </div>
          {(['xs', 's', 'm', 'l', 'xl', 'xxl'] as ProductSize[]).map((size) => (
            <div key={size} className="flex items-center">
              <input 
                type="radio" 
                id={`size-${size}`}
                name="size" 
                checked={activeSize === size}
                onChange={() => onSizeChange(size)}
                className="mr-2"
              />
              <label htmlFor={`size-${size}`}>{size.toUpperCase()}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFilter; 