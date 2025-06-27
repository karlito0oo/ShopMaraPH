import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../types/product';
import { useAuth } from './AuthContext';
import { CartApi, ProductApi } from '../services/ApiService';
import { useToast } from './ToastContext';

interface CartItem {
  product: Product;
  id?: number | string; // Cart item ID from the database
}

interface HoldProductsResponse {
  success: boolean;
  message: string;
  hold_duration: number;
  hold_expiry_time_in_seconds: number;
  is_hold_expired: boolean;
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
  holdProducts: () => Promise<HoldProductsResponse>;
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
    setIsLoading(true);
    setError(null);
    
    try {
      // Check product availability first
      const productResponse = await ProductApi.getProductById(product.id);
      const currentProduct = productResponse.data;
      
      if (currentProduct.status !== 'Available') {
        throw new Error(
          currentProduct.status === 'Sold' 
            ? 'This product is no longer available as it has been sold.'
            : 'This product is currently on hold by another customer.'
        );
      }

      const headers = getHeaders();
      await CartApi.addToCart(headers, product.id);
      await fetchCart(); // Refresh cart after adding
      showToast('Product added to cart!', 'success');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to add product to cart';
      showToast(errorMessage, 'error');
      setError(errorMessage);
      throw error;
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

  const holdProducts = async (): Promise<HoldProductsResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await CartApi.putProductsOnHold(getHeaders());
      if (response.data?.items) {
        setCartItems(response.data.items);
      }
      fetchCart();
      return {
        success: response.success,
        message: response.message,
        hold_duration: response.hold_duration,
        hold_expiry_time_in_seconds: response.hold_expiry_time_in_seconds,
        is_hold_expired: response.is_hold_expired
      };
    } catch (error) {
      console.error('Error holding products:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while holding products');
      showToast('Some items in your cart are no longer available. Please remove them before proceeding to checkout.', 'error');
      throw error;
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
        holdProducts
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