export type ProductSize = 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | 'xxxlarge' | 'all';
export type ProductCategory = 'all' | 'new_arrival' | 'sale' | 'men' | 'women';

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
  isSale?: boolean;
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
  showNewOnly: boolean = false,
  showSaleOnly: boolean = false
): Product[] => {
  return products.filter(product => {
    // If category is 'new_arrival', we'll show only new arrival products
    // If showNewOnly is true, we'll also filter for new arrival products
    const isNewArrivalProduct = product.isNewArrival || product.category === 'new_arrival';
    
    // If category is 'sale', we'll show only sale products
    // If showSaleOnly is true, we'll also filter for sale products
    const isSaleProduct = product.isSale || product.category === 'sale';
    
    // Category match logic: 
    // - If 'all', show everything unless showNewOnly or showSaleOnly is true
    // - If 'new_arrival', match with isNewArrivalProduct
    // - If 'sale', match with isSaleProduct
    // - If 'men' or 'women', match with the product's category
    const categoryMatch = 
      (category === 'all' && (!showNewOnly || isNewArrivalProduct) && (!showSaleOnly || isSaleProduct)) || 
      (category === 'new_arrival' && isNewArrivalProduct) ||
      (category === 'sale' && isSaleProduct) ||
      (category === product.category);
    
    const sizeMatch = size === 'all' || product.sizes.includes(size);
    const keywordMatch = searchKeyword === '' || 
      product.name.toLowerCase().includes(searchKeyword.toLowerCase());
    
    return categoryMatch && sizeMatch && keywordMatch;
  });
}; 