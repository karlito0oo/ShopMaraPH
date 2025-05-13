import React from 'react';
import type { Product, ProductCategory, ProductSize } from '../types/product';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onResetFilters: () => void;
  defaultCategory: ProductCategory;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  onResetFilters,
  defaultCategory
}) => {
  return (
    <div className="md:col-span-3">
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded shadow text-center">
          <p className="text-gray-600">No products found with the selected filters.</p>
          <button 
            onClick={onResetFilters}
            className="mt-4 px-4 py-2 bg-black text-white rounded"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid; 