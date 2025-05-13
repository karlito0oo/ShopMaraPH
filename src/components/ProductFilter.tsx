import React from 'react';
import { Link } from 'react-router-dom';
import type { ProductCategory, ProductSize } from '../types/product';

interface ProductFilterProps {
  activeCategory: ProductCategory;
  activeSize: ProductSize;
  bestSellerOnly: boolean;
  onCategoryChange: (category: ProductCategory) => void;
  onSizeChange: (size: ProductSize) => void;
  onBestSellerChange: (bestSellerOnly: boolean) => void;
}

const ProductFilter: React.FC<ProductFilterProps> = ({ 
  activeCategory, 
  activeSize, 
  bestSellerOnly,
  onCategoryChange, 
  onSizeChange,
  onBestSellerChange
}) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-bold text-lg mb-4">Filters</h2>
      
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
              id="new" 
              name="category" 
              checked={activeCategory === 'new'}
              onChange={() => onCategoryChange('new')}
              className="mr-2"
            />
            <label htmlFor="new">New</label>
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
        </div>
      </div>

      {/* Best Seller filter */}
      <div>
        <h3 className="font-medium text-sm mb-2">Special</h3>
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="best-seller" 
            checked={bestSellerOnly}
            onChange={(e) => onBestSellerChange(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="best-seller">Best Sellers Only</label>
        </div>
      </div>
    </div>
  );
};

export default ProductFilter; 