import React, { useState, useRef, useEffect } from 'react';
import type { ProductSize, SizeStock } from '../../types/product';
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
  size: ProductSize;
  isNewArrival: boolean;
  isSale: boolean;
  stock: number;
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
    size: 'small',
    isNewArrival: false,
    isSale: false,
    stock: 0
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

  const availableSizes: ProductSize[] = ['small', 'medium', 'large', 'xlarge', 'xxlarge', 'xxxlarge'];

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
        
        // Determine if product is a new arrival (either from category or explicit flag)
        const isNewArrival = product.category === 'new_arrival' || product.isNewArrival || false;
        
        // Determine if product is on sale
        const isSale = product.category === 'sale' || product.isSale || false;
        
        // Get the first size and its stock
        const primarySize = product.sizes && product.sizes.length > 0 ? 
          product.sizes[0] as ProductSize : 'small';
        
        const stockAmount = product.sizeStock && product.sizeStock.length > 0 ? 
          product.sizeStock.find((ss: SizeStock) => ss.size === primarySize)?.stock || 0 : 0;
        
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
          size: primarySize,
          isNewArrival: isNewArrival,
          isSale: isSale,
          stock: stockAmount
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
      size: 'small',
      isNewArrival: false,
      isSale: false,
      stock: 0
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
    
    setIsLoading(true);
    
    try {
      // Create a FormData object for the API request
      const apiFormData = new FormData();
      
      // Append basic product data
      apiFormData.append('name', formData.name);
      apiFormData.append('price', formData.price.toString());
      apiFormData.append('description', formData.description);
      apiFormData.append('care_instructions', formData.careInstructions);
      apiFormData.append('sku', formData.sku || '');
      
      // Set category based on isNewArrival flag
      const category = formData.isNewArrival ? 'new_arrival' : formData.isSale ? 'sale' : 'all';
      apiFormData.append('category', category);
      
      // Use the expected field names for the API
      apiFormData.append('is_best_seller', 'false'); // Always false since feature is deprecated
      apiFormData.append('is_new_arrival', formData.isNewArrival ? 'true' : 'false');
      apiFormData.append('is_sale', formData.isSale ? 'true' : 'false');
      
      // Convert the single size to an array for API compatibility
      apiFormData.append('sizes', JSON.stringify([formData.size]));
      
      // Convert stock to sizeStock array for API compatibility
      const sizeStock = [{ size: formData.size, stock: formData.stock }];
      apiFormData.append('size_stock', JSON.stringify(sizeStock));
      
      // Append main image
      if (formData.imageFile) {
        apiFormData.append('image', formData.imageFile);
      } else if (productId && formData.image) {
        // Keep existing image
        apiFormData.append('keepMainImage', '1');
      }
      
      // Handle additional images
      let additionalImagesCount = 0;
      
      // Add new additional image files
      formData.additionalImageFiles.forEach((file) => {
        if (file) {
          apiFormData.append(`additional_images[${additionalImagesCount}]`, file);
          additionalImagesCount++;
        }
      });
      
      // Keep track of existing additional images to preserve
      if (productId) {
        const keepAdditionalImages: number[] = [];
        
        formData.additionalImages.forEach((imageUrl, index) => {
          // If this is an existing image (not a new file) and has a URL
          if (!formData.additionalImageFiles[index] && imageUrl && originalImageUrls.includes(imageUrl)) {
            // Find the index in originalImageUrls (add 1 because index 0 is main image)
            const originalIndex = originalImageUrls.indexOf(imageUrl);
            if (originalIndex > 0) {
              keepAdditionalImages.push(originalIndex);
            }
          }
        });
        
        // Add indices of additional images to keep
        if (keepAdditionalImages.length > 0) {
          apiFormData.append('keep_additional_images', JSON.stringify(keepAdditionalImages));
        }
      }
      
      // Submit the form data
      if (productId) {
        // Update existing product
        await ProductApi.updateProduct(token, productId, apiFormData);
      } else {
        // Create new product
        await ProductApi.createProduct(token, apiFormData);
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
            <label htmlFor="isNewArrival" className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isNewArrival"
                name="isNewArrival"
                checked={formData.isNewArrival}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-black"
              />
              <span className="ml-2 text-sm text-gray-700">New Arrival</span>
            </div>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="isSale"
                name="isSale"
                checked={formData.isSale}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-black"
              />
              <span className="ml-2 text-sm text-gray-700">Sale</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">Mark this product as a new arrival or sale item</p>
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
            <label htmlFor="careInstructions" className="block text-sm font-medium text-gray-700">Before You Buy</label>
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
          <h3 className="text-lg font-medium mb-4">Size and Stock</h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Size*</h4>
              <select
                id="size"
                name="size"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value as ProductSize })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                required
              >
                {availableSizes.map((size) => (
                  <option key={size} value={size}>
                    {size.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Stock*</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                  />
                </div>
              </div>
            </div>
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