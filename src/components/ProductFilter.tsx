import React from 'react';
import type { ProductCategory, ProductSize } from '../types/product';

interface ProductFilterProps {
  activeCategory: ProductCategory;
  activeSize: ProductSize;
  searchKeyword: string;
  onCategoryChange: (category: ProductCategory) => void;
  onSizeChange: (size: ProductSize) => void;
  onKeywordChange: (keyword: string) => void;
}

const ProductFilter: React.FC<ProductFilterProps> = ({ 
  activeCategory, 
  activeSize, 
  searchKeyword,
  onCategoryChange, 
  onSizeChange,
  onKeywordChange
}) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-bold text-lg mb-4">Filters</h2>
      
      {/* Search filter */}
      <div className="mb-6">
        <h3 className="font-medium text-sm mb-2">Search</h3>
        <div className="relative">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="Search products..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black text-sm"
          />
          {searchKeyword && (
            <button
              onClick={() => onKeywordChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Category filter */}
      <div className="mb-6">
        <h3 className="font-medium text-sm mb-2">Category</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <input 
              type="radio" 
              id="all-products" 
              name="category" 
              checked={activeCategory === 'all'}
              onChange={() => onCategoryChange('all')}
              className="mr-2"
            />
            <label htmlFor="all-products">All Products</label>
          </div>
          <div className="flex items-center">
            <input 
              type="radio" 
              id="new-arrival" 
              name="category" 
              checked={activeCategory === 'new_arrival'}
              onChange={() => onCategoryChange('new_arrival')}
              className="mr-2"
            />
            <label htmlFor="new-arrival">New Arrivals</label>
          </div>
          <div className="flex items-center">
            <input 
              type="radio" 
              id="sale" 
              name="category" 
              checked={activeCategory === 'sale'}
              onChange={() => onCategoryChange('sale')}
              className="mr-2"
            />
            <label htmlFor="sale">Sale</label>
          </div>
        </div>
      </div>
      
      {/* Size filter */}
      <div className="mb-6">
        <h3 className="font-medium text-sm mb-2">Size</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <input 
              type="radio" 
              id="all-sizes" 
              name="size" 
              checked={activeSize === 'all'}
              onChange={() => onSizeChange('all')}
              className="mr-2"
            />
            <label htmlFor="all-sizes">All Sizes</label>
          </div>
          <div className="flex items-center">
            <input 
              type="radio" 
              id="small" 
              name="size" 
              checked={activeSize === 'small'}
              onChange={() => onSizeChange('small')}
              className="mr-2"
            />
            <label htmlFor="small">Small</label>
          </div>
          <div className="flex items-center">
            <input 
              type="radio" 
              id="medium" 
              name="size" 
              checked={activeSize === 'medium'}
              onChange={() => onSizeChange('medium')}
              className="mr-2"
            />
            <label htmlFor="medium">Medium</label>
          </div>
          <div className="flex items-center">
            <input 
              type="radio" 
              id="large" 
              name="size" 
              checked={activeSize === 'large'}
              onChange={() => onSizeChange('large')}
              className="mr-2"
            />
            <label htmlFor="large">Large</label>
          </div>
          <div className="flex items-center">
            <input 
              type="radio" 
              id="xlarge" 
              name="size" 
              checked={activeSize === 'xlarge'}
              onChange={() => onSizeChange('xlarge')}
              className="mr-2"
            />
            <label htmlFor="xlarge">Extra Large</label>
          </div>
          <div className="flex items-center">
            <input 
              type="radio" 
              id="xxlarge" 
              name="size" 
              checked={activeSize === 'xxlarge'}
              onChange={() => onSizeChange('xxlarge')}
              className="mr-2"
            />
            <label htmlFor="xxlarge">2XL</label>
          </div>
          <div className="flex items-center">
            <input 
              type="radio" 
              id="xxxlarge" 
              name="size" 
              checked={activeSize === 'xxxlarge'}
              onChange={() => onSizeChange('xxxlarge')}
              className="mr-2"
            />
            <label htmlFor="xxxlarge">3XL</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilter; 