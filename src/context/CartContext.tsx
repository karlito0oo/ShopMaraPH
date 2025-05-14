import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Product, ProductSize } from '../types/product';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  product: Product;
  quantity: number;
  size: ProductSize;
  id?: number; // Cart item ID from the database
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, size: ProductSize, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (productId: string | number, size: ProductSize) => boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, isAuthenticated, user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch cart from API when user logs in
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchCart();
    } else {
      // Clear the cart when the user logs out
      setCartItems([]);
    }
  }, [isAuthenticated, token]);

  const fetchCart = async () => {
    if (!isAuthenticated || !token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/cart', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      const data = await response.json();
      setCartItems(data.data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching the cart');
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product: Product, size: ProductSize, quantity: number = 1) => {
    // If not authenticated, redirect to login page
    if (!isAuthenticated || !token) {
      // Redirect to login page
      navigate('/login');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          product_id: product.id,
          size,
          quantity,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add item to cart');
      }
      
      const data = await response.json();
      setCartItems(data.data.items || []);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while adding to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: number) => {
    if (!isAuthenticated || !token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/cart/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          cart_item_id: itemId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }
      
      const data = await response.json();
      setCartItems(data.data.items || []);
    } catch (error) {
      console.error('Error removing from cart:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while removing from cart');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (!isAuthenticated || !token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/cart/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          cart_item_id: itemId,
          quantity,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update cart item');
      }
      
      const data = await response.json();
      setCartItems(data.data.items || []);
    } catch (error) {
      console.error('Error updating cart item:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while updating cart');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated || !token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/cart/clear', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }
      
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while clearing cart');
    } finally {
      setIsLoading(false);
    }
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
        isInCart,
        isLoading,
        error,
        token
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