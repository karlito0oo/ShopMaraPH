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
  onhold_by_id?: string | number;
  onhold_by_type?: 'user' | 'guest';
}

export const filterProductsBySize = (
  products: Product[],
  size: ProductSize = 'all',
  searchKeyword: string = '',
  hideSoldProducts: boolean = false
): Product[] => {
  let filteredProducts = [...products];

  // Filter by size if not 'all'
  if (size !== 'all') {
    filteredProducts = filteredProducts.filter(product => product.size === size);
  }

  // Filter by search keyword
  if (searchKeyword) {
    const keyword = searchKeyword.toLowerCase();
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(keyword) ||
      (product.description?.toLowerCase().includes(keyword) ?? false)
    );
  }

  // Filter out sold products if hideSoldProducts is true
  if (hideSoldProducts) {
    filteredProducts = filteredProducts.filter(product => product.status !== 'Sold');
  }

  // Sort products: Available/OnHold first, then Sold
  return filteredProducts.sort((a, b) => {
    if (a.status === 'Sold' && b.status !== 'Sold') return 1;
    if (a.status !== 'Sold' && b.status === 'Sold') return -1;
    return 0;
  });
};

export const filterProducts = (
  products: Product[],
  category: ProductCategory = 'all',
  size: ProductSize = 'all',
  searchKeyword: string = '',
  showNewOnly: boolean = false,
  hideSoldProducts: boolean = false
): Product[] => {
  let filteredProducts = [...products];

  // Filter by category if not 'all'
  if (category !== 'all') {
    filteredProducts = filteredProducts.filter(product => product.category === category);
  }

  // Filter by size if not 'all'
  if (size !== 'all') {
    filteredProducts = filteredProducts.filter(product => product.size === size);
  }

  // Filter by search keyword
  if (searchKeyword) {
    const keyword = searchKeyword.toLowerCase();
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(keyword) ||
      (product.description?.toLowerCase().includes(keyword) ?? false)
    );
  }

  // Filter by new arrivals if showNewOnly is true
  if (showNewOnly) {
    filteredProducts = filteredProducts.filter(product => product.isNewArrival);
  }

  // Filter out sold products if hideSoldProducts is true
  if (hideSoldProducts) {
    filteredProducts = filteredProducts.filter(product => product.status !== 'Sold');
  }

  // Sort products: Available/OnHold first, then Sold
  return filteredProducts.sort((a, b) => {
    if (a.status === 'Sold' && b.status !== 'Sold') return 1;
    if (a.status !== 'Sold' && b.status === 'Sold') return -1;
    return 0;
  });
}; 