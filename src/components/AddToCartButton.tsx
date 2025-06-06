import React from 'react';
import { useCart } from '../context/CartContext';
import type { Product, ProductSize } from '../types/product';

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  selectedSize?: ProductSize | null;
  onAddedToCart?: () => void;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ 
  product, 
  className = '',
  selectedSize = null,
  onAddedToCart 
}) => {
  const { addToCart } = useCart();

  // Check if product is out of stock
  const isOutOfStock = product.sizeStock.every(item => item.stock <= 0);

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      return; // Prevent adding out of stock items
    }

    try {
      if (!product.sizes || product.sizes.length === 0) {
        // Product doesn't have sizes, add directly
        await addToCart(product, 'medium', 1);
        if (onAddedToCart) onAddedToCart();
        return;
      }

      if (selectedSize) {
        // Check if selected size is in stock
        const sizeStockItem = product.sizeStock.find(item => item.size === selectedSize);
        if (sizeStockItem && sizeStockItem.stock > 0) {
          await addToCart(product, selectedSize, 1);
          if (onAddedToCart) onAddedToCart();
        }
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      // Error handling is now done in CartContext with toast notifications
    }
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={isOutOfStock}
      className={`add-to-cart-button ${
        isOutOfStock 
          ? 'add-to-cart-button--disabled' 
          : ''
      } ${className}`}
    >
      {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
    </button>
  );
};

export default AddToCartButton; 