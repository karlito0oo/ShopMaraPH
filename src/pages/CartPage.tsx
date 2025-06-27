import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import UnifiedCheckoutModal, { PH_PROVINCES } from '../components/UnifiedCheckoutModal';
import { useProfile } from '../context/ProfileContext';
import { useGuestProfile } from '../context/GuestProfileContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import type { Product } from '../types/product';
import { GUEST_ID_KEY } from '../constants';

const CartPage = () => {
  const { isAuthenticated } = useAuth();
  const [isUnifiedCheckoutOpen, setIsUnifiedCheckoutOpen] = useState(false);
  const { 
    cartItems, 
    removeFromCart, 
    getTotalPrice,
    clearCart,
  } = useCart();

  const { profile } = useProfile();
  const { profile: guestProfile } = useGuestProfile();
  const { deliveryFeeNcr, deliveryFeeOutsideNcr, isLoading: settingsLoading } = useSettings();
  const { showToast } = useToast();
  const [province, setProvince] = useState('');

  // Check if any products are unavailable (sold or on hold by others)
  const hasUnavailableProducts = cartItems.some(item => {
    if (item.product.status === 'Sold') return true;
    
    if (item.product.status === 'OnHold') {
      const currentUserId = isAuthenticated ? profile?.id : localStorage.getItem(GUEST_ID_KEY);
      const isHeldByCurrentUser = 
        item.product.onhold_by_id === currentUserId && 
        item.product.onhold_by_type === (isAuthenticated ? 'user' : 'guest');
      
      return !isHeldByCurrentUser; // Only unavailable if NOT held by current user
    }
    
    return false;
  });

  useEffect(() => {
    if (isAuthenticated && profile?.province) {
      setProvince(profile.province);
    } else if (!isAuthenticated && guestProfile?.province) {
      setProvince(guestProfile.province);
    }
  }, [isAuthenticated, profile, guestProfile]);

  const subtotal = getTotalPrice();
  let shipping = 0;
  if (cartItems.length > 0) {
    if (province) {
      shipping = province === 'Metro Manila' ? deliveryFeeNcr : deliveryFeeOutsideNcr;
    } else {
      shipping = 0;
    }
  }
  const total = subtotal + shipping;

  const handleCheckoutClick = () => {
    if (hasUnavailableProducts) {
      showToast('Please remove unavailable items from your cart before proceeding to checkout.', 'error');
      return;
    }
    setIsUnifiedCheckoutOpen(true);
  };

  const closeUnifiedCheckoutModal = () => {
    setIsUnifiedCheckoutOpen(false);
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProvince(e.target.value);
  };

  const getProductStatusBadge = (product: Product) => {
    if (product.status === 'Sold') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
          Sold
        </span>
      );
    } else if (product.status === 'OnHold') {
      const currentUserId = isAuthenticated ? profile?.id : localStorage.getItem(GUEST_ID_KEY);
      const isHeldByCurrentUser = 
        product.onhold_by_id === currentUserId && 
        product.onhold_by_type === (isAuthenticated ? 'user' : 'guest');

      return (
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
          isHeldByCurrentUser 
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isHeldByCurrentUser ? 'Reserved by You' : 'On Hold'}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12 bg-white shadow rounded p-8">
          <p className="text-xl mb-6">Your cart is empty</p>
          <Link 
            to="/products" 
            className="inline-block border border-black px-8 py-3 hover:bg-black hover:text-white transition-colors no-underline text-black"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Cart Items - Desktop View */}
            <div className="bg-white shadow rounded overflow-hidden">
              <div className="hidden md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <tr key={`desktop-${item.product.id}`} className={item.product.status !== 'Available' ? 'bg-gray-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-16 w-16 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                              <img 
                                src={item.product.image} 
                                alt={item.product.name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                              <div className="text-sm text-gray-500">Size: {item.product.size?.toUpperCase()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">₱{Number(item.product.price).toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getProductStatusBadge(item.product)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            className="text-red-600 hover:text-red-800 font-medium"
                            onClick={() => item.id !== undefined ? removeFromCart(item.id) : null}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Cart Items - Mobile View */}
              <div className="md:hidden">
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <div key={`mobile-${item.product.id}`} className={`p-4 ${item.product.status !== 'Available' ? 'bg-gray-50' : ''}`}>
                      <div className="flex mb-4">
                        <div className="h-20 w-20 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                          <img 
                            src={item.product.image} 
                            alt={item.product.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-grow">
                          <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                          <div className="text-sm text-gray-500">Size: {item.product.size?.toUpperCase()}</div>
                          <div className="text-sm font-medium text-gray-900 mt-1">₱{Number(item.product.price).toFixed(2)}</div>
                          <div className="mt-2">{getProductStatusBadge(item.product)}</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end items-center mt-2">
                        <button 
                          className="text-red-600 hover:text-red-800 font-medium"
                          onClick={() => item.id !== undefined ? removeFromCart(item.id) : null}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 flex justify-between border-t border-gray-200">
                <Link 
                  to="/products" 
                  className="text-sm font-medium text-gray-700 hover:text-black"
                >
                  Continue Shopping
                </Link>
                <button 
                  onClick={clearCart}
                  className="text-sm font-medium text-red-600 hover:text-red-800"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="bg-white shadow rounded p-6">
            <h2 className="text-lg font-medium mb-4">Order Summary</h2>
            {hasUnavailableProducts && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  Some items in your cart are no longer available. Please remove them before proceeding to checkout.
                </p>
              </div>
            )}
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                <span className="font-medium">₱{Number(subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Shipping</span>
                <select
                  className="border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-black focus:border-black text-sm ml-2"
                  value={province}
                  onChange={handleProvinceChange}
                  disabled={settingsLoading}
                >
                  {PH_PROVINCES.map((prov) => (
                    <option key={prov.value} value={prov.value}>{prov.label}</option>
                  ))}
                </select>
                <span className="font-medium ml-2">
                  {province
                    ? (settingsLoading ? 'Loading...' : `₱${Number(shipping).toFixed(2)}`)
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-4">
                <span className="font-medium text-lg">Total</span>
                <span className="font-medium text-lg">₱{Number(total).toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckoutClick}
                disabled={hasUnavailableProducts}
                className={`w-full py-3 px-4 font-medium rounded transition-colors ${
                  hasUnavailableProducts
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#ad688f] text-white hover:bg-[#96577b]'
                }`}
              >
                {hasUnavailableProducts ? 'Remove Unavailable Items' : 'Checkout'}
              </button>
              {isAuthenticated && (
                <Link
                  to="/my-orders"
                  className="w-full text-center block text-gray-700 hover:text-black py-2 text-sm font-medium"
                >
                  View Your Orders
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <UnifiedCheckoutModal
        isOpen={isUnifiedCheckoutOpen}
        onClose={closeUnifiedCheckoutModal}
        totalAmount={total}
        province={province}
      />
    </div>
  );
};

export default CartPage; 