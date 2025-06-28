import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import type { Product } from '../types/product';
import { ProductApi } from '../services/ApiService';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, isInCart } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
       
        const data = await ProductApi.getProductById(id || '');
        setProduct(data.data);
      } catch (error) {
        console.error('Error:', error);
        setLoadError('Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || product.status !== 'Available') return;

    try {
      setIsAddingToCart(true);
      await addToCart(product);
      showToast('Product added to cart!', 'success');
    } catch (error) {
      console.error('Error:', error);
      showToast('Failed to add product to cart', 'error');
    } finally {
      setIsAddingToCart(false);
    }
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          {/* Main Image */}
          <div className="relative aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={productImages[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {(product.status === 'Sold' || product.status === 'OnHold') && (
              <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center">
                <span className={`text-2xl font-bold font-como ${product.status === 'Sold' ? 'text-black' : 'text-yellow-800'}`}>
                  {product.status === 'Sold' ? 'SOLD' : 'ON HOLD'}
                </span>
              </div>
            )}
          </div>
          
          {/* Thumbnails */}
          {productImages.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                    currentImageIndex === index ? 'border-black' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
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
            <div className="mt-2">
              <span className={`text-sm font-medium px-2 py-1 rounded ${
                product.status === 'Sold' ? 'text-red-600' : 
                product.status === 'OnHold' ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {product.status}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xl font-semibold">₱{Number(product.price).toFixed(2)}</p>
            </div>
          </div>

          {/* Product Description */}
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Description</h2>
            <div 
              className="text-gray-700 prose prose-sm"
              dangerouslySetInnerHTML={{ __html: product.description || 'No description available.' }}
            />
          </div>

          {/* Care Instructions */}
          {product.careInstructions && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">Before You Buy</h2>
              <div 
                className="text-gray-700 prose prose-sm"
                dangerouslySetInnerHTML={{ __html: product.careInstructions }}
              />
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!product || product.status !== 'Available' || isAddingToCart || isInCart(product.id)}
            className={`w-full py-3 px-6 text-center font-medium rounded-md transition-colors ${
              !product || product.status !== 'Available'
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : isInCart(product.id)
                ? 'bg-green-600 text-white cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isAddingToCart ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Adding to Cart...
              </div>
            ) : product?.status === 'Sold' ? 'Sold Out' : 
               product?.status === 'OnHold' ? 'On Hold' :
               isInCart(product?.id) ? 'In Cart' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage; 