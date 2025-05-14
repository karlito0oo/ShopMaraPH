import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product, ProductSize } from '../types/product';
import AddToCartButton from './AddToCartButton';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [showSizes, setShowSizes] = useState(false);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [error, setError] = useState('');
  const { addToCart } = useCart();
  
  // Check if product is out of stock
  const isOutOfStock = product.sizeStock.every(item => item.stock <= 0);
  
  const handleSizeSelect = (size: ProductSize) => {
    setSelectedSize(size);
    setError('');
  };

  const handleConfirm = () => {
    if (selectedSize) {
      const sizeStockItem = product.sizeStock.find(item => item.size === selectedSize);
      if (sizeStockItem && sizeStockItem.stock > 0) {
        addToCart(product, selectedSize, 1);
        setShowSizes(false);
        setSelectedSize(null);
        setError('');
      } else {
        setError('Selected size is out of stock');
      }
    } else {
      setError('Please select a size');
    }
  };
  
  return (
    <div className="product-card">
      {/* Product Tags (Best Seller & New Arrival) */}
      <div className="absolute top-0 right-0 z-10 flex flex-col gap-1 m-2">
        {product.isBestSeller && (
          <div className="bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
            Best Seller
          </div>
        )}
        {product.isNewArrival && (
          <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
            New Arrival
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
        </div>
      </Link>
      
      {/* Product Content */}
      <div className="product-card__content">
        {/* Product Name and Category Row */}
        <div className="flex items-start mb-2 gap-2 justify-between">
          {/* Product Name */}
          <Link to={`/product/${product.id}`} className="no-underline text-inherit flex-1 mr-2">
            <h3 className="product-card__title line-clamp-2">{product.name}</h3>
          </Link>
          
          {/* Category Label */}
          <span className="product-card__category mt-0">{product.category}</span>
        </div>
        
        {/* Price */}
        <div className="product-card__price">
          ₱{product.price.toFixed(2)}
        </div>
        
        {/* Available Sizes */}
        <div className="product-card__sizes">
          Available in: {product.sizes
            .filter(size => size !== 'all')
            .map(size => size.toUpperCase())
            .join(', ')}
        </div>
        
        {/* Stock information */}
        <div className={`product-card__stock ${
          getTotalStock(product) > 0 
            ? 'product-card__stock--in' 
            : 'product-card__stock--out'
        }`}>
          {getTotalStock(product) > 0 ? (
            <>In Stock ({getTotalStock(product)} items)</>
          ) : (
            <>Out of Stock</>
          )}
        </div>
        
        {/* Buttons - Fixed height area */}
        <div className="product-card__actions">
          {!showSizes ? (
            <>
              <Link 
                to={`/product/${product.id}`} 
                className="block w-full bg-white text-black border border-black px-4 py-2 hover:bg-gray-100 transition-colors text-center no-underline mb-2 text-sm rounded-md"
              >
                View Details
              </Link>
              <button
                type="button"
                onClick={() => !isOutOfStock && setShowSizes(true)}
                disabled={isOutOfStock}
                className={`add-to-cart-button w-full ${
                  isOutOfStock 
                    ? 'add-to-cart-button--disabled' 
                    : ''
                }`}
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </>
          ) : (
            <>
              <div className="size-selector__container mb-2">
                <p className="size-selector__label text-xs mb-1">Select Size:</p>
                <div className="size-selector__buttons flex flex-wrap gap-1">
                  {product.sizes.filter(size => size !== 'all').map((size) => {
                    // Check if this size is in stock
                    const sizeStock = product.sizeStock.find(item => item.size === size);
                    const isSizeInStock = sizeStock && sizeStock.stock > 0;
                    
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => isSizeInStock && handleSizeSelect(size)}
                        disabled={!isSizeInStock}
                        className={`size-selector__button ${
                          selectedSize === size
                            ? 'size-selector__button--selected'
                            : !isSizeInStock
                              ? 'size-selector__button--disabled'
                              : ''
                        }`}
                      >
                        {size.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
                {error && <p className="size-selector__error text-xs text-red-500 mt-1">{error}</p>}
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowSizes(false);
                    setSelectedSize(null);
                    setError('');
                  }}
                  className="flex-1 bg-white text-black border border-black px-4 py-2 hover:bg-gray-100 transition-colors text-center text-sm rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 add-to-cart-button"
                >
                  Confirm
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get total stock across all sizes
const getTotalStock = (product: Product): number => {
  return product.sizeStock.reduce((total, item) => total + item.stock, 0);
};

export default ProductCard; 