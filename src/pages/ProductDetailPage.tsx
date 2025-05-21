import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import type { Product } from '../types/product';
import { getProductById } from '../services/ProductService';

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
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

    const size = product.sizes[0]; // Get the single size
    const availableStock = product.sizeStock[0]?.stock || 0;
    
    // Check if item is in stock
    if (availableStock <= 0) {
      return; // Don't add out-of-stock items
    }

    // Always add quantity of 1
    const quantity = 1;

    // The addToCart function will redirect to login if user is not authenticated
    // If user is authenticated, add to cart and then navigate to cart page
    addToCart(product, size, quantity)
      .then(() => {
        // Only navigate to cart if the addToCart promise resolves
        // This won't happen if the user was redirected to login
        navigate('/cart');
      })
      .catch((err) => {
        // Handle any errors that might occur during addToCart
        console.error('Error adding to cart:', err);
      });
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
  const size = product.sizes[0]; // Get the single size
  const stock = product.sizeStock[0]?.stock || 0;
  const isOutOfStock = stock <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="bg-gray-100 p-4 rounded">
            <div className="aspect-w-1 aspect-h-1 bg-white relative">
              <img 
                src={productImages[currentImageIndex]} 
                alt={product.name}
                className="w-full h-full object-contain"
              />
              
              {/* SOLD Overlay for out of stock items */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center">
                  <span className="text-black text-4xl font-bold font-como">SOLD</span>
                </div>
              )}
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
                {product.isNewArrival && (
                  <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                    New Arrival
                  </div>
                )}
                {product.isSale && (
                  <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    Sale
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2 py-1 rounded mr-2">
                Size: {size.toUpperCase()}
              </span>
              <span className={`text-sm font-medium px-2 py-1 rounded ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                {isOutOfStock ? 'Sold' : ``}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xl font-semibold">₱{product.price.toFixed(2)}</p>
            </div>
          </div>

          {/* Product Description */}
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Description</h2>
            <p className="text-gray-700">{product.description || 'No description available.'}</p>
          </div>

          {/* Care Instructions */}
          {product.careInstructions && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">Before You Buy</h2>
              <div className="text-gray-700 whitespace-pre-line">{product.careInstructions}</div>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-3 px-4 rounded-md font-medium ${
              isOutOfStock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isOutOfStock ? 'Sold' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage; 