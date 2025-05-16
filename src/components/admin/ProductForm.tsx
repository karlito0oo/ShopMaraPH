import React, { useState, useRef, useEffect } from 'react';
import type { ProductCategory, ProductSize, SizeStock } from '../../types/product';
import { useAuth } from '../../context/AuthContext';
import { ProductApi } from '../../services/ApiService';

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

interface ProductFormProps {
  productId?: string | number; // Optional - if provided, edit mode is enabled
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ productId, onSuccess, onError }) => {
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
  const [isInitializing, setIsInitializing] = useState(!!productId);
  const [originalImageUrls, setOriginalImageUrls] = useState<string[]>([]);
  
  const mainImageFileRef = useRef<HTMLInputElement>(null);
  const additionalImageFileRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  const availableSizes: ProductSize[] = ['small', 'medium', 'large', 'xlarge'];
  const availableCategories: ProductCategory[] = ['women', 'men'];

  // Fetch product data if in edit mode
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setIsInitializing(false);
        return;
      }

      try {
        setIsInitializing(true);
        const response = await ProductApi.getProductById(productId);
        const product = response.data;
        
        // Save original image URLs
        const imageUrls = [product.image];
        if (product.images && product.images.length > 0) {
          imageUrls.push(...product.images);
        }
        setOriginalImageUrls(imageUrls);
        
        // Prepare additional images array
        let additionalImgs = ['', '', ''];
        if (product.images && product.images.length > 0) {
          // Copy up to 3 additional images
          for (let i = 0; i < Math.min(3, product.images.length); i++) {
            additionalImgs[i] = product.images[i];
          }
        }
        
        // Update form data
        setFormData({
          sku: product.sku || '',
          name: product.name,
          price: product.price,
          description: product.description || '',
          careInstructions: product.careInstructions || '* Machine wash cold\n* Tumble dry low\n* Do not bleach',
          image: product.image,
          imageFile: null,
          additionalImages: additionalImgs,
          additionalImageFiles: [null, null, null],
          category: product.category as ProductCategory,
          sizes: product.sizes.filter(size => size !== 'all') as ProductSize[],
          isBestSeller: product.isBestSeller || false,
          isNewArrival: product.isNewArrival || false,
          sizeStock: product.sizeStock || []
        });
      } catch (error) {
        console.error('Error fetching product:', error);
        onError('Failed to load product data. Please try again.');
      } finally {
        setIsInitializing(false);
      }
    };

    fetchProduct();
  }, [productId, onError]);

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

  // Reset form to initial state
  const resetForm = () => {
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
    
    if (!token) {
      onError('Authentication token is missing. Please log in again.');
      return;
    }
    
    // Validate form data
    if (!formData.name) {
      onError('Product name is required');
      return;
    }
    
    if (formData.price <= 0) {
      onError('Product price must be greater than 0');
      return;
    }
    
    if (!formData.image && !formData.imageFile) {
      onError('Product image is required');
      return;
    }
    
    if (formData.sizes.length === 0) {
      onError('At least one size must be selected');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create a FormData object for the API request
      const apiFormData = new FormData();
      
      // Append basic product data
      apiFormData.append('name', formData.name);
      apiFormData.append('price', formData.price.toString());
      apiFormData.append('description', formData.description);
      apiFormData.append('careInstructions', formData.careInstructions);
      apiFormData.append('category', formData.category);
      apiFormData.append('sku', formData.sku || '');
      apiFormData.append('isBestSeller', formData.isBestSeller ? '1' : '0');
      apiFormData.append('isNewArrival', formData.isNewArrival ? '1' : '0');
      
      // Append sizes
      formData.sizes.forEach((size: ProductSize) => apiFormData.append('sizes[]', size));
      
      // Append size stock data
      formData.sizeStock.forEach((item, index) => {
        apiFormData.append(`sizeStock[${index}][size]`, item.size);
        apiFormData.append(`sizeStock[${index}][stock]`, item.stock.toString());
      });
      
      // Append images
      if (formData.imageFile) {
        apiFormData.append('image', formData.imageFile);
      } else if (productId && formData.image) {
        // Keep existing image
        apiFormData.append('keepMainImage', '1');
      }
      
      // Handle additional images
      const newAdditionalImages = [];
      const keepAdditionalImages = [];
      
      for (let i = 0; i < 3; i++) {
        const imageFile = formData.additionalImageFiles[i];
        const imageUrl = formData.additionalImages[i];
        
        if (imageFile) {
          apiFormData.append(`additionalImages[${newAdditionalImages.length}]`, imageFile);
          newAdditionalImages.push(i);
        } else if (productId && imageUrl && originalImageUrls.includes(imageUrl)) {
          // Keep existing additional image
          keepAdditionalImages.push(i + 1); // +1 because index 0 is the main image in originalImageUrls
        }
      }
      
      if (keepAdditionalImages.length > 0) {
        keepAdditionalImages.forEach(index => {
          apiFormData.append('keepAdditionalImages[]', index.toString());
        });
      }
      
      // Submit the form data
      let result;
      if (productId) {
        // Update existing product
        result = await ProductApi.updateProduct(token, productId, apiFormData);
      } else {
        // Create new product
        result = await ProductApi.createProduct(token, apiFormData);
      }
      
      // Show success message
      onSuccess(productId ? 'Product updated successfully' : 'Product created successfully');
      
      // Clear form if creating a new product
      if (!productId) {
        resetForm();
      }
    } catch (error) {
      console.error('Error saving product:', error);
      onError(error instanceof Error ? error.message : 'An error occurred while saving the product');
    } finally {
      setIsLoading(false);
    }
  };

  // If we're initializing in edit mode, show a loading indicator
  if (isInitializing) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-10 bg-gray-200 rounded col-span-2"></div>
                <div className="h-10 bg-gray-200 rounded col-span-1"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        <p className="text-center mt-4">Loading product data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">{productId ? 'Edit Product' : 'Add New Product'}</h2>
      
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
              <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {formData.image && (
                  <div className="mb-2 sm:mb-0 sm:mr-3">
                    <img 
                      src={formData.image} 
                      alt="Product preview" 
                      className="h-32 w-32 object-cover rounded-md border border-gray-200" 
                    />
                  </div>
                )}
                <input
                  type="file"
                  id="imageFile"
                  ref={mainImageFileRef}
                  onChange={handleMainImageChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-black file:text-white
                    hover:file:bg-gray-700"
                  accept="image/*"
                />
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Images (Optional)</h4>
              
              {formData.additionalImages.map((imgSrc, index) => (
                <div key={index} className="mb-4">
                  <label htmlFor={`additionalImageFile${index}`} className="block text-sm font-medium text-gray-700">Additional Image {index + 1}</label>
                  <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {imgSrc && (
                      <div className="mb-2 sm:mb-0 sm:mr-3">
                        <img 
                          src={imgSrc} 
                          alt={`Additional image ${index + 1} preview`} 
                          className="h-32 w-32 object-cover rounded-md border border-gray-200" 
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      id={`additionalImageFile${index}`}
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sizes Section */}
        <div>
          <h3 className="text-lg font-medium mb-4">Sizes and Stock</h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Available Sizes*</h4>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size: ProductSize) => (
                  <label key={size} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="sizes"
                      value={size}
                      checked={formData.sizes.includes(size)}
                      onChange={() => handleSizeToggle(size)}
                      className="form-checkbox h-5 w-5 text-black"
                    />
                    <span className="ml-2 text-sm text-gray-700">{size.toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Stock*</h4>
              <div className="space-y-2">
                {formData.sizes.map((size: ProductSize) => (
                  <div key={size} className="flex items-center">
                    <span className="w-16 text-sm text-gray-700">{size.toUpperCase()}:</span>
                    <input
                      type="number"
                      name={`stock-${size}`}
                      value={formData.sizeStock.find(ss => ss.size === size)?.stock || 0}
                      onChange={(e) => handleSizeStockChange(size, parseInt(e.target.value) || 0)}
                      min="0"
                      className="ml-2 block w-20 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional Info Section */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="isBestSeller" className="inline-flex items-center">
              <input
                type="checkbox"
                id="isBestSeller"
                name="isBestSeller"
                checked={formData.isBestSeller}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-black"
              />
              <span className="ml-2 text-sm text-gray-700">Best Seller</span>
            </label>
          </div>
          
          <div>
            <label htmlFor="isNewArrival" className="inline-flex items-center">
              <input
                type="checkbox"
                id="isNewArrival"
                name="isNewArrival"
                checked={formData.isNewArrival}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-black"
              />
              <span className="ml-2 text-sm text-gray-700">New Arrival</span>
            </label>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            {isLoading ? (productId ? 'Saving...' : 'Adding...') : (productId ? 'Save Changes' : 'Add Product')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm; 