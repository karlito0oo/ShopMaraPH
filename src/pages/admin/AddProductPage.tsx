import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductForm from '../../components/admin/ProductForm';
import { useAuth } from '../../context/AuthContext';

const AddProductPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage(null);
    // Auto-clear success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  const handleError = (message: string) => {
    setErrorMessage(message);
    setSuccessMessage(null);
  };
  
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded">
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add Product</h1>
        <Link
          to="/admin/products"
          className="bg-black text-white px-4 py-2 rounded whitespace-nowrap"
        >
          Back to Products
        </Link>
      </div>
      
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {errorMessage}
        </div>
      )}
      
      <div className="bg-white shadow rounded p-6">
        <ProductForm 
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </div>
  );
};

export default AddProductPage; 