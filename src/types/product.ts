export type ProductSize = 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | 'xxxlarge' | 'all';
export type ProductCategory = 'all' | 'new_arrival' | 'men' | 'women';

export interface SizeStock {
  size: ProductSize;
  stock: number;
}

export interface Product {
  id: string | number;
  sku?: string;  // SKU (Stock Keeping Unit) identifier
  name: string;
  price: number;
  description?: string;
  careInstructions?: string;
  image: string;
  images?: string[];  // Optional array of additional images
  category: ProductCategory;
  sizes: ProductSize[];
  isBestSeller?: boolean; // DEPRECATED: No longer used in UI
  isNewArrival?: boolean;
  sizeStock: SizeStock[];  // Size-specific stock quantities (now required)
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
  searchKeyword: string = '',
  showNewOnly: boolean = false
): Product[] => {
  return products.filter(product => {
    // If category is 'new_arrival', we'll show only new arrival products
    // If showNewOnly is true, we'll also filter for new arrival products
    const isNewArrivalProduct = product.isNewArrival || product.category === 'new_arrival';
    
    // Category match logic: 
    // - If 'all', show everything unless showNewOnly is true
    // - If 'new_arrival', match with isNewArrivalProduct
    // - If 'men' or 'women', match with the product's category
    const categoryMatch = 
      (category === 'all' && (!showNewOnly || isNewArrivalProduct)) || 
      (category === 'new_arrival' && isNewArrivalProduct) ||
      (category === product.category);
    
    const sizeMatch = size === 'all' || product.sizes.includes(size);
    const keywordMatch = searchKeyword === '' || 
      product.name.toLowerCase().includes(searchKeyword.toLowerCase());
    
    return categoryMatch && sizeMatch && keywordMatch;
  });
}; 