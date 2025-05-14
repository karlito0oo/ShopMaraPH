export type ProductSize = 'small' | 'medium' | 'large' | 'xlarge' | 'all';
export type ProductCategory = 'all' | 'new' | 'women' | 'men';

export interface SizeStock {
  size: ProductSize;
  stock: number;
}

export interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string;
  images?: string[];  // Optional array of additional images
  category: ProductCategory;
  sizes: ProductSize[];
  isBestSeller?: boolean;
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
  bestSellerOnly: boolean = false,
  keyword: string = ''
): Product[] => {
  return products.filter(product => {
    const categoryMatch = category === 'all' || product.category === category;
    const sizeMatch = size === 'all' || product.sizes.includes(size);
    const bestSellerMatch = bestSellerOnly ? product.isBestSeller === true : true;
    const keywordMatch = keyword === '' || 
      product.name.toLowerCase().includes(keyword.toLowerCase());
    
    return categoryMatch && sizeMatch && bestSellerMatch && keywordMatch;
  });
}; 