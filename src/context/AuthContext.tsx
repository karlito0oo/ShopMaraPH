import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { API_CONFIG } from '../config';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
    cart_items?: string
  ) => Promise<{ user: User; token: string }>;
  logout: () => Promise<void>;
  validateToken: () => Promise<boolean>;
  migrateGuestCart: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Update API paths to match Laravel routes
const API_URL = API_CONFIG.BASE_URL;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from localStorage on initial load
  useEffect(() => {
    const loadUserAndValidateToken = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
          // Set the user data and token first
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          
          // Validate token only once when app initializes
          const response = await fetch(`${API_URL}/user`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Accept': 'application/json',
            },
            credentials: 'include',
          });
          
          // If token is invalid, clear user data
          if (!response.ok) {
            setUser(null);
            setToken(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            console.log('Token validation failed during initialization');
          } else {
            // If token is valid, update user data if needed
            const data = await response.json();
            if (data.success && data.user) {
              setUser(data.user);
              localStorage.setItem('user', JSON.stringify(data.user));
            }
          }
        }
      } catch (error) {
        console.error('Error loading user or validating token:', error);
        // Clear user data on error
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserAndValidateToken();
  }, []);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Validate token with the backend - now simplified to just check if token exists
  // since we already validated it on initialization
  const validateToken = async (): Promise<boolean> => {
    return !!token; // Just return if we have a token, no additional validation
  };

  // Register a new user
  const register = async (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
    cart_items?: string
  ) => {
    try {
      const body: any = { name, email, password, password_confirmation };
      if (cart_items) body.cart_items = cart_items;
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      
      // Save user and token to state and localStorage
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      // Return the data for immediate use
      return { user: data.user, token: data.token };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Log in a user
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Save user and token to state and localStorage
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Log out a user
  const logout = async () => {
    if (token) {
      try {
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    // Clear user data from state and localStorage
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Migrate guest cart to the authenticated user's cart
  const migrateGuestCart = async (): Promise<boolean> => {
    console.log("migrateGuestCart called, token:", token ? token.substring(0, 10) + "..." : "missing");
    
    if (!token) {
      console.log("No token available, cannot migrate cart");
      return false;
    }
    
    try {
      // Get guest cart from localStorage
      const guestCartKey = 'guest_cart';
      const guestCartString = localStorage.getItem(guestCartKey);
      
      console.log("Guest cart from localStorage:", guestCartString ? "found" : "not found", "Key:", guestCartKey);
      
      if (!guestCartString) return false;
      
      const guestCart = JSON.parse(guestCartString);
      
      console.log("Parsed guest cart:", guestCart.length, "items");
      
      if (!guestCart || !guestCart.length) return false;
      
      // For each item in the guest cart, add it to the user's cart
      for (const item of guestCart) {
        console.log("Adding item to cart:", item.product.id, item.size, item.quantity);
        
        const response = await fetch(`${API_URL}/cart/add`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            product_id: item.product.id,
            size: item.size,
            quantity: item.quantity
          }),
        });
        
        const responseData = await response.json();
        console.log("API response:", responseData.success ? "success" : "failed", responseData);
      }
      
      // Clear the guest cart
      localStorage.removeItem(guestCartKey);
      console.log("Guest cart cleared from localStorage");
      
      return true;
    } catch (error) {
      console.error('Error migrating guest cart:', error);
      return false;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        validateToken,
        migrateGuestCart
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 