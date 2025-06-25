import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import UnifiedCheckoutModal, { PH_PROVINCES } from '../components/UnifiedCheckoutModal';
import { useProfile } from '../context/ProfileContext';
import { useSettings } from '../context/SettingsContext';

const CartPage = () => {
  const { isAuthenticated } = useAuth();
  const [isUnifiedCheckoutOpen, setIsUnifiedCheckoutOpen] = useState(false);
  const { 
    cartItems, 
    removeFromCart, 
    getTotalPrice,
    clearCart,
    backupGuestCart
  } = useCart();

  const { profile } = useProfile();
  const { deliveryFeeNcr, deliveryFeeOutsideNcr, isLoading: settingsLoading } = useSettings();
  const [province, setProvince] = useState<string>(profile?.province || '');

  useEffect(() => {
    if (profile && profile.province) {
      setProvince(profile.province);
    }
  }, [profile]);

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
    setIsUnifiedCheckoutOpen(true);
  };

  const closeUnifiedCheckoutModal = () => {
    setIsUnifiedCheckoutOpen(false);
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProvince(e.target.value);
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
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <tr key={`desktop-${item.product.id}`}>
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
                    <div key={`mobile-${item.product.id}`} className="p-4">
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
              <div className="border-t pt-4 flex justify-between">
                <span className="font-medium text-lg">Total</span>
                <span className="font-medium text-lg">₱{Number(total).toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckoutClick}
                className="w-full bg-[#ad688f] text-white py-3 px-4 font-medium rounded hover:bg-[#96577b] transition-colors"
              >
                Checkout
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
  )
}

export default CartPage 