import { useState, useEffect } from 'react';
import ProductFilter from '../components/ProductFilter';
import ProductGrid from '../components/ProductGrid';
import type { Product, ProductSize } from '../types/product';
import { getSaleProducts } from '../services/ProductService';
import { filterProductsBySize } from '../types/product';

const SalePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSize, setActiveSize] = useState<ProductSize>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [hideSoldProducts, setHideSoldProducts] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const saleProducts = await getSaleProducts();
        setProducts(saleProducts);
      } catch (error) {
        console.error('Error fetching sale products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = filterProductsBySize(products, activeSize, searchKeyword, hideSoldProducts);
    setFilteredProducts(filtered);
  }, [products, activeSize, searchKeyword, hideSoldProducts]);

  const handleSizeChange = (size: ProductSize) => {
    setActiveSize(size);
  };

  const handleSearchChange = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  const handleResetFilters = () => {
    setActiveSize('all');
    setSearchKeyword('');
    setHideSoldProducts(false);
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
            activeSize={activeSize}
            searchKeyword={searchKeyword}
            onSizeChange={handleSizeChange}
            onKeywordChange={handleSearchChange}
            showCategoryFilter={false}
            hideSoldProducts={hideSoldProducts}
            onHideSoldChange={setHideSoldProducts}
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