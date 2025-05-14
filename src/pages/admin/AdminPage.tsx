import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ManageProducts from '../../components/admin/ManageProducts';
import OrderManagement from '../../components/admin/OrderManagement';
import AdminLayout from '../../components/layouts/AdminLayout';

const AdminPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('products');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Available tabs
  const tabs = [
    { id: 'products', label: 'Products' },
    { id: 'orders', label: 'Orders' },
  ];
  
  // Check URL parameter for active tab
  useEffect(() => {
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [tab]);
  
  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    navigate(`/admin/${tabId}`);
    // Clear messages when changing tabs
    setSuccessMessage(null);
    setErrorMessage(null);
  };

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
  
  const ActionButton = () => {
    if (activeTab === 'products') {
      return (
        <Link 
          to="/add-product" 
          className="mt-4 sm:mt-0 inline-block bg-black text-white px-4 py-2 rounded"
        >
          Add New Product
        </Link>
      );
    }
    
    if (activeTab === 'orders') {
      return (
        <Link 
          to="/admin-orders" 
          className="mt-4 sm:mt-0 inline-block bg-black text-white px-4 py-2 rounded"
        >
          Manage Orders
        </Link>
      );
    }
    
    return null;
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
    <AdminLayout 
      title="Admin Dashboard"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      darkTabs={true}
    >
      <div className="flex justify-end mb-4">
        <ActionButton />
      </div>

      {/* Display success or error messages */}
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
      
      <div className="bg-white shadow rounded overflow-hidden p-4">
        {activeTab === 'products' && (
          <ManageProducts 
            onSuccess={handleSuccess} 
            onError={handleError} 
          />
        )}
        {activeTab === 'orders' && <OrderManagement />}
      </div>
    </AdminLayout>
  );
};

export default AdminPage; 