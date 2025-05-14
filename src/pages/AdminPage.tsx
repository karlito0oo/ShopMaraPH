import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ManageProducts from '../components/admin/ManageProducts';
import OrderManagement from '../components/admin/OrderManagement';
import ApiTest from '../components/admin/ApiTest';

const AdminPage = () => {
  const navigate = useNavigate();
  const { tab } = useParams<{ tab: string }>();
  const [message, setMessage] = useState({ text: '', type: '' });
  const { token, user, isAdmin, isAuthenticated } = useAuth();

  // Set default tab if none is provided in URL
  useEffect(() => {
    if (!tab) {
      navigate('/admin/manage-products', { replace: true });
    }
  }, [tab, navigate]);

  // Validate tab parameter
  const activeTab = ['manage-products', 'orders', 'api-test'].includes(tab || '') 
    ? tab 
    : 'manage-products';

  const handleTabChange = (newTab: string) => {
    navigate(`/admin/${newTab}`);
  };

  const handleSuccess = (text: string) => {
    setMessage({ text, type: 'success' });
    // Clear message after 5 seconds
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleError = (text: string) => {
    setMessage({ text, type: 'error' });
    // Clear message after 5 seconds
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };
  
  // Debug authentication status
  const checkAuthStatus = () => {
    console.log('Token:', token);
    console.log('User:', user);
    console.log('Is Admin:', isAdmin);
    console.log('Is Authenticated:', isAuthenticated);
    
    if (!token) {
      handleError('Not authenticated. Please log in again.');
    } else if (!isAdmin) {
      handleError('Not authorized as admin. Please log in with an admin account.');
    } else {
      handleSuccess('Authentication valid. You are logged in as admin.');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>
      
      {/* Authentication Debug Button */}
      <div className="mb-4 text-center">
          <button
          onClick={checkAuthStatus}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 text-sm"
        >
          Check Auth Status
          </button>
      </div>
      
      {/* Alert Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
      
      {/* Tab Navigation */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1 max-w-fit mx-auto">
                      <button
          className={`py-2 px-6 font-medium rounded-md transition-colors duration-200 ${
            activeTab === 'manage-products' 
              ? 'bg-black text-white shadow-md' 
              : 'bg-transparent text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => handleTabChange('manage-products')}
        >
          Manage Products
                      </button>
              <button
          className={`py-2 px-6 font-medium rounded-md transition-colors duration-200 ${
            activeTab === 'orders' 
              ? 'bg-black text-white shadow-md' 
              : 'bg-transparent text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => handleTabChange('orders')}
        >
          Orders
            </button>
                      <button 
          className={`py-2 px-6 font-medium rounded-md transition-colors duration-200 ${
            activeTab === 'api-test' 
              ? 'bg-black text-white shadow-md' 
              : 'bg-transparent text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => handleTabChange('api-test')}
        >
          API Test
              </button>
            </div>
      
      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'manage-products' && <ManageProducts onSuccess={handleSuccess} onError={handleError} />}
        {activeTab === 'orders' && <OrderManagement onSuccess={handleSuccess} onError={handleError} />}
        {activeTab === 'api-test' && <ApiTest onSuccess={handleSuccess} onError={handleError} />}
        </div>
    </div>
  );
};

export default AdminPage; 