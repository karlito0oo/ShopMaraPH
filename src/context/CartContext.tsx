import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Product, ProductSize } from '../types/product';

interface CartItem {
  product: Product;
  quantity: number;
  size: ProductSize;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, size: ProductSize, quantity: number) => void;
  removeFromCart: (productId: string | number, size: ProductSize) => void;
  updateQuantity: (productId: string | number, size: ProductSize, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (productId: string | number, size: ProductSize) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize cart from localStorage if available
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('shopmara-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shopmara-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product, size: ProductSize, quantity: number = 1) => {
    setCartItems(prevItems => {
      // Check if the item is already in the cart with the same size
      const existingItemIndex = prevItems.findIndex(
        item => item.product.id === product.id && item.size === size
      );

      if (existingItemIndex >= 0) {
        // Item already exists, update quantity
        const newItems = prevItems.map((item, index) => {
          if (index === existingItemIndex) {
            return {
              ...item,
              quantity: item.quantity + quantity
            };
          }
          return item;
        });
        return newItems;
      } else {
        // Item doesn't exist, add it to cart
        return [...prevItems, { product, size, quantity }];
      }
    });
  };

  const removeFromCart = (productId: string | number, size: ProductSize) => {
    setCartItems(prevItems => 
      prevItems.filter(item => !(item.product.id === productId && item.size === size))
    );
  };

  const updateQuantity = (productId: string | number, size: ProductSize, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    setCartItems(prevItems => 
      prevItems.map(item => 
        item.product.id === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity, 
      0
    );
  };

  const isInCart = (productId: string | number, size: ProductSize) => {
    return cartItems.some(item => item.product.id === productId && item.size === size);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        isInCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 