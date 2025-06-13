import React from 'react';
import { API_CONFIG } from '../config';
import type { Order } from '../types/order';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface OrdersPanelProps {
  filteredOrders: Order[];
  selectedOrder: Order | null;
  onSelectOrder: (order: Order | null) => void;
  loading: boolean;
  error: string | null;
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onClearFilters?: () => void;
  searchQuery?: string;
  onSearchQueryChange?: (q: string) => void;
  mobileView?: boolean;
  adminMode?: boolean;
  updateStatus?: string;
  onUpdateStatus?: (status: string) => void;
  adminNotes?: string;
  onAdminNotesChange?: (notes: string) => void;
  onStatusUpdate?: () => void;
  isUpdating?: boolean;
  updateSuccess?: boolean;
  getStatusBadgeClass: (status: string) => string;
  formatDate: (dateString: string) => string;
}

const OrdersPanel: React.FC<OrdersPanelProps> = ({
  filteredOrders,
  selectedOrder,
  onSelectOrder,
  loading,
  error,
  tabs,
  activeTab,
  onTabChange,
  onClearFilters,
  searchQuery,
  onSearchQueryChange,
  mobileView = false,
  adminMode = false,
  updateStatus = '',
  onUpdateStatus,
  adminNotes = '',
  onAdminNotesChange,
  onStatusUpdate,
  isUpdating = false,
  updateSuccess = false,
  getStatusBadgeClass,
  formatDate,
}) => {
  return (
    <>
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {/* Search (admin only) */}
      {adminMode && (
        <div className="bg-white shadow rounded p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Search by name, username, or order #"
                value={searchQuery || ''}
                onChange={e => onSearchQueryChange && onSearchQueryChange(e.target.value)}
              />
            </div>
            <div className="mt-2 md:mt-6">
              <button
                className="bg-gray-100 text-gray-800 px-6 py-2 rounded inline-block hover:bg-gray-200 transition-colors"
                onClick={onClearFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-2 rounded ${activeTab === tab.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-800'} font-medium`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label} {typeof tab.count === 'number' && <span>({tab.count})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white shadow rounded p-6 text-center">
          <p className="text-gray-600">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white shadow rounded p-6">
          <div className="text-center py-8">
            <h2 className="text-lg font-medium mb-2">No orders found</h2>
            <p className="text-gray-600 mb-4">Try adjusting your filters to see more results.</p>
            {onClearFilters && (
              <button
                onClick={onClearFilters}
                className="bg-gray-100 text-gray-800 px-6 py-2 rounded inline-block hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-12 gap-6">
          {/* Order List */}
          <div className={`${selectedOrder && mobileView ? 'hidden' : ''} md:col-span-5 lg:col-span-4 bg-white shadow rounded overflow-auto`} style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-semibold">Orders ({filteredOrders.length})</h2>
              {mobileView && selectedOrder && (
                <button
                  className="text-sm text-blue-600"
                  onClick={() => onSelectOrder(null)}
                >
                  ← Back to List
                </button>
              )}
            </div>
            <div className="divide-y divide-gray-200">
              {filteredOrders.map(order => (
                <div
                  key={order.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedOrder?.id === order.id ? 'bg-gray-100' : ''}`}
                  onClick={() => onSelectOrder(order)}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">Order #{order.id}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{order.customer_name}</p>
                  <p className="text-sm text-gray-600">@{order.instagram_username}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                    <p className="font-medium">₱{parseFloat(order.total_amount.toString()).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Details */}
          <div className={`${!selectedOrder && mobileView ? 'hidden' : ''} md:col-span-7 lg:col-span-8 bg-white shadow rounded overflow-auto`} style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {selectedOrder ? (
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">Order #{selectedOrder.id}</h2>
                    <p className="text-sm text-gray-500">Placed on {formatDate(selectedOrder.created_at)}</p>
                  </div>
                  {mobileView && (
                    <button
                      className="text-sm text-blue-600"
                      onClick={() => onSelectOrder(null)}
                    >
                      ← Back to List
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-md font-medium mb-2">Customer Information</h3>
                    <p className="mb-1"><span className="font-medium">Name:</span> {selectedOrder.customer_name}</p>
                    <p className="mb-1"><span className="font-medium">Email:</span> {selectedOrder.user?.email || 'No email available'}</p>
                    <p className="mb-1"><span className="font-medium">Instagram:</span> @{selectedOrder.instagram_username}</p>
                    <p className="mb-1"><span className="font-medium">Address:</span> {selectedOrder.address_line1}, {selectedOrder.barangay}, {selectedOrder.city}, {selectedOrder.province}</p>
                    <p className="mb-1"><span className="font-medium">Mobile:</span> {selectedOrder.mobile_number}</p>
                  </div>
                  <div>
                    <h3 className="text-md font-medium mb-2">Order Information</h3>
                    <p className="mb-1">
                      <span className="font-medium">Status:</span>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(selectedOrder.status)}`}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </span>
                    </p>
                    <p className="mb-1"><span className="font-medium">Payment Method:</span> {selectedOrder.payment_method}</p>
                    <p className="mb-1"><span className="font-medium">Total Amount:</span> ₱{parseFloat(selectedOrder.total_amount.toString()).toFixed(2)}</p>
                    <p className="mb-1"><span className="font-medium">Shipping Fee:</span> ₱{parseFloat((selectedOrder.shipping_fee || 0).toString()).toFixed(2)}</p>
                    <p className="mb-1"><span className="font-medium">Grand Total:</span> ₱{(parseFloat(selectedOrder.total_amount.toString()) + parseFloat((selectedOrder.shipping_fee || 0).toString())).toFixed(2)}</p>
                    {selectedOrder.approved_at && (
                      <p className="mb-1"><span className="font-medium">Approved:</span> {formatDate(selectedOrder.approved_at)}</p>
                    )}
                  </div>
                </div>

                {selectedOrder.payment_proof && (
                  <div className="mb-6">
                    <h3 className="text-md font-medium mb-2">Payment Proof</h3>
                    <div className="w-full max-w-sm border border-gray-200 rounded overflow-hidden">
                      <img
                        src={`${API_CONFIG.BASE_URL.replace('/api', '')}/storage/${selectedOrder.payment_proof}`}
                        alt="Payment Proof"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-md font-medium mb-2">Order Items</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size
                          </th>
                          <th scope="col" className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th scope="col" className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Admin controls for status update and notes */}
                {adminMode && (
                  <div>
                    <h3 className="text-md font-medium mb-4">Update Order Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          id="status"
                          className="w-full p-2 border border-gray-300 rounded"
                          value={updateStatus}
                          onChange={e => onUpdateStatus && onUpdateStatus(e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                          Admin Notes
                        </label>
                        <textarea
                          id="notes"
                          className="w-full p-2 border border-gray-300 rounded"
                          value={adminNotes}
                          onChange={e => onAdminNotesChange && onAdminNotesChange(e.target.value)}
                          rows={3}
                          placeholder="Add notes visible to customer (optional)"
                        ></textarea>
                      </div>
                    </div>
                    <button
                      className="bg-black text-white px-4 py-2 rounded disabled:bg-gray-400"
                      onClick={onStatusUpdate}
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'Updating...' : 'Update Order'}
                    </button>
                    {updateSuccess && (
                      <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
                        Order status updated successfully.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p>Select an order to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default OrdersPanel; 