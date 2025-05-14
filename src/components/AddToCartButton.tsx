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

  const handleAddToCart = () => {
    if (isOutOfStock) {
      return; // Prevent adding out of stock items
    }

    if (!product.sizes || product.sizes.length === 0) {
      // Product doesn't have sizes, add directly
      addToCart(product, 'medium', 1)
        .then(() => {
          if (onAddedToCart) onAddedToCart();
        })
        .catch((err) => {
          console.error('Error adding to cart:', err);
        });
      return;
    }

    if (selectedSize) {
      // Check if selected size is in stock
      const sizeStockItem = product.sizeStock.find(item => item.size === selectedSize);
      if (sizeStockItem && sizeStockItem.stock > 0) {
        addToCart(product, selectedSize, 1)
          .then(() => {
            if (onAddedToCart) onAddedToCart();
          })
          .catch((err) => {
            console.error('Error adding to cart:', err);
          });
      }
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