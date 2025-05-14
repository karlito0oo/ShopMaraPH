import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import type { Product, ProductSize } from '../types/product';
import { getProductById } from '../services/ProductService';

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      try {
        setIsLoading(true);
        setError('');
        setLoadError(null);
        const fetchedProduct = await getProductById(productId);
        setProduct(fetchedProduct);
        setCurrentImageIndex(0); // Reset to first image when product changes
      } catch (err) {
        console.error(`Error fetching product ${productId}:`, err);
        setLoadError('Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;

    if (!selectedSize) {
      setError('Please select a size');
      return;
    }

    // Get available stock for selected size
    const availableStock = getStockForSize(product, selectedSize);
    
    // Ensure quantity doesn't exceed available stock
    if (quantity > availableStock) {
      setError(`Sorry, only ${availableStock} items available in this size`);
      return;
    }

    addToCart(product, selectedSize, quantity);
    navigate('/cart');
  };

  const handleSizeChange = (size: ProductSize) => {
    setSelectedSize(size);
    setError('');
    
    // Reset quantity to 1 or max available stock if less than 1
    const stockForSize = getStockForSize(product, size);
    setQuantity(Math.min(1, stockForSize));
  };

  // Get stock for a specific size
  const getStockForSize = (product: Product | null, size: ProductSize): number => {
    if (!product) return 0;
    
    const sizeStockItem = product.sizeStock.find(item => item.size === size);
    return sizeStockItem ? sizeStockItem.stock : 0;
  };

  // Get total stock across all sizes
  const getTotalStock = (product: Product | null): number => {
    if (!product) return 0;
    return product.sizeStock.reduce((total, item) => total + item.stock, 0);
  };

  // Get product images array or create one from the single image
  const getProductImages = () => {
    if (!product) return [];
    
    // Start with the main product image
    const allImages = [product.image];
    
    // Add any additional images if they exist
    if (product.images && product.images.length > 0) {
      // Avoid duplicating the main image if it also appears in the images array
      const additionalImages = product.images.filter(img => img !== product.image);
      allImages.push(...additionalImages);
    }
    
    return allImages;
  };

  // Handle thumbnail click to change main image
  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Loading Product</h1>
          <p>Please wait while we fetch the product details...</p>
        </div>
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-red-500 mb-4">{loadError}</p>
          <Link 
            to="/products" 
            className="inline-block border border-black px-8 py-3 hover:bg-black hover:text-white transition-colors no-underline text-black"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const productImages = getProductImages();
  const selectedSizeStock = selectedSize ? getStockForSize(product, selectedSize) : 0;
  const totalStock = getTotalStock(product);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="bg-gray-100 p-4 rounded">
            <div className="aspect-w-1 aspect-h-1 bg-white">
              <img 
                src={productImages[currentImageIndex]} 
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          
          {/* Image Thumbnails */}
          {productImages.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {productImages.map((img, index) => (
                <button 
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={`flex-shrink-0 w-16 h-16 border-2 rounded overflow-hidden ${
                    currentImageIndex === index 
                      ? 'border-black' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <div className="flex space-x-2">
                {product.isBestSeller && (
                  <div className="bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
                    Best Seller
                  </div>
                )}
                {product.isNewArrival && (
                  <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                    New Arrival
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-gray-600 text-sm capitalize mr-2">Category: {product.category}</span>
            </div>
            <div className="mt-4">
              <p className="text-xl font-semibold">₱{product.price.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">Total Stock: {totalStock} items</p>
            </div>
          </div>

          {/* Size Selector */}
          <div className="mb-6">
            <h2 className="text-sm font-medium mb-2">Select Size</h2>
            <div className="flex flex-wrap gap-2">
              {product.sizes.filter(size => size !== 'all').map((size) => {
                const sizeStock = getStockForSize(product, size);
                const isOutOfStock = sizeStock <= 0;
                
                return (
                  <button
                    key={size}
                    onClick={() => !isOutOfStock && handleSizeChange(size)}
                    disabled={isOutOfStock}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      selectedSize === size
                        ? 'bg-black text-white border-2 border-black'
                        : isOutOfStock
                          ? 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed'
                          : 'bg-white text-black border-2 border-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {size.toUpperCase()} {isOutOfStock 
                      ? '(Out of Stock)' 
                      : `(${sizeStock} left)`}
                  </button>
                );
              })}
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            
            {selectedSize && (
              <div className="mt-3">
                <p className="text-sm text-gray-700">
                  {selectedSizeStock > 0
                    ? `${selectedSizeStock} items available in size ${selectedSize.toUpperCase()}`
                    : `Size ${selectedSize.toUpperCase()} is currently out of stock`
                  }
                </p>
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <h2 className="text-sm font-medium mb-2">Quantity</h2>
            <div className="flex items-center">
              <button 
                className="w-10 h-10 flex items-center justify-center rounded-l border-2 border-gray-300 bg-white text-black hover:border-gray-500 font-medium"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                disabled={!selectedSize || selectedSizeStock <= 0}
              >
                -
              </button>
              <span className="w-12 h-10 flex items-center justify-center border-t-2 border-b-2 border-gray-300 bg-white">
                {quantity}
              </span>
              <button 
                className="w-10 h-10 flex items-center justify-center rounded-r border-2 border-gray-300 bg-white text-black hover:border-gray-500 font-medium"
                onClick={() => setQuantity(prev => Math.min(selectedSizeStock, prev + 1))}
                disabled={!selectedSize || quantity >= selectedSizeStock || selectedSizeStock <= 0}
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedSize || selectedSizeStock <= 0}
            className={`w-full px-4 py-3 rounded font-medium transition-colors ${
              !selectedSize || selectedSizeStock <= 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {!selectedSize 
              ? 'Please Select a Size' 
              : selectedSizeStock <= 0 
                ? 'Out of Stock' 
                : 'Add to Cart'}
          </button>

          {/* Product Description */}
          <div className="mt-8">
            <h2 className="text-lg font-medium mb-2">Product Description</h2>
            <p className="text-gray-600">
              {product.description || 'Premium quality t-shirt featuring a unique design. Made with 100% organic cotton for maximum comfort and durability. Machine washable.'}
            </p>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-1">Care Instructions:</h3>
              <div className="text-sm text-gray-600">
                {product.careInstructions ? (
                  <div dangerouslySetInnerHTML={{ __html: product.careInstructions }} />
                ) : (
                  <ul className="list-disc list-inside">
                    <li>Machine wash cold</li>
                    <li>Tumble dry low</li>
                    <li>Do not bleach</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage; 