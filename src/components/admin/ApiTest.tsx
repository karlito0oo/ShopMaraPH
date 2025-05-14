import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG } from '../../config';

interface ApiTestProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const ApiTest: React.FC<ApiTestProps> = ({ onSuccess, onError }) => {
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const testEndpoints = [
    { name: 'Public Products', url: `${API_CONFIG.BASE_URL}/products`, method: 'GET', auth: false },
    { name: 'User Profile', url: `${API_CONFIG.BASE_URL}/user`, method: 'GET', auth: true },
    { name: 'Test Admin Access', url: `${API_CONFIG.BASE_URL}/admin/products`, method: 'GET', auth: true }
  ];
  
  const testApi = async (url: string, method: string, requiresAuth: boolean) => {
    setLoading(true);
    
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      
      if (requiresAuth) {
        if (!token) {
          throw new Error('No authentication token available');
        }
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method,
        headers,
        credentials: 'include'
      });
      
      const data = await response.json();
      console.log('API Test Response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || `Error: ${response.status} ${response.statusText}`);
      }
      
      onSuccess(`API test successful: ${url}`);
    } catch (error) {
      console.error('API Test Error:', error);
      onError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">API Authentication Test</h2>
      
      <div className="mb-4">
        <p className="mb-2"><strong>Authentication Status:</strong> {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
        <p className="mb-2"><strong>Token Available:</strong> {token ? 'Yes' : 'No'}</p>
        
        {token && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-1">Token preview (first 20 chars):</p>
            <code className="bg-gray-100 p-2 rounded block text-sm overflow-x-auto">
              {token.substring(0, 20)}...
            </code>
          </div>
        )}
      </div>
      
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-4">Test API Endpoints</h3>
        
        <div className="space-y-3">
          {testEndpoints.map((endpoint) => (
            <div key={endpoint.name} className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-medium">{endpoint.name}</p>
                <p className="text-sm text-gray-600">{endpoint.method} {endpoint.url}</p>
                <p className="text-xs text-gray-500">{endpoint.auth ? 'Requires Auth' : 'Public Endpoint'}</p>
              </div>
              <button
                onClick={() => testApi(endpoint.url, endpoint.method, endpoint.auth)}
                disabled={loading || (endpoint.auth && !token)}
                className={`px-4 py-2 rounded text-sm ${
                  loading || (endpoint.auth && !token)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Test
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApiTest; 