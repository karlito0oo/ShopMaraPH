import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types/product';
import { getNewArrivalProducts } from '../services/ProductService';
import ProductCard from './ProductCard';

const NewDropsSection = () => {
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setIsLoading(true);
        const arrivals = await getNewArrivalProducts();
        // Filter out products with Hold, Pending, or Sold status
        const availableProducts = arrivals.filter(product => 
          product.status !== 'OnHold' && 
          product.status !== 'Pending' && 
          product.status !== 'Sold'
        );
        setNewProducts(availableProducts.slice(0, 8)); // Limit to 8 products
      } catch (err) {
        console.error('Error fetching new arrivals:', err);
        setError('Failed to load new arrivals');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNewArrivals();
  }, []);

  if (isLoading) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8">New Drops</h2>
          <div className="text-center py-8">
            <p>Loading new arrivals...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8">New Drops</h2>
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (newProducts.length === 0) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8">New Drops</h2>
          <div className="text-center py-8">
            <p>No new arrivals found at the moment. Check back soon!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8">New Drops</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {newProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link 
            to="/products" 
            className="inline-block border border-black px-8 py-3 hover:bg-black hover:text-white transition-colors no-underline text-black"
          >
            View All Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewDropsSection; 