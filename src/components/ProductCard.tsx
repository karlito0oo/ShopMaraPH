import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types/product';
import AddToCartButton from './AddToCartButton';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-white rounded shadow overflow-hidden relative">
      {product.isBestSeller && (
        <div className="absolute top-0 right-0 bg-yellow-400 text-xs font-bold px-2 py-1 m-2 z-10">
          Best Seller
        </div>
      )}
      <Link to={`/product/${product.id}`} className="no-underline text-inherit">
        <div className="aspect-w-1 aspect-h-1 bg-gray-200">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">{product.name}</h3>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">{product.category}</span>
          </div>
          <div className="flex justify-between mt-1">
            <p className="text-gray-600">₱{product.price.toFixed(2)}</p>
            <p className="text-gray-500 text-sm">
              {product.sizes.filter(size => size !== 'all').join(', ')}
            </p>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <Link to={`/product/${product.id}`} className="block w-full bg-white text-black border border-black px-4 py-2 hover:bg-gray-100 transition-colors text-center no-underline mb-2">
          View Details
        </Link>
        <AddToCartButton product={product} />
      </div>
    </div>
  );
};

export default ProductCard; 