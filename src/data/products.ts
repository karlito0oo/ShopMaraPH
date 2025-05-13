import type { Product } from '../types/product';

export const products: Product[] = [
  // Men's products
  { 
    id: 'm1', 
    name: "Classic Black Tee", 
    price: 49.99, 
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
    ],
    category: "men",
    sizes: ['small', 'medium', 'large', 'xlarge']
  },
  { 
    id: 'm2', 
    name: "White Essentials Tee", 
    price: 39.99, 
    image: "https://images.unsplash.com/photo-1622445275576-721325763afe?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", 
    category: "men",
    sizes: ['small', 'medium', 'large'] 
  },
  { 
    id: 'm3', 
    name: "Striped Cotton Tee", 
    price: 45.99, 
    image: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", 
    category: "men",
    sizes: ['medium', 'large', 'xlarge'] 
  },
  { 
    id: 'm4', 
    name: "Navy Blue Tee", 
    price: 39.99, 
    image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", 
    category: "men",
    sizes: ['small', 'medium', 'large', 'xlarge'] 
  },
  
  // Women's products
  { 
    id: 'w1', 
    name: "Basic White Tee", 
    price: 39.99, 
    image: "https://images.unsplash.com/photo-1554568218-0f1715e72254?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1554568218-0f1715e72254?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
    ],
    category: "women",
    sizes: ['small', 'medium', 'large'] 
  },
  { 
    id: 'w2', 
    name: "V-Neck Tee", 
    price: 44.99, 
    image: "https://images.unsplash.com/photo-1503185912284-5271ff81b9a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", 
    category: "women",
    sizes: ['small', 'medium']
  },
  { 
    id: 'w3', 
    name: "Graphic Print Tee", 
    price: 49.99, 
    image: "https://images.unsplash.com/photo-1554568218-22fb0944c8cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", 
    category: "women",
    sizes: ['medium', 'large', 'xlarge'] 
  },
  { 
    id: 'w4', 
    name: "Crop Top Tee", 
    price: 42.99, 
    image: "https://images.unsplash.com/photo-1529502669403-c073b74fcefb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", 
    category: "women",
    sizes: ['small', 'medium'] 
  },
  
  // New arrivals
  { 
    id: 'n1', 
    name: "Limited Edition Graphic Tee", 
    price: 59.99, 
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1559526324-593bc073d938?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1561365452-adb940139ffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1544642899-f0d6e5f6ed6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
    ],
    category: "new", 
    isBestSeller: true,
    sizes: ['medium', 'large', 'xlarge']
  },
  { 
    id: 'n2', 
    name: "Organic Cotton Tee", 
    price: 49.99, 
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", 
    category: "new",
    sizes: ['small', 'medium', 'large']
  },
  { 
    id: 'n3', 
    name: "Designer Collaboration Tee", 
    price: 69.99, 
    image: "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
    ],
    category: "new", 
    isBestSeller: true,
    sizes: ['small', 'medium', 'large', 'xlarge']
  },
  { 
    id: 'n4', 
    name: "Sustainable Print Tee", 
    price: 54.99, 
    image: "https://images.unsplash.com/photo-1598032895397-b9472444bf93?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", 
    category: "new",
    sizes: ['medium', 'large']
  },
]; 