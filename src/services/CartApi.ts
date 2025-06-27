import type { Product } from '../types/product';
import type { CartItem } from '../types/checkout';
import axios from 'axios';

interface CartResponse {
  success: boolean;
  message?: string;
  data: {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
  };
}

interface HoldProductsResponse {
  success: boolean;
  message: string;
  hold_duration: number;
}

const CartApi = {
  getCart: async (headers: any): Promise<CartResponse> => {
    const response = await axios.get('/api/cart', { headers });
    return response.data;
  },

  addToCart: async (productId: number | string, headers: any): Promise<CartResponse> => {
    const response = await axios.post('/api/cart/add', { product_id: productId }, { headers });
    return response.data;
  },

  removeFromCart: async (itemId: number | string, headers: any): Promise<CartResponse> => {
    const response = await axios.post('/api/cart/remove', { item_id: itemId }, { headers });
    return response.data;
  },

  clearCart: async (headers: any): Promise<CartResponse> => {
    const response = await axios.post('/api/cart/clear', {}, { headers });
    return response.data;
  },

  putProductsOnHold: async (headers: any): Promise<HoldProductsResponse> => {
    const response = await axios.post('/api/cart/hold', {}, { headers });
    return response.data;
  },
};

export default CartApi; 