import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Product, ProductSize } from '../types/product';
import { useAuth } from './AuthContext';
import { CartApi } from '../services/ApiService';
import { useToast } from './ToastContext';

interface CartItem {
  product: Product;
  quantity: number;
  size: ProductSize;
  id?: number | string; // Cart item ID from the database or string ID for guest cart
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, size: ProductSize, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number | string) => Promise<void>;
  updateQuantity: (itemId: number | string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (productId: string | number, size: ProductSize) => boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  fetchCart: () => Promise<void>;
  backupGuestCart: () => CartItem[];
  restoreGuestCart: (items: CartItem[]) => Promise<void>;
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

  // Restore guest cart after registration (if migration fails)
  const restoreGuestCart = async (items: CartItem[]): Promise<void> => {
    if (!isAuthenticated || !token) {
      console.log('Not authenticated, cannot restore cart');
      return;
    }

    console.log('Restoring', items.length, 'items to user cart');
    setIsLoading(true);
    
    try {
      // Add each item to the user's cart via API
      for (const item of items) {
        console.log('Manually adding item to cart:', item.product.id, item.size, item.quantity);
        await CartApi.addToCart(token, item.product.id, item.size, item.quantity);
      }
      
      // After adding all items, fetch the cart to get updated state
      const response = await CartApi.getCart(token);
      setCartItems(response.data.items || []);
      console.log('Cart restored successfully');
    } catch (error) {
      console.error('Error restoring cart items:', error);
    } finally {
      setIsLoading(false);
      // Clear the backup
      localStorage.removeItem(BACKUP_GUEST_CART_KEY);
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

  const addToCart = async (product: Product, size: ProductSize, quantity: number = 1) => {
    // Check if product is already in cart
    const isProductInCart = cartItems.some(item => 
      item.product.id === product.id && item.size === size
    );
    
    if (isProductInCart) {
      // Show toast notification instead of alert
      showToast(`${product.name} (Size: ${size.toUpperCase()}) is already in your cart.`, 'warning');
      return;
    }
    
    // Always set quantity to 1, regardless of what was passed
    quantity = 1;
    
    // For authenticated users, use the API
    if (isAuthenticated && token) {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await CartApi.addToCart(token, product.id, size, quantity);
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
        item => item.product.id === product.id && item.size === size
      );
      
      if (existingItemIndex !== -1) {
        // Show toast notification instead of alert
        showToast(`${product.name} (Size: ${size.toUpperCase()}) is already in your cart.`, 'warning');
        return;
      } else {
        // Add new item with a unique string ID for guest cart items
        newCartItems.push({
          product,
          size,
          quantity, // This will always be 1
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

  const updateQuantity = async (itemId: number | string, quantity: number) => {
    // Since we're restricting users to 1 item per product, we'll only allow removing items
    // If quantity is 0 or less, we'll remove the item
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }
    
    // Otherwise, we'll ignore quantity changes as we're enforcing 1 item per product
    return;
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
        token,
        fetchCart,
        backupGuestCart,
        restoreGuestCart
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