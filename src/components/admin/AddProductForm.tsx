import React, { useState, useRef } from 'react';
import type { ProductCategory, ProductSize, SizeStock } from '../../types/product';
import { useAuth } from '../../context/AuthContext';

interface ProductFormData {
  sku: string;
  name: string;
  price: number;
  description: string;
  careInstructions: string;
  image: string;
  imageFile: File | null;
  additionalImages: string[];
  additionalImageFiles: (File | null)[];
  category: ProductCategory;
  sizes: ProductSize[];
  isBestSeller: boolean;
  isNewArrival: boolean;
  sizeStock: SizeStock[];
}

interface AddProductFormProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onSuccess, onError }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState<ProductFormData>({
    sku: '',
    name: '',
    price: 0,
    description: '',
    careInstructions: '* Machine wash cold\n* Tumble dry low\n* Do not bleach',
    image: '',
    imageFile: null,
    additionalImages: ['', '', ''],
    additionalImageFiles: [null, null, null],
    category: 'women',
    sizes: [],
    isBestSeller: false,
    isNewArrival: false,
    sizeStock: []
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const mainImageFileRef = useRef<HTMLInputElement>(null);
  const additionalImageFileRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  const availableSizes: ProductSize[] = ['small', 'medium', 'large', 'xlarge'];
  const availableCategories: ProductCategory[] = ['women', 'men'];

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

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (2MB limit = 2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        onError('Image size must not exceed 2MB (2048 kilobytes)');
        e.target.value = ''; // Reset the input
        return;
      }
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData({ 
        ...formData, 
        image: previewUrl,
        imageFile: file
      });
    }
  };

  const handleAdditionalImageFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (2MB limit = 2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        onError('Image size must not exceed 2MB (2048 kilobytes)');
        e.target.value = ''; // Reset the input
        return;
      }
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      
      const newAdditionalImages = [...formData.additionalImages];
      newAdditionalImages[index] = previewUrl;
      
      const newAdditionalImageFiles = [...formData.additionalImageFiles];
      newAdditionalImageFiles[index] = file;
      
      setFormData({ 
        ...formData, 
        additionalImages: newAdditionalImages,
        additionalImageFiles: newAdditionalImageFiles
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || (!formData.image && !formData.imageFile) || formData.price <= 0 || formData.sizes.length === 0) {
      onError('Please fill in all required fields: Name, Price, Main Image, and at least one Size');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Debug authentication info
      console.log('Auth Token:', token);
      console.log('Is authenticated:', !!token);
      
      // Create a FormData object for the multipart/form-data request
      const apiFormData = new FormData();
      apiFormData.append('name', formData.name);
      apiFormData.append('price', formData.price.toString());
      apiFormData.append('category', formData.category);
      apiFormData.append('description', formData.description);
      apiFormData.append('care_instructions', formData.careInstructions);
      
      // Add SKU
      if (formData.sku) {
        apiFormData.append('sku', formData.sku);
      }
      
      // Add the main image file
      if (formData.imageFile) {
        apiFormData.append('image', formData.imageFile);
      }
      
      // Add any additional image files
      formData.additionalImageFiles.forEach((file, index) => {
        if (file) {
          apiFormData.append(`additionalImages[${index}]`, file);
        }
      });
      
      // Convert boolean fields to proper format
      apiFormData.append('is_best_seller', formData.isBestSeller ? 'true' : 'false');
      apiFormData.append('is_new_arrival', formData.isNewArrival ? 'true' : 'false');
      
      // Fix 2: Ensure sizes is properly formatted as a JSON array
      const sizesData = formData.sizeStock.filter(ss => formData.sizes.includes(ss.size));
      apiFormData.append('sizes', JSON.stringify(sizesData));
      
      // Log the FormData to debug (cannot directly console.log FormData contents)
      console.log('Form data being sent:');
      console.log('- name:', formData.name);
      console.log('- price:', formData.price);
      console.log('- category:', formData.category);
      console.log('- is_best_seller:', formData.isBestSeller);
      console.log('- is_new_arrival:', formData.isNewArrival);
      console.log('- sizes:', JSON.stringify(sizesData));
      
      // Make API call to create product
      const response = await fetch('http://localhost:8000/api/admin/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: apiFormData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        
        // Handle authentication errors
        if (response.status === 401) {
          // Token is invalid or expired
          onError('Your session has expired. Please log in again.');
          // Redirect to login page after a short delay
          setTimeout(() => {
            window.location.href = '/login?returnUrl=/admin/add-product';
          }, 2000);
          return;
        }
        
        // Handle validation errors
        if (response.status === 422 && errorData.errors) {
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
            .join('\n');
          throw new Error(`Validation failed:\n${errorMessages}`);
        }
        
        throw new Error(errorData.message || 'Failed to create product');
      }
      
      const data = await response.json();
      
      onSuccess('Product added successfully!');
      
      // Clear form
      setFormData({
        sku: '',
        name: '',
        price: 0,
        description: '',
        careInstructions: '* Machine wash cold\n* Tumble dry low\n* Do not bleach',
        image: '',
        imageFile: null,
        additionalImages: ['', '', ''],
        additionalImageFiles: [null, null, null],
        category: 'women',
        sizes: [],
        isBestSeller: false,
        isNewArrival: false,
        sizeStock: []
      });

      // Reset file input elements
      if (mainImageFileRef.current) {
        mainImageFileRef.current.value = '';
      }
      
      additionalImageFileRefs.forEach(ref => {
        if (ref.current) {
          ref.current.value = '';
        }
      });
      
    } catch (error) {
      console.error('Error adding product:', error);
      onError(error instanceof Error ? error.message : 'An error occurred while adding the product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Add New Product</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Section */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700">SKU*</label>
            <input
              type="text"
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="e.g., BLK-TS-001"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Unique Stock Keeping Unit identifier (e.g., BLK-TS-001)</p>
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
          
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Product Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your product in detail..."
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="careInstructions" className="block text-sm font-medium text-gray-700">Care Instructions</label>
            <textarea
              id="careInstructions"
              name="careInstructions"
              value={formData.careInstructions}
              onChange={handleChange}
              placeholder="Washing instructions, handling advice, etc."
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm font-mono"
            />
            <p className="mt-1 text-xs text-gray-500">Use asterisks (*) for bullet points</p>
          </div>
        </div>
        
        {/* Images Section */}
        <div>
          <h3 className="text-lg font-medium mb-4">Product Images</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700">Main Product Image*</label>
              <input
                type="file"
                id="imageFile"
                ref={mainImageFileRef}
                onChange={handleMainImageChange}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-black file:text-white
                  hover:file:bg-gray-700"
                accept="image/*"
              />
              {formData.image && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Preview:</p>
                  <img 
                    src={formData.image} 
                    alt="Product preview" 
                    className="h-32 w-32 object-cover rounded-md border border-gray-200" 
                  />
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Images (Optional)</h4>
              
              {formData.additionalImageFiles.map((_, index) => (
                <div key={index} className="mb-4">
                  <label htmlFor={`additionalImageFile-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Image {index + 1}
                  </label>
                  <input
                    type="file"
                    id={`additionalImageFile-${index}`}
                    ref={additionalImageFileRefs[index]}
                    onChange={(e) => handleAdditionalImageFileChange(index, e)}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-black file:text-white
                      hover:file:bg-gray-700"
                    accept="image/*"
                  />
                  {formData.additionalImages[index] && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-1">Preview:</p>
                      <img 
                        src={formData.additionalImages[index]} 
                        alt={`Additional image ${index + 1} preview`} 
                        className="h-24 w-24 object-cover rounded-md border border-gray-200" 
                      />
                    </div>
                  )}
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

            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="isNewArrival"
                name="isNewArrival"
                checked={formData.isNewArrival}
                onChange={handleChange}
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              />
              <label htmlFor="isNewArrival" className="ml-2 block text-sm text-gray-700">
                Mark as New Arrival
              </label>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Adding Product...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm; 