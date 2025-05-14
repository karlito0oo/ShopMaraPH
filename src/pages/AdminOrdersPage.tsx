import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
  user: {
    id: number;
    name: string;
    email: string;
  };
}

const AdminOrdersPage: React.FC = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [mobileView, setMobileView] = useState(false);

  // Fetch orders on component mount and when status filter changes
  useEffect(() => {
    fetchOrders();

    // Check if mobile view
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, [statusFilter]);

  const fetchOrders = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = statusFilter ? `?status=${statusFilter}` : '';
      const response = await fetch(`http://localhost:8000/api/admin/orders${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setAdminNotes(order.admin_notes || '');
    setUpdateStatus(order.status);
    
    // On mobile, scroll to the details section
    if (mobileView) {
      setTimeout(() => {
        const detailsSection = document.getElementById('order-details');
        if (detailsSection) {
          detailsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleStatusUpdate = async () => {
    if (!token || !selectedOrder) return;
    
    setIsUpdating(true);
    setUpdateSuccess(false);
    
    try {
      const response = await fetch(`http://localhost:8000/api/admin/orders/${selectedOrder.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: updateStatus,
          admin_notes: adminNotes,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      const data = await response.json();
      // Update the selected order with the returned data
      setSelectedOrder(data.data.order);
      setUpdateSuccess(true);
      
      // Refresh the orders list instead of trying to update it manually
      // This avoids issues with the orders array potentially being empty or filtered
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while updating the order');
    } finally {
      setIsUpdating(false);
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Mobile Order Card Component
  const OrderCard = ({ order }: { order: Order }) => (
    <div 
      className={`p-4 border rounded-lg mb-3 ${selectedOrder?.id === order.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}
      onClick={() => handleViewOrder(order)}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="font-medium text-gray-900">#{order.id}</span>
          <span className="text-sm text-gray-500 ml-2">{new Date(order.created_at).toLocaleDateString()}</span>
        </div>
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>
      <div className="mb-2">
        <p className="font-medium">{order.customer_name}</p>
        <p className="text-sm text-gray-500 truncate">{order.address_line1}, {order.city}</p>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-medium">₱{parseFloat(order.total_amount.toString()).toFixed(2)}</span>
        <button
          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
        >
          View Details
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <Link
          to="/admin"
          className="bg-black text-white px-4 py-2 rounded whitespace-nowrap"
        >
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded p-4 mb-6 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">Filter Orders</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-full text-sm font-medium w-full sm:w-auto ${
              statusFilter === 'pending' 
                ? 'bg-yellow-200 text-yellow-800' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-4 py-2 rounded-full text-sm font-medium w-full sm:w-auto ${
              statusFilter === 'approved' 
                ? 'bg-green-200 text-green-800' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setStatusFilter('shipped')}
            className={`px-4 py-2 rounded-full text-sm font-medium w-full sm:w-auto ${
              statusFilter === 'shipped' 
                ? 'bg-blue-200 text-blue-800' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Shipped
          </button>
          <button
            onClick={() => setStatusFilter('delivered')}
            className={`px-4 py-2 rounded-full text-sm font-medium w-full sm:w-auto ${
              statusFilter === 'delivered' 
                ? 'bg-indigo-200 text-indigo-800' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Delivered
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-4 py-2 rounded-full text-sm font-medium w-full sm:w-auto ${
              statusFilter === 'cancelled' 
                ? 'bg-red-200 text-red-800' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cancelled
          </button>
          <button
            onClick={() => setStatusFilter('')}
            className={`px-4 py-2 rounded-full text-sm font-medium w-full sm:w-auto ${
              statusFilter === '' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Orders
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white shadow rounded p-6 text-center">
          <p className="text-gray-600">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white shadow rounded p-6 text-center">
          <p className="text-gray-600">No orders found.</p>
        </div>
      ) : (
        <div className={`grid ${mobileView ? 'grid-cols-1' : 'md:grid-cols-12'} gap-4`}>
          {/* Order List - Changes based on screen size */}
          <div className={`${mobileView ? '' : 'md:col-span-7'} bg-white shadow rounded p-4`}>
            <h2 className="text-lg font-semibold mb-4">Orders</h2>
            
            {mobileView ? (
              // Mobile view: card layout
              <div>
                {orders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            ) : (
              // Desktop view: table layout
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map(order => (
                      <tr 
                        key={order.id} 
                        className={selectedOrder?.id === order.id ? 'bg-blue-50' : ''}
                      >
                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.customer_name}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₱{parseFloat(order.total_amount.toString()).toFixed(2)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Order Details */}
          <div id="order-details" className={`${mobileView ? 'mt-4' : 'md:col-span-5'} bg-white shadow rounded p-4`}>
            {selectedOrder ? (
              <div>
                <h2 className="text-lg font-semibold mb-4">Order #{selectedOrder.id} Details</h2>
                
                <div className="mb-6">
                  <p className="mb-1"><span className="font-medium">Date:</span> {formatDate(selectedOrder.created_at)}</p>
                  <p className="mb-1"><span className="font-medium">Status:</span> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedOrder.status)}`}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span></p>
                  {selectedOrder.approved_at && (
                    <p className="mb-1"><span className="font-medium">Approved:</span> {formatDate(selectedOrder.approved_at)}</p>
                  )}
                </div>
                
                <div className="mb-6">
                  <h3 className="text-md font-medium mb-2">Customer Information</h3>
                  <p className="mb-1"><span className="font-medium">Name:</span> {selectedOrder.customer_name}</p>
                  <p className="mb-1"><span className="font-medium">Email:</span> {selectedOrder.user?.email || 'No email available'}</p>
                  <p className="mb-1"><span className="font-medium">Instagram:</span> @{selectedOrder.instagram_username}</p>
                  <p className="mb-1"><span className="font-medium">Address:</span> {selectedOrder.address_line1}, {selectedOrder.barangay}, {selectedOrder.city}</p>
                  <p className="mb-1"><span className="font-medium">Mobile:</span> {selectedOrder.mobile_number}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-md font-medium mb-2">Payment Information</h3>
                  <p className="mb-1"><span className="font-medium">Method:</span> {selectedOrder.payment_method.replace('_', ' ').toUpperCase()}</p>
                  <p className="mb-1"><span className="font-medium">Total:</span> ₱{parseFloat(selectedOrder.total_amount.toString()).toFixed(2)}</p>
                  
                  {selectedOrder.payment_proof && (
                    <div className="mt-2">
                      <p className="font-medium mb-1">Payment Proof:</p>
                      <a 
                        href={`http://localhost:8000/storage/${selectedOrder.payment_proof}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Payment Proof
                      </a>
                    </div>
                  )}
                </div>

                <div className="mb-6 overflow-x-auto">
                  <h3 className="text-md font-medium mb-2">Order Items</h3>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size
                        </th>
                        <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.items && selectedOrder.items.map(item => (
                        <tr key={item.id}>
                          <td className="px-2 py-2 text-xs sm:text-sm text-gray-900">
                            {item.product_name}
                          </td>
                          <td className="px-2 py-2 text-xs sm:text-sm text-gray-500">
                            {item.size.toUpperCase()}
                          </td>
                          <td className="px-2 py-2 text-xs sm:text-sm text-gray-500 text-right">
                            {item.quantity}
                          </td>
                          <td className="px-2 py-2 text-xs sm:text-sm text-gray-500 text-right">
                            ₱{parseFloat(item.price.toString()).toFixed(2)}
                          </td>
                          <td className="px-2 py-2 text-xs sm:text-sm text-gray-900 text-right">
                            ₱{(parseFloat(item.price.toString()) * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={4} className="px-2 py-2 text-right text-xs sm:text-sm font-medium text-gray-900">
                          Total:
                        </td>
                        <td className="px-2 py-2 text-right text-xs sm:text-sm font-medium text-gray-900">
                          ₱{parseFloat(selectedOrder.total_amount.toString()).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="mb-6">
                  <h3 className="text-md font-medium mb-2">Update Order Status</h3>
                  
                  {updateSuccess && (
                    <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
                      Order updated successfully!
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={updateStatus}
                      onChange={(e) => setUpdateStatus(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admin Notes
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={4}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                      placeholder="Add internal notes about this order..."
                    />
                  </div>
                  
                  <button
                    onClick={handleStatusUpdate}
                    disabled={isUpdating || selectedOrder.status === updateStatus}
                    className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Updating...' : 'Update Order'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Select an order to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage; 