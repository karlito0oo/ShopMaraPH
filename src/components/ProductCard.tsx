import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types/product';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  
  // Since we now only have one size per product
  const size = product.sizes[0];
  
  // Check if product is out of stock
  const isOutOfStock = product.sizeStock[0]?.stock <= 0;
  
  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart(product, size, 1)
        .catch((err) => {
          console.error('Error adding to cart:', err);
        });
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
          
          {/* SOLD Overlay for out of stock items */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center">
              <span className="text-black text-2xl font-bold font-como">SOLD</span>
            </div>
          )}
        </div>
      </Link>
      
      {/* Product Content */}
      <div className="product-card__content">
        {/* Product Name and Size Row */}
        <div className="flex items-start gap-2 justify-between">
          {/* Product Name */}
          <Link to={`/product/${product.id}`} className="no-underline text-inherit flex-1 mr-2">
            <h3 className="product-card__title line-clamp-2">{product.name}</h3>
          </Link>
          
          {/* Size Badge */}
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
            Size: {size.toUpperCase()}
          </span>
        </div>
        
        {/* Price */}
        <div className="product-card__price">
          ₱{product.price.toFixed(2)}
        </div>
        
        {/* Buttons - Fixed height area */}
        <div className="product-card__actions">
          
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`add-to-cart-button w-full ${
              isOutOfStock 
                ? 'add-to-cart-button--disabled' 
                : ''
            }`}
          >
            {isOutOfStock ? 'Sold' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 