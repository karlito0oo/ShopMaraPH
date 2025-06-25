import React from 'react';
import { useCart } from '../context/CartContext';
import type { Product } from '../types/product';

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  onAddedToCart?: () => void;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ 
  product, 
  className = '',
  onAddedToCart 
}) => {
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    if (product.status === 'Sold') {
      return; // Prevent adding sold items
    }

    try {
      await addToCart(product);
      if (onAddedToCart) onAddedToCart();
    } catch (err) {
      console.error('Error adding to cart:', err);
      // Error handling is now done in CartContext with toast notifications
    }
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={product.status === 'Sold'}
      className={`add-to-cart-button ${
        product.status === 'Sold' 
          ? 'add-to-cart-button--disabled' 
          : ''
      } ${className}`}
    >
      {product.status === 'Sold' ? 'Sold' : 'Add to Cart'}
    </button>
  );
};

export default AddToCartButton; 