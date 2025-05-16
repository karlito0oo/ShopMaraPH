import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { ProductSize, SizeStock } from '../../types/product';
import { useAuth } from '../../context/AuthContext';
import { ProductApi } from '../../services/ApiService';

interface Product {
  id: string | number;
  name: string;
  price: number;
  category: string;
  sizeStock: SizeStock[];
  sku?: string;
}

interface ManageProductsProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const ManageProducts: React.FC<ManageProductsProps> = ({ onSuccess, onError }) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sizeRestockQuantities, setSizeRestockQuantities] = useState<{[key: string]: number}>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProductId, setEditProductId] = useState<string | number | null>(null);
  
  // Fetch products when the component mounts
  useEffect(() => {
    fetchProducts();
  }, []);
  
  // Filter products when search term or products change
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProducts(products);
      return;
    }
    
    const lowercaseSearch = searchTerm.toLowerCase();
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(lowercaseSearch) || 
      product.category.toLowerCase().includes(lowercaseSearch) ||
      (product.sku && product.sku.toLowerCase().includes(lowercaseSearch))
    );
    
    setFilteredProducts(filtered);
  }, [searchTerm, products]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await ProductApi.getAllProducts();
      setProducts(data.data || []);
      setFilteredProducts(data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      onError('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const openRestockModal = (product: Product) => {
    setSelectedProduct(product);
    setSizeRestockQuantities({});
    setIsRestockModalOpen(true);
  };

  const closeRestockModal = () => {
    setIsRestockModalOpen(false);
    setSelectedProduct(null);
    setSizeRestockQuantities({});
  };

  const handleSizeRestockQuantityChange = (size: ProductSize, quantity: number) => {
    setSizeRestockQuantities(prev => ({
      ...prev,
      [size]: quantity
    }));
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || !token) return;
    
    // Check if any size has a quantity greater than 0
    const hasSizeToRestock = Object.values(sizeRestockQuantities).some(qty => qty > 0);
    if (!hasSizeToRestock) return;
    
    setIsLoading(true);
    
    try {
      // Prepare data for the API
      const sizeStockForApi = Object.entries(sizeRestockQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([size, quantity]) => ({
          size,
          quantity
        }));
      
      // Call the restock API endpoint
      const data = await ProductApi.restockProduct(token, selectedProduct.id, { sizeStock: sizeStockForApi });
      
      // Update the UI with the new stock information
      const updatedProducts = products.map(product => {
        if (product.id === selectedProduct.id) {
          return {
            ...product,
            sizeStock: data.data.sizeStock
          };
        }
        return product;
      });
      
      setProducts(updatedProducts);
      
      // Show success message with sizes restocked
      const sizeDetails = Object.entries(sizeRestockQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([size, qty]) => `${size.toUpperCase()}: ${qty}`)
        .join(', ');
      
      onSuccess(`Successfully restocked ${selectedProduct.name} with sizes: ${sizeDetails}`);
      
      closeRestockModal();
    } catch (error) {
      console.error('Error restocking product:', error);
      onError(error instanceof Error ? error.message : 'An error occurred while restocking the product');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total stock for a product
  const getTotalStock = (product: Product): number => {
    return product.sizeStock.reduce((total, item) => total + item.stock, 0);
  };
  
  const handleDelete = async (productId: string | number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    if (!token) return;
    
    setIsLoading(true);
    
    try {
      // Make API call to delete the product
      await ProductApi.deleteProduct(token, productId);
      
      // Remove the product from state
      setProducts(products.filter(product => product.id !== productId));
      onSuccess('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      onError(error instanceof Error ? error.message : 'An error occurred while deleting the product');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (productId: string | number) => {
    setEditProductId(productId);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditProductId(null);
  };

  const handleEditSuccess = (message: string) => {
    onSuccess(message);
    closeEditModal();
    // Refresh the products list
    fetchProducts();
  };

  // Navigate to add product page
  const navigateToAddPage = () => {
    navigate('/add-product');
  };

  // Navigate to edit product page
  const navigateToEditPage = (productId: string | number) => {
    navigate(`/edit-product/${productId}`);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Manage Products</h2>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
          />
        </div>
        <div>
          <Link 
            to="/add-product" 
            className="w-full sm:w-auto inline-block bg-black text-white px-4 py-2 rounded text-center"
          >
            Add New Product
          </Link>
        </div>
      </div>
      
      {isLoading && <p className="text-center py-4">Loading products...</p>}
      
      {!isLoading && filteredProducts.length === 0 && (
        <div className="text-center py-8">
          {searchTerm ? (
            <p className="text-gray-500">No products found matching "{searchTerm}"</p>
          ) : (
            <p className="text-gray-500">No products found</p>
          )}
        </div>
      )}
      
      {!isLoading && filteredProducts.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Stock
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.name}
                    {product.sku && <div className="text-xs text-gray-400">SKU: {product.sku}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₱{product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getTotalStock(product)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => openRestockModal(product)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      Restock
                    </button>
                    <button 
                      onClick={() => navigateToEditPage(product.id)} 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-4 flex items-center justify-between">
        {filteredProducts.length > 0 && (
          <div className="text-sm text-gray-700">
            {searchTerm ? (
              <span>Showing <span className="font-medium">{filteredProducts.length}</span> results from <span className="font-medium">{products.length}</span> products</span>
            ) : (
              <span>Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredProducts.length}</span> of <span className="font-medium">{products.length}</span> products</span>
            )}
          </div>
        )}
        {filteredProducts.length > 0 && (
          <div className="flex-1 flex justify-end">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Previous
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-black text-sm font-medium text-white">
                1
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
      
      {/* Restock Modal */}
      {isRestockModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full">
            <div className="px-6 py-4 bg-gray-100 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                Restock {selectedProduct.name}
              </h3>
            </div>
            
            <form onSubmit={handleRestockSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Stock
                </label>
                <div className="text-lg font-semibold">{getTotalStock(selectedProduct)} units total</div>
                
                {selectedProduct.sizeStock && selectedProduct.sizeStock.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {selectedProduct.sizeStock.map(item => (
                      <div key={item.size} className="text-sm">
                        <span className="font-medium">{item.size.toUpperCase()}:</span> {item.stock} units
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restock Quantity by Size
                </label>
                <div className="space-y-3">
                  {selectedProduct.sizeStock?.map(item => (
                    <div key={item.size} className="flex items-center">
                      <span className="font-medium w-20">{item.size.toUpperCase()}:</span>
                      <input
                        type="number"
                        value={sizeRestockQuantities[item.size] || 0}
                        onChange={(e) => handleSizeRestockQuantityChange(
                          item.size, 
                          parseInt(e.target.value) || 0
                        )}
                        min="0"
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                      />
                      <span className="ml-2 text-sm text-gray-500">units</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeRestockModal}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!Object.values(sizeRestockQuantities).some(qty => qty > 0) || isLoading}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
                    !Object.values(sizeRestockQuantities).some(qty => qty > 0) || isLoading
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-black hover:bg-gray-800'
                  }`}
                >
                  {isLoading ? 'Updating...' : 'Confirm Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts; 