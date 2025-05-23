import type { Product } from '../types/product';
import { API_CONFIG } from '../config';

const API_URL = API_CONFIG.BASE_URL;

/**
 * Fetches all products from the backend
 */
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_URL}/products`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Fetches a single product by ID
 */
export const getProductById = async (productId: string | number): Promise<Product> => {
  try {
    const response = await fetch(`${API_URL}/products/${productId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw error;
  }
};

/**
 * Fetches products by category
 */
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    // For categories, we'll fetch all products and filter on the client side
    // In a real app, you might have a dedicated API endpoint for filtering
    const products = await getAllProducts();
    return products.filter(product => product.category === category);
  } catch (error) {
    console.error(`Error fetching products for category ${category}:`, error);
    throw error;
  }
};

/**
 * Fetches all best-seller products
 * @deprecated This function is no longer used as the Best Seller feature has been removed
 */
export const getBestSellerProducts = async (): Promise<Product[]> => {
  try {
    const products = await getAllProducts();
    return products.filter(product => product.isBestSeller);
  } catch (error) {
    console.error('Error fetching best seller products:', error);
    throw error;
  }
};

/**
 * Fetches all new arrival products
 */
export const getNewArrivalProducts = async (): Promise<Product[]> => {
  try {
    const products = await getAllProducts();
    return products.filter(product => product.isNewArrival || product.category === 'new_arrival');
  } catch (error) {
    console.error('Error fetching new arrival products:', error);
    throw error;
  }
}; 