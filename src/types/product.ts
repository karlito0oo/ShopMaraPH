export type ProductSize = 'small' | 'medium' | 'large' | 'xlarge' | 'all';
export type ProductCategory = 'all' | 'new' | 'women' | 'men';

export interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string;
  images?: string[];  // Optional array of additional images
  category: ProductCategory;
  sizes: ProductSize[];
  isBestSeller?: boolean;
}

export const getAvailableSizes = (product: Product, selectedSize: ProductSize): ProductSize[] => {
  if (selectedSize === 'all') {
    return product.sizes;
  }
  return product.sizes.filter(size => size === selectedSize || size === 'all');
};

export const filterProducts = (
  products: Product[], 
  category: ProductCategory, 
  size: ProductSize,
  bestSellerOnly: boolean = false
): Product[] => {
  return products.filter(product => {
    const categoryMatch = category === 'all' || product.category === category;
    const sizeMatch = size === 'all' || product.sizes.includes(size);
    const bestSellerMatch = bestSellerOnly ? product.isBestSeller === true : true;
    return categoryMatch && sizeMatch && bestSellerMatch;
  });
}; 