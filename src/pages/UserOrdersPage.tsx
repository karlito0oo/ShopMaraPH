import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { OrderApi } from '../services/ApiService';
import { API_CONFIG } from '../config';
import TabButton from '../components/ui/TabButton';

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  size: string;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: number;
  user_id: number;
  status: string;
  customer_name: string;
  instagram_username: string;
  address_line1: string;
  barangay: string;
  city: string;
  mobile_number: string;
  payment_method: string;
  payment_proof: string;
  total_amount: number;
  admin_notes: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

const UserOrdersPage: React.FC = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Define tabs for order statuses
  const tabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      filterOrdersByStatus();
    }
  }, [orders, activeTab]);

  const fetchOrders = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await OrderApi.getUserOrders(token);
      const ordersData = response.data.orders;
      setOrders(ordersData);
      setFilteredOrders(ordersData);
      
      // Select the most recent order by default if any exists
      if (ordersData.length > 0) {
        setSelectedOrder(ordersData[0]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrdersByStatus = () => {
    if (activeTab === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === activeTab));
    }
  };

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-indigo-100 text-indigo-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your order is being reviewed. We will approve it once payment is verified.';
      case 'approved':
        return 'Your payment has been verified. We are preparing your order for shipment.';
      case 'shipped':
        return 'Your order is on the way! It should arrive within the estimated delivery time.';
      case 'delivered':
        return 'Your order has been delivered. Thank you for shopping with us!';
      case 'cancelled':
        return 'This order has been cancelled. Please check any admin notes for details.';
      default:
        return 'Your order is being processed.';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <Link
          to="/"
          className="bg-black text-white px-4 py-2 rounded whitespace-nowrap"
        >
          Continue Shopping
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white shadow rounded p-6 text-center">
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white shadow rounded p-6">
          <div className="text-center py-8">
            <h2 className="text-lg font-medium mb-2">You haven't placed any orders yet</h2>
            <p className="text-gray-600 mb-6">Once you place an order, you'll be able to track it here.</p>
            <Link
              to="/products"
              className="bg-black text-white px-6 py-2 rounded inline-block"
            >
              Browse Products
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Status tabs */}
          <div className="bg-white shadow rounded mb-6">
            <TabButton 
              tabs={tabs} 
              activeTab={activeTab} 
              onTabChange={handleTabChange}
            />
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            {/* Orders List */}
            <div className="md:col-span-5 bg-white shadow rounded p-4">
              <h2 className="text-lg font-semibold mb-4">Your Orders {activeTab !== 'all' && `(${activeTab})`}</h2>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p>No {activeTab} orders found</p>
                  {activeTab !== 'all' && (
                    <button 
                      className="mt-2 text-sm text-blue-600 hover:underline"
                      onClick={() => setActiveTab('all')}
                    >
                      Show all orders
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map(order => (
                    <div 
                      key={order.id}
                      className={`border rounded-lg p-4 cursor-pointer transition hover:border-gray-400 ${
                        selectedOrder?.id === order.id ? 'border-black bg-gray-50' : 'border-gray-200'
                      }`}
                      onClick={() => handleViewOrder(order)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium">Order #{order.id}</span>
                          <div className="text-sm text-gray-500 mt-1">{new Date(order.created_at).toLocaleDateString()}</div>
                        </div>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="font-medium text-sm">Total: ₱{parseFloat(order.total_amount.toString()).toFixed(2)}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {order.items ? `${order.items.length} item(s)` : 'Processing...'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Order Details */}
            <div className="md:col-span-7 bg-white shadow rounded p-4">
              {selectedOrder ? (
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h2 className="text-lg font-semibold">Order #{selectedOrder.id} Details</h2>
                    <span className={`mt-2 sm:mt-0 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedOrder.status)}`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded mb-6">
                    <p className="text-sm">{getStatusMessage(selectedOrder.status)}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-md font-medium mb-2">Order Information</h3>
                      <p className="text-sm mb-1"><span className="font-medium">Order Date:</span> {formatDate(selectedOrder.created_at)}</p>
                      {selectedOrder.approved_at && (
                        <p className="text-sm mb-1"><span className="font-medium">Approved Date:</span> {formatDate(selectedOrder.approved_at)}</p>
                      )}
                      <p className="text-sm mb-1"><span className="font-medium">Payment Method:</span> {selectedOrder.payment_method.replace('_', ' ').toUpperCase()}</p>
                      {selectedOrder.payment_proof && (
                        <div className="mt-2">
                          <p className="text-sm mb-1 font-medium">Payment Proof:</p>
                          <div className="mt-1 w-full max-w-xs border border-gray-200 rounded overflow-hidden">
                            <img 
                              src={`${API_CONFIG.BASE_URL.replace('/api', '')}/storage/${selectedOrder.payment_proof}`} 
                              alt="Payment Proof" 
                              className="w-full h-auto" 
                            />
                          </div>
                        </div>
                      )}
                      {selectedOrder.admin_notes && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          <p className="font-medium">Note from Shop:</p>
                          <p>{selectedOrder.admin_notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-md font-medium mb-2">Shipping Information</h3>
                      <p className="text-sm mb-1"><span className="font-medium">Name:</span> {selectedOrder.customer_name}</p>
                      <p className="text-sm mb-1"><span className="font-medium">Address:</span> {selectedOrder.address_line1}</p>
                      <p className="text-sm mb-1"><span className="font-medium">Location:</span> {selectedOrder.barangay}, {selectedOrder.city}</p>
                      <p className="text-sm mb-1"><span className="font-medium">Contact:</span> {selectedOrder.mobile_number}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-md font-medium mb-2">Order Items</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product
                            </th>
                            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Size
                            </th>
                            <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Qty
                            </th>
                            <th scope="col" className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th scope="col" className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedOrder.items && selectedOrder.items.map(item => (
                            <tr key={item.id}>
                              <td className="px-2 py-4 whitespace-normal text-sm text-gray-900">
                                {item.product_name}
                              </td>
                              <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.size.toUpperCase()}
                              </td>
                              <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                {item.quantity}
                              </td>
                              <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                ₱{parseFloat(item.price.toString()).toFixed(2)}
                              </td>
                              <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                ₱{(parseFloat(item.price.toString()) * item.quantity).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={4} className="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                              Total:
                            </td>
                            <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                              ₱{parseFloat(selectedOrder.total_amount.toString()).toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                  
                  {selectedOrder.status === 'delivered' && (
                    <div className="mt-6 text-center">
                      <p className="text-green-700 font-medium">Thank you for shopping with us!</p>
                      <Link
                        to="/products"
                        className="mt-4 inline-block bg-black text-white px-6 py-2 rounded"
                      >
                        Shop Again
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Select an order to view details</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserOrdersPage; 