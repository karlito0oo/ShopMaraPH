import React, { useState, useEffect } from 'react';
import ProductFilter from '../components/ProductFilter';
import ProductGrid from '../components/ProductGrid';
import type { ProductCategory, ProductSize, Product } from '../types/product';
import { filterProducts } from '../types/product';
import { getAllProducts } from '../services/ProductService';

const AllProductsPage = () => {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');
  const [activeSize, setActiveSize] = useState<ProductSize>('all');
  const [bestSellerOnly, setBestSellerOnly] = useState(false);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const productsData = await getAllProducts();
        setProducts(productsData);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Apply filters when products change or filter settings change
  useEffect(() => {
    if (products.length > 0) {
      setFilteredProducts(filterProducts(
        products, 
        activeCategory, 
        activeSize, 
        bestSellerOnly,
        searchKeyword,
        showNewOnly
      ));
    }
  }, [products, activeCategory, activeSize, bestSellerOnly, showNewOnly, searchKeyword]);

  const resetFilters = () => {
    setActiveCategory('all');
    setActiveSize('all');
    setBestSellerOnly(false);
    setShowNewOnly(false);
    setSearchKeyword('');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">All Products</h1>
        <div className="text-center py-12">
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">All Products</h1>
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Filters sidebar */}
        <div className="md:col-span-1">
          <ProductFilter 
            activeCategory={activeCategory}
            activeSize={activeSize}
            bestSellerOnly={bestSellerOnly}
            showNewOnly={showNewOnly}
            searchKeyword={searchKeyword}
            onCategoryChange={setActiveCategory}
            onSizeChange={setActiveSize}
            onBestSellerChange={setBestSellerOnly}
            onNewArrivalsChange={setShowNewOnly}
            onKeywordChange={setSearchKeyword}
          />
        </div>
        
        {/* Products grid */}
        <ProductGrid 
          products={filteredProducts} 
          onResetFilters={resetFilters}
          defaultCategory="all"
          searchKeyword={searchKeyword}
        />
      </div>
    </div>
  )
}

export default AllProductsPage 