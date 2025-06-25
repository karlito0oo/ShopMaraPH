import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { ProductApi } from '../../services/ApiService';
import RichTextEditor from '../ui/RichTextEditor';
import type { ProductSize } from '../../types/product';

interface ProductFormProps {
  initialData?: any;
  isEditing?: boolean;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  initialData, 
  isEditing = false,
  onSuccess,
  onError
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [newAdditionalImages, setNewAdditionalImages] = useState<File[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string>('');
  const [existingAdditionalImages, setExistingAdditionalImages] = useState<string[]>([]);
  const [newAdditionalImagePreviews, setNewAdditionalImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    careInstructions: '',
    price: '',
    size: 'm' as ProductSize,
    isNewArrival: false,
    isSale: false,
  });

  useEffect(() => {
    if (initialData && isEditing) {
      setFormData({
        sku: initialData.sku || '',
        name: initialData.name || '',
        description: initialData.description || '',
        careInstructions: initialData.careInstructions || '',
        price: initialData.price?.toString() || '',
        size: initialData.size || 'm',
        isNewArrival: initialData.isNewArrival || false,
        isSale: initialData.isSale || false,
      });

      if (initialData.image) {
        setMainImagePreview(initialData.image);
      }

      if (initialData.images && Array.isArray(initialData.images)) {
        setExistingAdditionalImages(initialData.images);
      }
    }
  }, [initialData, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainImage(e.target.files[0]);
      setMainImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setNewAdditionalImages(prev => [...prev, ...newFiles]);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setNewAdditionalImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewAdditionalImages(prev => prev.filter((_, i) => i !== index));
    setNewAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('sku', formData.sku);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('care_instructions', formData.careInstructions);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('size', formData.size);
      formDataToSend.append('is_new_arrival', formData.isNewArrival.toString());
      formDataToSend.append('is_sale', formData.isSale.toString());

      // Handle main image
      if (mainImage) {
        formDataToSend.append('image', mainImage);
      } else if (isEditing && mainImagePreview) {
        formDataToSend.append('existing_image', mainImagePreview);
      }

      // Handle additional images - first add existing ones
      if (existingAdditionalImages.length > 0) {
        formDataToSend.append('existing_additional_images', JSON.stringify(existingAdditionalImages));
      }

      // Then add new ones
      newAdditionalImages.forEach(image => {
        formDataToSend.append('additional_images[]', image);
      });

      if (isEditing) {
        await ProductApi.updateProduct(token!, initialData.id, formDataToSend);
      } else {
        await ProductApi.createProduct(token!, formDataToSend);
      }

      const message = isEditing ? 'Product updated successfully!' : 'Product created successfully!';
      showToast(message, 'success');
      if (onSuccess) onSuccess(message);
      navigate('/admin/products');
    } catch (error: any) {
      console.error('Error:', error);
      const errorMessage = error.message || 'Something went wrong';
      showToast(errorMessage, 'error');
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Fill in the information below to {isEditing ? 'update' : 'create'} your product.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
              SKU
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="sku"
                id="sku"
                value={formData.sku}
                onChange={handleInputChange}
            className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                required
               
            className="w-full border-gray-300 rounded-md shadow-sm p-2 border"/>
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <div className="mt-1">
              <RichTextEditor
                value={formData.description}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="careInstructions" className="block text-sm font-medium text-gray-700">
              Care Instructions
            </label>
            <div className="mt-1">
              <RichTextEditor
                value={formData.careInstructions}
                onChange={(value) => setFormData(prev => ({ ...prev, careInstructions: value }))}
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="price"
                id="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
               
            className="w-full border-gray-300 rounded-md shadow-sm p-2 border" />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="size" className="block text-sm font-medium text-gray-700">
              Size
            </label>
            <div className="mt-1">
              <select
                id="size"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                required
               
            className="w-full border-gray-300 rounded-md shadow-sm p-2 border">
                <option value="xs">XS</option>
                <option value="s">S</option>
                <option value="m">M</option>
                <option value="l">L</option>
                <option value="xl">XL</option>
                <option value="xxl">XXL</option>
              </select>
            </div>
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  id="isNewArrival"
                  name="isNewArrival"
                  type="checkbox"
                  checked={formData.isNewArrival}
                  onChange={handleInputChange}
                
            className="w-full border-gray-300 rounded-md shadow-sm p-2 border"/>
                <label htmlFor="isNewArrival" className="ml-2 block text-sm text-gray-900">
                  New Arrival
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="isSale"
                  name="isSale"
                  type="checkbox"
                  checked={formData.isSale}
                  onChange={handleInputChange}
                 
            className="w-full border-gray-300 rounded-md shadow-sm p-2 border"/>
                <label htmlFor="isSale" className="ml-2 block text-sm text-gray-900">
                  On Sale
                </label>
              </div>
            </div>
          </div>

          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">Main Product Image</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {mainImagePreview ? (
                  <div>
                    <img src={mainImagePreview} alt="Preview" className="mx-auto h-32 w-32 object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setMainImage(null);
                        setMainImagePreview('');
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mt-4 flex text-sm text-gray-600">
                      <label
                        htmlFor="main-image-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="main-image-upload"
                          name="main-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageChange}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">Additional Images</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <div className="flex flex-wrap gap-4 justify-center">
                  {/* Existing Images */}
                  {existingAdditionalImages.map((imageUrl, index) => (
                    <div key={`existing-${index}`} className="relative">
                      <img src={imageUrl} alt={`Existing ${index + 1}`} className="h-32 w-32 object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  {/* New Images */}
                  {newAdditionalImagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative">
                      <img src={preview} alt={`New ${index + 1}`} className="h-32 w-32 object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-4">
                  <label
                    htmlFor="additional-images-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload additional images</span>
                    <input
                      id="additional-images-upload"
                      name="additional-images-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleAdditionalImagesChange}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProductForm; 