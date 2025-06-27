import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../types/product';
import { useAuth } from './AuthContext';
import { CartApi } from '../services/ApiService';
import { useToast } from './ToastContext';

interface CartItem {
  product: Product;
  id?: number | string; // Cart item ID from the database or string ID for guest cart
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

// Key for guest cart in localStorage
const GUEST_CART_KEY = 'guest_cart';
// Key for backup guest cart in localStorage
const BACKUP_GUEST_CART_KEY = 'backup_guest_cart';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Fetch cart data when component mounts or auth state changes
  useEffect(() => {
    if (isAuthenticated && token) {
      // If authenticated, fetch cart from API
      fetchCart();
    } else {
      // If not authenticated, load cart from localStorage
      loadGuestCart();
    }
  }, [isAuthenticated, token]);

  // Load cart from localStorage for guest users
  const loadGuestCart = () => {
    try {
      const guestCartJSON = localStorage.getItem(GUEST_CART_KEY);
      if (guestCartJSON) {
        const guestCart = JSON.parse(guestCartJSON);
        setCartItems(guestCart);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error loading guest cart from localStorage:', error);
      setCartItems([]);
    }
  };

  // Save cart to localStorage for guest users
  const saveGuestCart = (items: CartItem[]) => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving guest cart to localStorage:', error);
    }
  };

  // Backup guest cart before registration
  const backupGuestCart = (): CartItem[] => {
    try {
      const currentCartItems = [...cartItems];
      localStorage.setItem(BACKUP_GUEST_CART_KEY, JSON.stringify(currentCartItems));
      console.log('Guest cart backed up:', currentCartItems.length, 'items');
      return currentCartItems;
    } catch (error) {
      console.error('Error backing up guest cart:', error);
      return [];
    }
  };

  const fetchCart = async () => {
    if (!isAuthenticated || !token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await CartApi.getCart(token);
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
      // Show toast notification instead of alert
      showToast(`${product.name} is already in your cart.`, 'warning');
      return;
    }
    
    // For authenticated users, use the API
    if (isAuthenticated && token) {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await CartApi.addToCart(token, product.id);
        setCartItems(response.data.items || []);
        showToast(`${product.name} added to cart!`, 'success');
      } catch (error) {
        console.error('Error adding to cart:', error);
        setError(error instanceof Error ? error.message : 'An error occurred while adding to cart');
        showToast('Failed to add item to cart', 'error');
      } finally {
        setIsLoading(false);
      }
    } else {
      // For guest users, store in localStorage
      const newCartItems = [...cartItems];
      
      // Check if item already exists in cart - this should not happen due to our check above,
      // but keeping as a safeguard
      const existingItemIndex = newCartItems.findIndex(
        item => item.product.id === product.id
      );
      
      if (existingItemIndex !== -1) {
        // Show toast notification instead of alert
        showToast(`${product.name} is already in your cart.`, 'warning');
        return;
      } else {
        // Add new item with a unique string ID for guest cart items
        newCartItems.push({
          product,
          id: `guest-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
        } as CartItem); // Use type assertion to satisfy TypeScript
      }
      
      setCartItems(newCartItems);
      saveGuestCart(newCartItems);
      showToast(`${product.name} added to cart!`, 'success');
    }
  };

  const removeFromCart = async (itemId: number | string) => {
    // For authenticated users, use the API
    if (isAuthenticated && token && typeof itemId === 'number') {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await CartApi.removeFromCart(token, itemId);
        setCartItems(response.data.items || []);
        showToast('Item removed from cart', 'info');
      } catch (error) {
        console.error('Error removing from cart:', error);
        setError(error instanceof Error ? error.message : 'An error occurred while removing from cart');
        showToast('Failed to remove item from cart', 'error');
      } finally {
        setIsLoading(false);
      }
    } else {
      // For guest users, update localStorage
      const itemToRemove = cartItems.find(item => item.id === itemId);
      const newCartItems = cartItems.filter(item => item.id !== itemId);
      setCartItems(newCartItems);
      saveGuestCart(newCartItems);
      if (itemToRemove) {
        showToast('Item removed from cart', 'info');
      }
    }
  };

  const clearCart = async () => {
    // For authenticated users, use the API
    if (isAuthenticated && token) {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await CartApi.clearCart(token);
        setCartItems(response.data.items || []);
        showToast('Cart cleared successfully', 'info');
      } catch (error) {
        console.error('Error clearing cart:', error);
        setError(error instanceof Error ? error.message : 'An error occurred while clearing cart');
        showToast('Failed to clear cart', 'error');
      } finally {
        setIsLoading(false);
      }
    } else {
      // For guest users, clear localStorage
      setCartItems([]);
      localStorage.removeItem(GUEST_CART_KEY);
      showToast('Cart cleared successfully', 'info');
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