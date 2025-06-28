/**
 * ApiService.ts
 * Central service for all API calls
 */

import { API_CONFIG } from '../config';
import type { CartItem } from '../types/checkout';

// Get API base URL from configuration
const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Makes a request to the API with proper headers and error handling
 */
export const apiRequest = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  headers?: Record<string, string>,
  isFormData = false
) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // Prepare headers
  const requestHeaders: HeadersInit = {
    ...headers,
    'Accept': 'application/json'
  };

  // If the data is not FormData, set the Content-Type to application/json
  if (!isFormData && method !== 'GET') {
    requestHeaders['Content-Type'] = 'application/json';
  }

  // Prepare request options
  const options: RequestInit = {
    method,
    headers: requestHeaders,
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
      if(responseData.errors){
        const allErrors = Object.values(responseData.errors)
  .flat()
  .join('; ');
        throw new Error(allErrors ?? "");
      }
      if(responseData.message){
        throw new Error(responseData.message);
      }
      throw new Error('Something went wrong');
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
    apiRequest('/logout', 'POST', null, { 'Authorization': `Bearer ${token}` }),
  
  getUser: (token: string) => 
    apiRequest('/user', 'GET', null, { 'Authorization': `Bearer ${token}` }),
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
    apiRequest('/products', 'POST', productData, { 'Authorization': `Bearer ${token}` }, true),
  
  updateProduct: (token: string, id: string | number, productData: FormData) => {
    // Add _method=PUT for method spoofing
    productData.append('_method', 'PUT');
    return apiRequest(`/products/${id}`, 'POST', productData, { 'Authorization': `Bearer ${token}` }, true);
  },
  
  deleteProduct: (token: string, id: string | number) => 
    apiRequest(`/products/${id}`, 'DELETE', null, { 'Authorization': `Bearer ${token}` }),
  
  restockProduct: (token: string, id: string | number, restockData: any) => 
    apiRequest(`/products/${id}/restock`, 'POST', restockData, { 'Authorization': `Bearer ${token}` }),
};

/**
 * Cart related API endpoints
 */

interface HoldProductsResponse {
  success: boolean;
  message: string;
  hold_duration: number;
  data?: {
    items?: CartItem[];
  };
}

export const CartApi = {
  getCart: (headers: Record<string, string>) => {
    console.log(headers);
    const isGuest = headers['X-Guest-ID'];
    const endpoint = isGuest ? '/guest/cart' : '/cart';
    return apiRequest(endpoint, 'GET', null, headers);
  },
  
  addToCart: (headers: Record<string, string>, productId: number | string) => {
    const isGuest = headers['X-Guest-ID'];
    const endpoint = isGuest ? '/guest/cart/add' : '/cart/add';
    return apiRequest(endpoint, 'POST', { product_id: productId }, headers);
  },
  
  removeFromCart: (headers: Record<string, string>, cartItemId: number | string) => {
    const isGuest = headers['X-Guest-ID'];
    const endpoint = isGuest ? '/guest/cart/remove' : '/cart/remove';
    return apiRequest(endpoint, 'POST', { cart_item_id: cartItemId }, headers);
  },
  
  clearCart: (headers: Record<string, string>) => {
    const isGuest = headers['X-Guest-ID'];
    const endpoint = isGuest ? '/guest/cart/clear' : '/cart/clear';
    return apiRequest(endpoint, 'POST', null, headers);
  },

  putProductsOnHold: (headers: Record<string, string>): Promise<HoldProductsResponse> => {
    const isGuest = headers['X-Guest-ID'];
    const endpoint = isGuest ? '/guest/cart/hold' : '/cart/hold';
    return apiRequest(endpoint, 'POST', null, headers);
  },
};

/**
 * User Profile related API endpoints
 */
export const ProfileApi = {
  getProfile: (token: string) => 
    apiRequest('/profile', 'GET', null, { 'Authorization': `Bearer ${token}` }),
  
  updateProfile: (token: string, profileData: any) => 
    apiRequest('/profile', 'POST', profileData, { 'Authorization': `Bearer ${token}` }),
};

/**
 * Order related API endpoints
 */
export const OrderApi = {
  // User order endpoints
  createOrder: (token: string, orderData: FormData) => 
    apiRequest('/orders', 'POST', orderData, { 'Authorization': `Bearer ${token}` }, true),
  
  // Guest checkout does not require token
  createGuestOrder: (orderData: FormData) => 
    apiRequest('/guest-orders', 'POST', orderData, {}, true),
  
  getUserOrders: (token: string) => 
    apiRequest('/orders', 'GET', null, { 'Authorization': `Bearer ${token}` }),
  
  getUserOrder: (token: string, orderId: number | string) => 
    apiRequest(`/orders/${orderId}`, 'GET', null, { 'Authorization': `Bearer ${token}` }),
  
  // Admin order endpoints
  getAllOrders: (token: string, status?: string) => {
    const queryParams = status ? `?status=${status}` : '';
    return apiRequest(`/admin/orders${queryParams}`, 'GET', null, { 'Authorization': `Bearer ${token}` });
  },
  
  getOrder: (token: string, orderId: number | string) => 
    apiRequest(`/admin/orders/${orderId}`, 'GET', null, { 'Authorization': `Bearer ${token}` }),
  
  updateOrderStatus: (token: string, orderId: number | string, status: string, adminNotes?: string) => 
    apiRequest(`/admin/orders/${orderId}/status`, 'POST', { status, admin_notes: adminNotes }, { 'Authorization': `Bearer ${token}` }),
  
  getGuestOrders: (guestId: string) => 
    apiRequest(`/guest-orders/${guestId}`, 'GET', null, {}),
};

/**
 * Hero Carousel related API endpoints
 */
export const HeroCarouselApi = {
  // Admin endpoints
  getAll: (token: string) => apiRequest('/admin/hero-carousel', 'GET', null, { 'Authorization': `Bearer ${token}` }),
  create: (token: string, data: FormData) => apiRequest('/admin/hero-carousel', 'POST', data, { 'Authorization': `Bearer ${token}` }, true),
  update: (token: string, id: number, data: FormData) => {
    data.append('_method', 'PUT');
    return apiRequest(`/admin/hero-carousel/${id}`, 'POST', data, { 'Authorization': `Bearer ${token}` }, true);
  },
  delete: (token: string, id: number) => apiRequest(`/admin/hero-carousel/${id}`, 'DELETE', null, { 'Authorization': `Bearer ${token}` }),
  updateInterval: (token: string, interval: number) => apiRequest('/admin/hero-carousel/interval', 'POST', { interval }, { 'Authorization': `Bearer ${token}` }),
  // Public endpoint
  getPublic: () => apiRequest('/hero-carousel', 'GET'),
};

/**
 * User Management (Admin) API endpoints
 */
export const AdminUserApi = {
  getAllUsers: (token: string) =>
    apiRequest('/admin/users', 'GET', null, { 'Authorization': `Bearer ${token}` }),

  changeUserPassword: (token: string, userId: number, password: string, password_confirmation: string) =>
    apiRequest(`/admin/users/${userId}/change-password`, 'POST', { password, password_confirmation }, { 'Authorization': `Bearer ${token}` }),
};

/**
 * Guest Profile related API endpoints
 */
export const GuestProfileApi = {
  getProfile: (headers: Record<string, string>) => 
    apiRequest('/guest/profile', 'GET', null, headers),
  
  saveProfile: (headers: Record<string, string>, profileData: any) => 
    apiRequest('/guest/profile', 'POST', profileData, headers),
}; 