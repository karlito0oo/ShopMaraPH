import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import type { Product, ProductSize } from '../types/product';

interface AddToCartButtonProps {
  product: Product;
  className?: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product, className = '' }) => {
  const { addToCart, isInCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [error, setError] = useState('');

  const handleAddToCart = () => {
    if (!product.sizes || product.sizes.length === 0) {
      // Product doesn't have sizes, add directly
      addToCart(product, 'medium', 1);
      return;
    }

    if (selectedSize) {
      addToCart(product, selectedSize, 1);
      setShowSizeSelector(false);
      setError('');
    } else {
      setShowSizeSelector(true);
      setError('Please select a size');
    }
  };

  const handleSizeChange = (size: ProductSize) => {
    setSelectedSize(size);
    setError('');
  };

  return (
    <div className="mt-2">
      {showSizeSelector && (
        <div className="mb-2">
          <div className="flex gap-2 my-2">
            {product.sizes.filter(size => size !== 'all').map((size) => (
              <button
                key={size}
                onClick={() => handleSizeChange(size)}
                className={`px-3 py-1 text-sm font-medium rounded ${
                  selectedSize === size
                    ? 'bg-black text-white border-2 border-black'
                    : 'bg-white text-black border-2 border-gray-300 hover:border-gray-500'
                }`}
              >
                {size.toUpperCase()}
              </button>
            ))}
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      )}
      <button
        onClick={handleAddToCart}
        className={`bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors w-full ${className}`}
      >
        Add to Cart
      </button>
    </div>
  );
};

export default AddToCartButton; 