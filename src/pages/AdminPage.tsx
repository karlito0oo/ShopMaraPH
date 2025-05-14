import React, { useState } from 'react';
import type { Product, ProductCategory, ProductSize, SizeStock } from '../types/product';

interface ProductFormData {
  id: string;
  name: string;
  price: number;
  image: string;
  additionalImages: string[];
  category: ProductCategory;
  sizes: ProductSize[];
  isBestSeller: boolean;
  sizeStock: SizeStock[];
}

interface ExampleProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  sizeStock: SizeStock[];
}

interface ExampleOrder {
  id: string;
  date: string;
  customer: string;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('add-product');
  const [formData, setFormData] = useState<ProductFormData>({
    id: '',
    name: '',
    price: 0,
    image: '',
    additionalImages: ['', '', ''],
    category: 'new',
    sizes: [],
    isBestSeller: false,
    sizeStock: []
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ExampleProduct | null>(null);
  const [sizeRestockQuantities, setSizeRestockQuantities] = useState<{[key: string]: number}>({});

  // Example product data for the Manage Products tab
  const exampleProducts: ExampleProduct[] = [
    { 
      id: 'm1', 
      name: 'Classic Black Tee', 
      price: 49.99, 
      category: 'Men', 
      sizeStock: [
        { size: 'small', stock: 5 },
        { size: 'medium', stock: 8 },
        { size: 'large', stock: 7 },
        { size: 'xlarge', stock: 5 }
      ]
    },
    { id: 'w1', name: 'Basic White Tee', price: 39.99, category: 'Women', sizeStock: [] },
    { id: 'n1', name: 'Limited Edition Graphic Tee', price: 59.99, category: 'New', sizeStock: [] },
    { id: 'm2', name: 'White Essentials Tee', price: 39.99, category: 'Men', sizeStock: [] },
    { id: 'w2', name: 'V-Neck Tee', price: 44.99, category: 'Women', sizeStock: [] }
  ];

  // Example order data for the Orders tab
  const exampleOrders: ExampleOrder[] = [
    { id: 'ORD-001', date: '2023-07-15', customer: 'John Doe', total: 149.97, status: 'Delivered' },
    { id: 'ORD-002', date: '2023-07-18', customer: 'Maria Garcia', total: 89.98, status: 'Shipped' },
    { id: 'ORD-003', date: '2023-07-20', customer: 'Alex Chen', total: 59.99, status: 'Processing' },
    { id: 'ORD-004', date: '2023-07-22', customer: 'Sarah Johnson', total: 129.95, status: 'Pending' },
    { id: 'ORD-005', date: '2023-07-14', customer: 'Carlos Rodriguez', total: 44.99, status: 'Cancelled' }
  ];

  const availableSizes: ProductSize[] = ['small', 'medium', 'large', 'xlarge'];
  const availableCategories: ProductCategory[] = ['new', 'women', 'men'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: checkbox.checked });
    } else if (name === 'price') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSizeToggle = (size: ProductSize) => {
    const newSizes = formData.sizes.includes(size)
      ? formData.sizes.filter(s => s !== size)
      : [...formData.sizes, size];
    
    // If adding a new size, add it to sizeStock with default stock 0
    let newSizeStock = [...formData.sizeStock];
    if (!formData.sizes.includes(size) && newSizes.includes(size)) {
      newSizeStock.push({ size, stock: 0 });
    } else if (formData.sizes.includes(size) && !newSizes.includes(size)) {
      // If removing a size, remove it from sizeStock
      newSizeStock = newSizeStock.filter(item => item.size !== size);
    }
    
    setFormData({ 
      ...formData, 
      sizes: newSizes,
      sizeStock: newSizeStock
    });
  };

  const handleSizeStockChange = (size: ProductSize, stock: number) => {
    const newSizeStock = formData.sizeStock.map(item => 
      item.size === size ? { ...item, stock } : item
    );
    setFormData({ ...formData, sizeStock: newSizeStock });
  };

  const handleAdditionalImageChange = (index: number, value: string) => {
    const newAdditionalImages = [...formData.additionalImages];
    newAdditionalImages[index] = value;
    setFormData({ ...formData, additionalImages: newAdditionalImages });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.id || !formData.name || !formData.image || formData.price <= 0 || formData.sizes.length === 0) {
      setMessage({ 
        text: 'Please fill in all required fields: ID, Name, Price, Main Image, and at least one Size', 
        type: 'error' 
      });
      return;
    }
    
    // In a real app, this would send data to a backend API
    console.log('Product data to be saved:', {
      ...formData,
      // Only include non-empty additional images
      images: [
        formData.image,
        ...formData.additionalImages.filter(img => img.trim() !== '')
      ]
    });
    
    setMessage({ 
      text: 'Product added successfully! (Note: In this demo, products are not actually saved)', 
      type: 'success' 
    });
    
    // Clear form
    setFormData({
      id: '',
      name: '',
      price: 0,
      image: '',
      additionalImages: ['', '', ''],
      category: 'new',
      sizes: [],
      isBestSeller: false,
      sizeStock: []
    });
    
    // Message will disappear after 5 seconds
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 5000);
  };

  const getStatusBadgeClass = (status: ExampleOrder['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const openRestockModal = (product: ExampleProduct) => {
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

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) return;
    
    // Check if any size has a quantity greater than 0
    const hasSizeToRestock = Object.values(sizeRestockQuantities).some(qty => qty > 0);
    if (!hasSizeToRestock) return;
    
    // In a real app, this would make an API call to update the product stock by size
    console.log(`Restocking product ${selectedProduct.id} by size:`, sizeRestockQuantities);
    
    // Update the example product size stock in the UI (simplified for demo)
    if (selectedProduct.sizeStock) {
      const updatedSizeStock = [...selectedProduct.sizeStock];
      Object.entries(sizeRestockQuantities).forEach(([size, quantity]) => {
        if (quantity > 0) {
          const sizeIndex = updatedSizeStock.findIndex(s => s.size === size);
          if (sizeIndex >= 0) {
            updatedSizeStock[sizeIndex].stock += quantity;
          }
        }
      });
      
      // Update the product with new sizeStock
      selectedProduct.sizeStock = updatedSizeStock;
      
      // Show success message with sizes restocked
      const sizeDetails = Object.entries(sizeRestockQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([size, qty]) => `${size.toUpperCase()}: ${qty}`)
        .join(', ');
      
      setMessage({
        text: `Successfully restocked ${selectedProduct.name} with sizes: ${sizeDetails}`,
        type: 'success'
      });
    }
    
    // Clear message after 5 seconds
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 5000);
    
    closeRestockModal();
  };

  // Calculate total stock
  const getTotalStock = (product: ExampleProduct): number => {
    return product.sizeStock.reduce((total, item) => total + item.stock, 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex -mb-px">
          <button
            className={`py-4 px-6 font-medium text-sm rounded-t-lg ${
              activeTab === 'add-product' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('add-product')}
          >
            Add Product
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm rounded-t-lg ml-2 ${
              activeTab === 'manage-products' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('manage-products')}
          >
            Manage Products
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm rounded-t-lg ml-2 ${
              activeTab === 'orders' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
        </nav>
      </div>
      
      {/* Status Message */}
      {message.text && (
        <div className={`p-4 mb-6 rounded ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}
      
      {/* Add Product Form */}
      {activeTab === 'add-product' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Add New Product</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Section */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="id" className="block text-sm font-medium text-gray-700">Product ID*</label>
                <input
                  type="text"
                  id="id"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  placeholder="e.g., m5, w6, n5"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Unique identifier for the product (e.g., m5, w6, n5)</p>
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Classic Black Tee"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (₱)*</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="e.g., 49.99"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category*</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                  required
                >
                  {availableCategories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Images Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Product Images</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700">Main Image URL*</label>
                  <input
                    type="text"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    required
                  />
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Images (Optional)</h4>
                  
                  {formData.additionalImages.map((imgUrl, index) => (
                    <div key={index} className="mb-2">
                      <label htmlFor={`additional-image-${index}`} className="sr-only">Additional Image {index + 1}</label>
                      <input
                        type="text"
                        id={`additional-image-${index}`}
                        value={imgUrl}
                        onChange={(e) => handleAdditionalImageChange(index, e.target.value)}
                        placeholder={`Additional image URL ${index + 1}`}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Attributes Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Product Attributes</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes*</label>
                  <div className="flex flex-wrap gap-3">
                    {availableSizes.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeToggle(size)}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                          formData.sizes.includes(size)
                            ? 'bg-black text-white border-2 border-black'
                            : 'bg-white text-black border-2 border-gray-300 hover:border-gray-500'
                        }`}
                      >
                        {size.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                
                {formData.sizes.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Size-specific Stock</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {formData.sizes.map(size => {
                        const sizeStockItem = formData.sizeStock.find(item => item.size === size);
                        const stockValue = sizeStockItem ? sizeStockItem.stock : 0;
                        
                        return (
                          <div key={size} className="flex items-center border border-gray-300 rounded-md p-3">
                            <span className="font-medium mr-2">{size.toUpperCase()}:</span>
                            <input
                              type="number"
                              min="0"
                              value={stockValue}
                              onChange={(e) => handleSizeStockChange(size, parseInt(e.target.value) || 0)}
                              className="w-20 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-black focus:border-black text-sm"
                            />
                            <span className="ml-1 text-sm text-gray-500">units</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isBestSeller"
                    name="isBestSeller"
                    checked={formData.isBestSeller}
                    onChange={handleChange}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <label htmlFor="isBestSeller" className="ml-2 block text-sm text-gray-700">
                    Mark as Best Seller
                  </label>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Add Product
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Manage Products Tab */}
      {activeTab === 'manage-products' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Manage Products</h2>
          
          <div className="flex justify-between mb-4">
            <div className="w-64">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              />
            </div>
            <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
              Bulk Actions
            </button>
          </div>
          
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
                {exampleProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.name}
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
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">12</span> products
            </div>
            <div className="flex-1 flex justify-end">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Previous
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-black text-sm font-medium text-white">
                  1
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  2
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  3
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
      
      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Order Management</h2>
          
          <div className="flex justify-between mb-4">
            <div className="w-64">
              <input
                type="text"
                placeholder="Search orders..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              />
            </div>
            <div className="flex gap-2">
              <select className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black">
                <option value="">Filter by Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
                Export Orders
              </button>
            </div>
          </div>
          
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exampleOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₱{order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                      <button className="text-indigo-600 hover:text-indigo-900">Update</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">25</span> orders
            </div>
            <div className="flex-1 flex justify-end">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Previous
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-black text-sm font-medium text-white">
                  1
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  2
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  3
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
      
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
                  disabled={!Object.values(sizeRestockQuantities).some(qty => qty > 0)}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
                    !Object.values(sizeRestockQuantities).some(qty => qty > 0)
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-black hover:bg-gray-800'
                  }`}
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage; 