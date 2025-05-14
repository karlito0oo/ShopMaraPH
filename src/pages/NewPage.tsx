import React, { useState, useEffect } from 'react';
import { products } from '../data/products';
import ProductFilter from '../components/ProductFilter';
import ProductGrid from '../components/ProductGrid';
import type { ProductCategory, ProductSize } from '../types/product';
import { filterProducts } from '../types/product';

const NewPage = () => {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('new');
  const [activeSize, setActiveSize] = useState<ProductSize>('all');
  const [bestSellerOnly, setBestSellerOnly] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(
    products.filter(product => product.category === 'new')
  );

  useEffect(() => {
    let productsToFilter = products;
    
    // If not showing all products, pre-filter to show only new products plus the selected category
    if (activeCategory !== 'all') {
      productsToFilter = products.filter(product => 
        product.category === 'new' || product.category === activeCategory
      );
    }
    
    setFilteredProducts(filterProducts(
      productsToFilter, 
      activeCategory, 
      activeSize, 
      bestSellerOnly,
      searchKeyword
    ));
  }, [activeCategory, activeSize, bestSellerOnly, searchKeyword]);

  const resetFilters = () => {
    setActiveCategory('new');
    setActiveSize('all');
    setBestSellerOnly(false);
    setSearchKeyword('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">New Arrivals</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Filters sidebar */}
        <div className="md:col-span-1">
          <ProductFilter 
            activeCategory={activeCategory}
            activeSize={activeSize}
            bestSellerOnly={bestSellerOnly}
            searchKeyword={searchKeyword}
            onCategoryChange={setActiveCategory}
            onSizeChange={setActiveSize}
            onBestSellerChange={setBestSellerOnly}
            onKeywordChange={setSearchKeyword}
          />
        </div>
        
        {/* Products grid */}
        <ProductGrid 
          products={filteredProducts} 
          onResetFilters={resetFilters}
          defaultCategory="new"
          searchKeyword={searchKeyword}
        />
      </div>
    </div>
  )
}

export default NewPage 