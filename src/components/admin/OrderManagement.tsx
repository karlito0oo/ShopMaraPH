import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OrderManagement: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the new orders page
    navigate('/admin-orders');
  }, [navigate]);
  
  // This component will render briefly before redirecting
  return (
    <div className="bg-white shadow rounded-lg p-6 text-center">
      <p className="text-gray-700">Redirecting to the order management system...</p>
    </div>
  );
};

export default OrderManagement; 