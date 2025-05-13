import { Link } from 'react-router-dom';
import { products } from '../data/products';
import type { Product } from '../types/product';

const NewDropsSection = () => {
  // Filter to show only new products and limit to 8 items (for 4x2 grid)
  const newProducts = products
    .filter(product => product.category === 'new')
    .slice(0, 8);

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8">New Drops</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {newProducts.map((product) => (
            <div key={product.id} className="group relative">
              <Link to={`/product/${product.id}`} className="block no-underline text-inherit">
                {product.isBestSeller && (
                  <div className="absolute top-0 right-0 z-10 bg-yellow-400 text-xs font-bold px-2 py-1 m-2">
                    Best Seller
                  </div>
                )}
                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden bg-gray-200 group-hover:opacity-90">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="mt-4">
                  <h3 className="text-sm text-gray-700">{product.name}</h3>
                  <p className="mt-1 text-sm font-medium text-gray-900">₱{product.price.toFixed(2)}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link 
            to="/products" 
            className="inline-block border border-black px-8 py-3 hover:bg-black hover:text-white transition-colors no-underline text-black"
          >
            View All Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewDropsSection; 