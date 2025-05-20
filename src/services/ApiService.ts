/**
 * ApiService.ts
 * Central service for all API calls
 */

import { API_CONFIG } from '../config';

// Get API base URL from configuration
const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Makes a request to the API with proper headers and error handling
 */
export const apiRequest = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  token?: string | null,
  isFormData = false
) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // Prepare headers
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If the data is not FormData, set the Content-Type to application/json
  if (!isFormData && method !== 'GET') {
    headers['Content-Type'] = 'application/json';
  }
  
  headers['Accept'] = 'application/json';

  // Prepare request options
  const options: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  // Add body for non-GET requests
  if (method !== 'GET' && data) {
    options.body = isFormData ? data : JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    
    // Parse the JSON response
    const responseData = await response.json();
    
    // If the response is not OK, throw an error
    if (!response.ok) {
      throw new Error(responseData.message || 'Something went wrong');
    }
    
    return responseData;
  } catch (error) {
    console.error(`API Request Error (${endpoint}):`, error);
    throw error;
  }
};

// Export API endpoints functions by category

/**
 * Auth related API endpoints
 */
export const AuthApi = {
  login: (email: string, password: string) => 
    apiRequest('/login', 'POST', { email, password }),
  
  register: (name: string, email: string, password: string, password_confirmation: string) => 
    apiRequest('/register', 'POST', { name, email, password, password_confirmation }),
  
  logout: (token: string) => 
    apiRequest('/logout', 'POST', null, token),
  
  getUser: (token: string) => 
    apiRequest('/user', 'GET', null, token),
};

/**
 * Product related API endpoints
 */
export const ProductApi = {
  getAllProducts: (filters?: any) => {
    // Convert filters object to query parameters
    const queryParams = filters 
      ? `?${Object.entries(filters)
          .filter(([_, value]) => value !== undefined && value !== null && value !== '')
          .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
          .join('&')}` 
      : '';
    
    return apiRequest(`/products${queryParams}`);
  },
  
  getProductById: (id: string | number) => 
    apiRequest(`/products/${id}`),
  
  createProduct: (token: string, productData: FormData) => 
    apiRequest('/products', 'POST', productData, token, true),
  
  updateProduct: (token: string, id: string | number, productData: FormData) => {
    // Add _method=PUT for method spoofing
    productData.append('_method', 'PUT');
    return apiRequest(`/products/${id}`, 'POST', productData, token, true);
  },
  
  deleteProduct: (token: string, id: string | number) => 
    apiRequest(`/products/${id}`, 'DELETE', null, token),
  
  restockProduct: (token: string, id: string | number, restockData: any) => 
    apiRequest(`/products/${id}/restock`, 'POST', restockData, token),
};

/**
 * Cart related API endpoints
 */
export const CartApi = {
  getCart: (token: string) => 
    apiRequest('/cart', 'GET', null, token),
  
  addToCart: (token: string, productId: number | string, size: string, quantity: number) => 
    apiRequest('/cart/add', 'POST', { product_id: productId, size, quantity }, token),
  
  updateCartItem: (token: string, cartItemId: number, quantity: number) => 
    apiRequest('/cart/update', 'POST', { cart_item_id: cartItemId, quantity }, token),
  
  removeFromCart: (token: string, cartItemId: number) => 
    apiRequest('/cart/remove', 'POST', { cart_item_id: cartItemId }, token),
  
  clearCart: (token: string) => 
    apiRequest('/cart/clear', 'POST', null, token),
};

/**
 * User Profile related API endpoints
 */
export const ProfileApi = {
  getProfile: (token: string) => 
    apiRequest('/profile', 'GET', null, token),
  
  updateProfile: (token: string, profileData: any) => 
    apiRequest('/profile', 'POST', profileData, token),
};

/**
 * Order related API endpoints
 */
export const OrderApi = {
  // User order endpoints
  createOrder: (token: string, orderData: FormData) => 
    apiRequest('/orders', 'POST', orderData, token, true),
  
  // Guest checkout does not require token
  createGuestOrder: (orderData: FormData) => 
    apiRequest('/guest-orders', 'POST', orderData, null, true),
  
  getUserOrders: (token: string) => 
    apiRequest('/orders', 'GET', null, token),
  
  getUserOrder: (token: string, orderId: number | string) => 
    apiRequest(`/orders/${orderId}`, 'GET', null, token),
  
  // Admin order endpoints
  getAllOrders: (token: string, status?: string) => {
    const queryParams = status ? `?status=${status}` : '';
    return apiRequest(`/admin/orders${queryParams}`, 'GET', null, token);
  },
  
  getOrder: (token: string, orderId: number | string) => 
    apiRequest(`/admin/orders/${orderId}`, 'GET', null, token),
  
  updateOrderStatus: (token: string, orderId: number | string, status: string, adminNotes?: string) => 
    apiRequest(`/admin/orders/${orderId}/status`, 'POST', { status, admin_notes: adminNotes }, token),
}; 