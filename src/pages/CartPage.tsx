import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import CheckoutModal from '../components/CheckoutModal';
import CheckoutPromptModal from '../components/CheckoutPromptModal';
import GuestCheckoutModal from '../components/GuestCheckoutModal';
import { OrderApi, CartApi } from '../services/ApiService';
import { useProfile } from '../context/ProfileContext';
import { useSettings } from '../context/SettingsContext';
import { PH_PROVINCES } from '../components/CheckoutModal';

const CartPage = () => {
  const { isAuthenticated, register } = useAuth();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isGuestCheckoutModalOpen, setIsGuestCheckoutModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { 
    cartItems, 
    removeFromCart, 
    getTotalPrice,
    clearCart,
    backupGuestCart
  } = useCart();

  const { profile, updateProfile } = useProfile();
  const { deliveryFeeNcr, deliveryFeeOutsideNcr, isLoading: settingsLoading } = useSettings();
  const [province, setProvince] = useState<string>(profile?.province || '');
  const [isProvinceSaving, setIsProvinceSaving] = useState(false);

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
    if (isAuthenticated) {
      // If user is logged in, go straight to checkout
      setIsCheckoutModalOpen(true);
    } else {
      // If user is not logged in, show the prompt
      setIsPromptModalOpen(true);
    }
  };

  const closeCheckoutModal = () => {
    setIsCheckoutModalOpen(false);
  };

  const closePromptModal = () => {
    setIsPromptModalOpen(false);
  };

  const closeGuestCheckoutModal = () => {
    setIsGuestCheckoutModalOpen(false);
  };

  const handleContinueAsGuest = () => {
    setIsPromptModalOpen(false);
    setIsGuestCheckoutModalOpen(true);
  };

  const handleCreateAccount = async (name: string, email: string, password: string) => {
    try {
      setIsProcessing(true);
      console.log("1. Starting account creation process");
      
      // Backup the guest cart
      const guestCartItems = backupGuestCart();
      console.log("2. Guest cart items backed up:", guestCartItems.length);
      
      // Register the user
      console.log("3. Calling register function");
      const userData = await register(name, email, password, password);
      console.log("4. Registration successful, token:", userData.token ? "received" : "missing");
      
      // Use the token directly from registration response
      const token = userData.token;
      
      // Add a small delay to ensure authentication state is updated
      console.log("5. Waiting for auth state to update");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Load cart items directly using the CartApi service
      if (guestCartItems.length > 0 && token) {
        console.log("6. Manually adding cart items using CartApi");
        
        // Process each item one by one using the API directly
        for (const item of guestCartItems) {
          console.log("Adding item to user cart via API:", item.product.id, item.size, item.quantity);
          try {
            const response = await CartApi.addToCart(
              token, 
              item.product.id, 
              item.size, 
              item.quantity
            );
            console.log("Cart API response:", response.success ? "success" : "failed");
          } catch (error) {
            console.error("Error adding item to cart:", error);
          }
        }
      }
      
      
      // Store success flag in sessionStorage to show checkout modal after reload
      sessionStorage.setItem('showCheckoutAfterReload', 'true');
      
      // Reload the page to ensure cart is properly loaded with the new user's data
      console.log("9. Reloading page to refresh cart data");
      window.location.reload();
      
    } catch (error) {
      console.error("Error in handleCreateAccount:", error);
      setIsProcessing(false);
      // Error handling is done inside the CheckoutPromptModal component
      throw error;
    }
  };

  const handleGuestOrderSubmit = async (formData: any) => {
    const data = new FormData();
    data.append('customer_name', formData.name);
    data.append('email', formData.email);
    data.append('instagram_username', formData.instagramUsername);
    data.append('address_line1', formData.addressLine1);
    data.append('barangay', formData.barangay);
    data.append('province', formData.province);
    data.append('city', formData.city);
    data.append('mobile_number', formData.mobileNumber);
    data.append('payment_proof', formData.paymentProof);
    data.append('cart_items', JSON.stringify(cartItems.map(item => ({
      product_id: item.product.id,
      size: item.size,
      quantity: item.quantity,
    }))));
    data.append('shipping_fee', String(shipping));
    if (formData.guest_id) {
      data.append('guest_id', formData.guest_id);
    }
    await OrderApi.createGuestOrder(data);
    clearCart();
  };

  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvince = e.target.value;
    setProvince(newProvince);
    if (isAuthenticated) {
      setIsProvinceSaving(true);
      try {
        await updateProfile({ province: newProvince });
      } catch (err) {
        console.error('Failed to update province:', err);
      } finally {
        setIsProvinceSaving(false);
      }
    }
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
                      <tr key={`desktop-${item.product.id}-${item.size}`}>
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
                              <div className="text-sm text-gray-500">Size: {item.size.toUpperCase()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">₱{item.product.price.toFixed(2)}</div>
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
                    <div key={`mobile-${item.product.id}-${item.size}`} className="p-4">
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
                          <div className="text-sm text-gray-500">Size: {item.size.toUpperCase()}</div>
                          <div className="text-sm font-medium text-gray-900 mt-1">₱{item.product.price.toFixed(2)}</div>
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
                <span className="font-medium">₱{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Shipping</span>
                <select
                  className="border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-black focus:border-black text-sm"
                  value={province}
                  onChange={handleProvinceChange}
                  disabled={isProvinceSaving || settingsLoading}
                >
                  {PH_PROVINCES.map((prov) => (
                    <option key={prov.value} value={prov.value}>{prov.label}</option>
                  ))}
                </select>
                <span className="font-medium ml-2">
                  {province
                    ? (settingsLoading ? 'Loading...' : `₱${shipping.toFixed(2)}`)
                    : '—'}
                </span>
              </div>
              <div className="border-t pt-4 flex justify-between">
                <span className="font-medium text-lg">Total</span>
                <span className="font-medium text-lg">₱{total.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckoutClick}
                disabled={isProcessing}
                className="w-full bg-[#ad688f] text-white py-3 px-4 font-medium rounded hover:bg-[#96577b] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Checkout'}
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

      {/* For logged-in users */}
      <CheckoutModal 
        isOpen={isCheckoutModalOpen} 
        onClose={closeCheckoutModal} 
        totalAmount={total}
      />

      {/* For non-logged-in users - prompt to login or continue as guest */}
      <CheckoutPromptModal
        isOpen={isPromptModalOpen}
        onClose={closePromptModal}
        onContinueAsGuest={handleContinueAsGuest}
        onCreateAccount={handleCreateAccount}
      />

      {/* For guest checkout */}
      <GuestCheckoutModal 
        isOpen={isGuestCheckoutModalOpen}
        onClose={closeGuestCheckoutModal}
        totalAmount={subtotal}
        onSubmitOrder={handleGuestOrderSubmit}
        province={province}
        setProvince={setProvince}
      />
    </div>
  )
}

export default CartPage 