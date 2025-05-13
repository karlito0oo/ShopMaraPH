import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import type { Product, ProductSize } from '../types/product';

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const foundProduct = products.find(p => p.id.toString() === productId);
    if (foundProduct) {
      setProduct(foundProduct);
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;

    if (!selectedSize) {
      setError('Please select a size');
      return;
    }

    addToCart(product, selectedSize, quantity);
    navigate('/cart');
  };

  const handleSizeChange = (size: ProductSize) => {
    setSelectedSize(size);
    setError('');
  };

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-gray-100 p-4 rounded">
          <div className="aspect-w-1 aspect-h-1 bg-white">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Product Details */}
        <div>
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold">{product.name}</h1>
              {product.isBestSeller && (
                <div className="bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
                  Best Seller
                </div>
              )}
            </div>
            <div className="flex items-center mt-2">
              <span className="text-gray-600 text-sm capitalize mr-2">Category: {product.category}</span>
            </div>
            <div className="mt-4">
              <p className="text-xl font-semibold">₱{product.price.toFixed(2)}</p>
            </div>
          </div>

          {/* Size Selector */}
          <div className="mb-6">
            <h2 className="text-sm font-medium mb-2">Select Size</h2>
            <div className="flex flex-wrap gap-2">
              {product.sizes.filter(size => size !== 'all').map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    selectedSize === size
                      ? 'bg-black text-white border-2 border-black'
                      : 'bg-white text-black border-2 border-gray-300 hover:border-gray-500'
                  }`}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <h2 className="text-sm font-medium mb-2">Quantity</h2>
            <div className="flex items-center">
              <button 
                className="w-10 h-10 flex items-center justify-center rounded-l border-2 border-gray-300 bg-white text-black hover:border-gray-500 font-medium"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              >
                -
              </button>
              <span className="w-12 h-10 flex items-center justify-center border-t-2 border-b-2 border-gray-300 bg-white">
                {quantity}
              </span>
              <button 
                className="w-10 h-10 flex items-center justify-center rounded-r border-2 border-gray-300 bg-white text-black hover:border-gray-500 font-medium"
                onClick={() => setQuantity(prev => prev + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-black text-white px-4 py-3 rounded font-medium hover:bg-gray-800 transition-colors"
          >
            Add to Cart
          </button>

          {/* Product Description */}
          <div className="mt-8">
            <h2 className="text-lg font-medium mb-2">Product Description</h2>
            <p className="text-gray-600">
              Premium quality t-shirt featuring a unique design. Made with 100% organic cotton 
              for maximum comfort and durability. Machine washable.
            </p>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-1">Care Instructions:</h3>
              <ul className="list-disc list-inside text-sm text-gray-600">
                <li>Machine wash cold</li>
                <li>Tumble dry low</li>
                <li>Do not bleach</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage; 