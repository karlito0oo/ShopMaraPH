import React from 'react';
import type { Product } from '../types/product';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onResetFilters: () => void;
  searchKeyword?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  onResetFilters,
  searchKeyword = ''
}) => {
  return (
    <div className="md:col-span-3">
      {searchKeyword && (
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">
            {products.length > 0 
              ? `Search results for "${searchKeyword}" (${products.length} ${products.length === 1 ? 'product' : 'products'})` 
              : `No products found for "${searchKeyword}"`}
          </h2>
        </div>
      )}

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6 equal-height-grid">
          {products.map((product) => (
            <div key={product.id} className="h-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded shadow text-center">
          <p className="text-gray-600">
            {searchKeyword 
              ? `No products found matching "${searchKeyword}". Try a different search term or reset filters.` 
              : 'No products found with the selected filters.'}
          </p>
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