import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { OrderApi } from '../../services/ApiService';
import { API_CONFIG } from '../../config';
import AdminLayout from '../../components/layouts/AdminLayout';
import OrdersPanel from '../../components/OrdersPanel';
import type { Order, OrderItem, User } from '../../types/order';

const AdminOrdersPage: React.FC = () => {
  const { token, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileView, setMobileView] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Count orders by status
  const getStatusCounts = () => {
    const counts = {
      all: orders.length,
      pending: 0,
      approved: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };
    
    orders.forEach(order => {
      if (counts[order.status as keyof typeof counts] !== undefined) {
        counts[order.status as keyof typeof counts]++;
      }
    });
    
    return counts;
  };

  // Define tabs for order statuses
  const orderCounts = getStatusCounts();
  const tabs = [
    { id: 'all', label: 'All Orders', count: orderCounts.all },
    { id: 'pending', label: 'Pending', count: orderCounts.pending },
    { id: 'approved', label: 'Approved', count: orderCounts.approved },
    { id: 'shipped', label: 'Shipped', count: orderCounts.shipped },
    { id: 'delivered', label: 'Delivered', count: orderCounts.delivered },
    { id: 'cancelled', label: 'Cancelled', count: orderCounts.cancelled },
  ];

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'all') {
      setStatusFilter('');
    } else {
      setStatusFilter(tabId);
    }
  };

  useEffect(() => {
    // Check if we're on mobile
    const checkMobile = () => {
      setMobileView(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    fetchOrders();
  }, [isAdmin]);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter, searchQuery]);

  const fetchOrders = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await OrderApi.getAllOrders(token);
      setOrders(data.data.orders);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Apply search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.customer_name.toLowerCase().includes(lowerQuery) ||
        order.instagram_username.toLowerCase().includes(lowerQuery) ||
        String(order.id).includes(lowerQuery) ||
        order.mobile_number.includes(lowerQuery)
      );
    }
    
    setFilteredOrders(filtered);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setUpdateStatus(order.status);
    setAdminNotes(order.admin_notes || '');
    setUpdateSuccess(false);
  };

  const handleStatusUpdate = async () => {
    if (!token || !selectedOrder) return;
    
    setIsUpdating(true);
    setUpdateSuccess(false);
    
    try {
      await OrderApi.updateOrderStatus(token, selectedOrder.id, updateStatus, adminNotes);
      
      // Update the selected order in place
      if (selectedOrder) {
        const updatedOrder = {
          ...selectedOrder,
          status: updateStatus,
          admin_notes: adminNotes,
        };
        setSelectedOrder(updatedOrder);
      }
      
      // Refresh orders
      fetchOrders();
      setUpdateSuccess(true);
    } catch (error) {
      console.error('Error updating order status:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while updating order status');
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
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (!isAdmin) {
    return null; // AdminLayout will handle auth check
  }

  return (
    <AdminLayout 
      title="Order Management"
      showBackButton={true}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      darkTabs={true}
    >
      <OrdersPanel
        orders={orders}
        filteredOrders={filteredOrders}
        selectedOrder={selectedOrder}
        onSelectOrder={(order: Order | null) => {
          setSelectedOrder(order);
          setUpdateStatus(order?.status || '');
          setAdminNotes(order?.admin_notes || '');
          setUpdateSuccess(false);
        }}
        loading={loading}
        error={error}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onClearFilters={() => {
          setSearchQuery('');
          setStatusFilter('');
          setActiveTab('all');
        }}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        mobileView={mobileView}
        adminMode={true}
        updateStatus={updateStatus}
        onUpdateStatus={setUpdateStatus}
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        onStatusUpdate={handleStatusUpdate}
        isUpdating={isUpdating}
        updateSuccess={updateSuccess}
        getStatusBadgeClass={getStatusBadgeClass}
        formatDate={formatDate}
      />
    </AdminLayout>
  );
};

export default AdminOrdersPage; 