import type { Product } from '../types/product';
import { ProductApi } from './ApiService';

/**
 * Fetches all products from the backend
 */
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const response = await ProductApi.getAllProducts();
    // Ensure price is a number
    return (response.data || []).map((product: any) => ({
      ...product,
      price: Number(product.price)
    }));
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
    const response = await ProductApi.getProductById(productId);
    // Ensure price is a number
    return {
      ...response.data,
      price: Number(response.data.price)
    };
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw error;
  }
};

/**
 * Fetches all new arrival products
 */
export const getNewArrivalProducts = async (): Promise<Product[]> => {
  try {
    const products = await getAllProducts();
    return products.filter(product => product.isNewArrival);
  } catch (error) {
    console.error('Error fetching new arrival products:', error);
    throw error;
  }
};

/**
 * Fetches all sale products
 */
export const getSaleProducts = async (): Promise<Product[]> => {
  try {
    const products = await getAllProducts();
    return products.filter(product => product.isSale);
  } catch (error) {
    console.error('Error fetching sale products:', error);
    throw error;
  }
}; 