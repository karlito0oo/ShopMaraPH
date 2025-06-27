import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../types/product';
import { useAuth } from './AuthContext';
import { CartApi } from '../services/ApiService';
import { useToast } from './ToastContext';

interface CartItem {
  product: Product;
  id?: number | string; // Cart item ID from the database
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (itemId: number | string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (productId: string | number) => boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  fetchCart: () => Promise<void>;
  backupGuestCart: () => CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Key for guest ID in localStorage
const GUEST_ID_KEY = 'guest_id';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Generate or get guest ID
  const getGuestId = () => {
    let guestId = localStorage.getItem(GUEST_ID_KEY);
    if (!guestId) {
      guestId = `guest-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem(GUEST_ID_KEY, guestId);
    }
    return guestId;
  };

  // Get headers for API requests
  const getHeaders = () => {
    const headers: Record<string, string> = {};
    if (isAuthenticated && token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      headers['X-Guest-ID'] = getGuestId();
    }
    return headers;
  };

  // Fetch cart data when component mounts or auth state changes
  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, token]);

  const fetchCart = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await CartApi.getCart(getHeaders());
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching the cart');
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product: Product) => {
    // Check if product is already in cart
    const isProductInCart = cartItems.some(item => 
      item.product.id === product.id
    );
    
    if (isProductInCart) {
      showToast(`${product.name} is already in your cart.`, 'warning');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await CartApi.addToCart(getHeaders(), product.id);
      setCartItems(response.data.items || []);
      showToast(`${product.name} added to cart!`, 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while adding to cart');
      showToast('Failed to add item to cart', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: number | string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await CartApi.removeFromCart(getHeaders(), itemId.toString());
      setCartItems(response.data.items || []);
      showToast('Item removed from cart', 'info');
    } catch (error) {
      console.error('Error removing from cart:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while removing from cart');
      showToast('Failed to remove item from cart', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await CartApi.clearCart(getHeaders());
      setCartItems(response.data.items || []);
      showToast('Cart cleared successfully', 'info');
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while clearing cart');
      showToast('Failed to clear cart', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalItems = () => {
    return cartItems.length;
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + Number(item.product.price || 0), 0);
  };

  const isInCart = (productId: string | number) => {
    return cartItems.some(item => item.product.id === productId);
  };

  // Backup guest cart before registration
  const backupGuestCart = (): CartItem[] => {
    try {
      const currentCartItems = [...cartItems];
      return currentCartItems;
    } catch (error) {
      console.error('Error backing up guest cart:', error);
      return [];
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        getTotalItems,
        getTotalPrice,
        isInCart,
        isLoading,
        error,
        token,
        fetchCart,
        backupGuestCart,
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