import { useState, useEffect } from 'react';
import ProductFilter from '../components/ProductFilter';
import ProductGrid from '../components/ProductGrid';
import type { Product, ProductCategory, ProductSize } from '../types/product';
import { getAllProducts } from '../services/ProductService';
import { filterProducts } from '../types/product';

const SalePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('sale');
  const [activeSize, setActiveSize] = useState<ProductSize>('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const allProducts = await getAllProducts();
        setProducts(allProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    // Always filter for sale products on the sale page
    const filtered = filterProducts(products, activeCategory, activeSize, searchKeyword, false, true);
    setFilteredProducts(filtered);
  }, [products, activeCategory, activeSize, searchKeyword]);

  const handleCategoryChange = (category: ProductCategory) => {
    setActiveCategory(category);
  };

  const handleSizeChange = (size: ProductSize) => {
    setActiveSize(size);
  };

  const handleSearchChange = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  const handleResetFilters = () => {
    setActiveCategory('sale');
    setActiveSize('all');
    setSearchKeyword('');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Sale</h1>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Sale</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <ProductFilter
            activeCategory={activeCategory}
            activeSize={activeSize}
            searchKeyword={searchKeyword}
            onCategoryChange={handleCategoryChange}
            onSizeChange={handleSizeChange}
            onKeywordChange={handleSearchChange}
          />
        </div>
        
        <div className="md:col-span-3">
          <ProductGrid 
            products={filteredProducts} 
            onResetFilters={handleResetFilters} 
            searchKeyword={searchKeyword}
          />
        </div>
      </div>
    </div>
  );
};

export default SalePage; 