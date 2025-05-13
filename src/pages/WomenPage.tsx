import React, { useState, useEffect } from 'react';
import { products } from '../data/products';
import ProductFilter from '../components/ProductFilter';
import ProductGrid from '../components/ProductGrid';
import type { ProductCategory, ProductSize } from '../types/product';
import { filterProducts } from '../types/product';

const WomenPage = () => {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('women');
  const [activeSize, setActiveSize] = useState<ProductSize>('all');
  const [bestSellerOnly, setBestSellerOnly] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(
    products.filter(product => product.category === 'women')
  );

  useEffect(() => {
    let productsToFilter = products;
    
    // If not showing all products, pre-filter to show only women's products plus the selected category
    if (activeCategory !== 'all') {
      productsToFilter = products.filter(product => 
        product.category === 'women' || product.category === activeCategory
      );
    }
    
    setFilteredProducts(filterProducts(productsToFilter, activeCategory, activeSize, bestSellerOnly));
  }, [activeCategory, activeSize, bestSellerOnly]);

  const resetFilters = () => {
    setActiveCategory('women');
    setActiveSize('all');
    setBestSellerOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Women's Collection</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Filters sidebar */}
        <div className="md:col-span-1">
          <ProductFilter 
            activeCategory={activeCategory}
            activeSize={activeSize}
            bestSellerOnly={bestSellerOnly}
            onCategoryChange={setActiveCategory}
            onSizeChange={setActiveSize}
            onBestSellerChange={setBestSellerOnly}
          />
        </div>
        
        {/* Products grid */}
        <ProductGrid 
          products={filteredProducts} 
          onResetFilters={resetFilters}
          defaultCategory="women"
        />
      </div>
    </div>
  )
}

export default WomenPage 