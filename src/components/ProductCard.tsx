import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types/product';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product page
    e.stopPropagation(); // Stop event propagation
    
    if (product.status === 'Available' && product.size) {
      try {
        await addToCart(product);
      } catch (err) {
        console.error('Error adding to cart:', err);
        // Error handling is now done in CartContext with toast notifications
      }
    }
  };
  
  return (
    <div className="product-card">
      {/* Product Tags (New Arrival & Sale) */}
      <div className="absolute top-0 right-0 z-10 flex flex-col gap-1 m-2">
        {product.isNewArrival && (
          <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
            New Arrival
          </div>
        )}
        {product.isSale && (
          <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            Sale
          </div>
        )}
      </div>
      
      {/* Product Image */}
      <Link to={`/product/${product.id}`} className="no-underline text-inherit block">
        <div className="product-card__image-container">
          <img 
            src={product.image} 
            alt={product.name}
            className="product-card__image"
          />
          
          {/* Status Overlay */}
          {(product.status === 'Sold' || product.status === 'OnHold') && (
            <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center">
              <span className={`text-2xl font-bold font-como ${product.status === 'Sold' ? 'text-black' : 'text-yellow-800'}`}>
                {product.status === 'Sold' ? 'SOLD' : 'ON HOLD'}
              </span>
            </div>
          )}
        </div>
      </Link>
      
      {/* Product Content */}
      <div className="p-4">
        {/* Product Name and Size Row */}
        <div className="flex items-start justify-between mb-1" style={{height: '20px'}}>
          {/* Product Name */}
          <Link to={`/product/${product.id}`} className="no-underline text-inherit flex-1">
            <h3 className="product-card__title text-sm font-medium line-clamp-1 m-0">{product.name}</h3>
          </Link>
          
          {/* Size Badge */}
          <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded whitespace-nowrap">
            Size: {product.size?.toUpperCase()}
          </span>
        </div>
        
        {/* Price */}
        <div className="product-card__price text-sm font-semibold mb-2">
          ₱{product.price.toFixed(2)}
        </div>
        
        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.status !== 'Available' || !product.size}
          className={`w-full py-1.5 px-3 text-sm font-medium rounded transition-colors ${
            product.status !== 'Available' || !product.size
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          {product.status === 'Sold' ? 'Sold' : 
           product.status === 'OnHold' ? 'On Hold' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 