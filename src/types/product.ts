export type ProductCategory = 'men' | 'women' | 'all' | 'new_arrival' | 'sale';
export type ProductSize = 'all' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';

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
  isNewArrival?: boolean;
  isSale?: boolean;
  status: 'Available' | 'Sold' | 'OnHold';
  size?: ProductSize;
}

export const filterProductsBySize = (
  products: Product[],
  size: ProductSize,
  searchKeyword: string = ''
): Product[] => {
  return products.filter(product => {
    const sizeMatch = size === 'all' || product.size === size;
    const keywordMatch = searchKeyword === '' || 
      product.name.toLowerCase().includes(searchKeyword.toLowerCase());
    
    return sizeMatch && keywordMatch;
  });
};

export const filterProducts = (
  products: Product[], 
  category: ProductCategory,
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
    
    const keywordMatch = searchKeyword === '' || 
      product.name.toLowerCase().includes(searchKeyword.toLowerCase());
    
    return categoryMatch && keywordMatch;
  });
}; 