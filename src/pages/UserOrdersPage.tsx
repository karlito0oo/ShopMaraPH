import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { OrderApi } from '../services/ApiService';
import { API_CONFIG } from '../config';
import TabButton from '../components/ui/TabButton';
import OrdersPanel from '../components/OrdersPanel';
import type { Order, OrderItem, User } from '../types/order';

const UserOrdersPage: React.FC = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [mobileView, setMobileView] = useState<boolean>(false);

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
      updateTabsWithCounts();
    }
  }, [orders, activeTab]);

  useEffect(() => {
    const checkMobile = () => {
      setMobileView(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Add a function to count orders by status
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

  // Add a state for tabs with counts
  const [tabsWithCounts, setTabsWithCounts] = useState(tabs);

  // Add a function to update tabs with counts
  const updateTabsWithCounts = () => {
    const counts = getStatusCounts();
    const updatedTabs = tabs.map(tab => ({
      ...tab,
      count: counts[tab.id as keyof typeof counts]
    }));
    setTabsWithCounts(updatedTabs);
  };

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

      <OrdersPanel
        orders={orders}
        filteredOrders={filteredOrders}
        selectedOrder={selectedOrder}
        onSelectOrder={setSelectedOrder}
        loading={loading}
        error={error}
        tabs={tabsWithCounts}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        getStatusBadgeClass={getStatusBadgeClass}
        formatDate={formatDate}
        adminMode={false}
        mobileView={mobileView}
      />
    </div>
  );
};

export default UserOrdersPage; 