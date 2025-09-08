import { useState, useEffect } from "react";
import ProductFilter from "../components/ProductFilter";
import ProductGrid from "../components/ProductGrid";
import ProductFilterHeader from "../components/ProductFilterHeader";
import type { ProductSize, Product } from "../types/product";
import { filterProductsBySize } from "../types/product";
import { getAllProducts } from "../services/ProductService";

const AllProductsPage = () => {
  const [activeSize, setActiveSize] = useState<ProductSize>("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hideSoldProducts, setHideSoldProducts] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const productsData = await getAllProducts();
        setProducts(productsData);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Apply filters when products change or filter settings change
  useEffect(() => {
    if (products.length > 0) {
      setFilteredProducts(
        filterProductsBySize(
          products,
          activeSize,
          searchKeyword,
          hideSoldProducts
        )
      );
    }
  }, [products, activeSize, searchKeyword, hideSoldProducts]);

  const resetFilters = () => {
    setActiveSize("all");
    setSearchKeyword("");
    setHideSoldProducts(false);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 mb-8">
        {/* Filters sidebar */}
        <div className="md:col-span-1">
          <ProductFilter
            activeSize={activeSize}
            onSizeChange={setActiveSize}
            showCategoryFilter={false}
            hideSoldProducts={hideSoldProducts}
            onHideSoldChange={setHideSoldProducts}
            isOpen={isFilterOpen}
            onOpenChange={setIsFilterOpen}
          />
        </div>

        <div className="md:col-span-3">
          <div className="mb-6">
            <ProductFilterHeader
              searchKeyword={searchKeyword}
              onKeywordChange={setSearchKeyword}
              isFilterOpen={isFilterOpen}
              onFilterOpenChange={setIsFilterOpen}
            />
          </div>
          {/* Products grid */}
          <ProductGrid
            products={filteredProducts}
            onResetFilters={resetFilters}
            searchKeyword={searchKeyword}
          />
        </div>
      </div>
    </div>
  );
};

export default AllProductsPage;
