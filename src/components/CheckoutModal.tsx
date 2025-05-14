import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { OrderApi } from '../services/ApiService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
}

interface CheckoutFormData {
  name: string;
  instagramUsername: string;
  addressLine1: string;
  barangay: string;
  city: string;
  mobileNumber: string;
  paymentProof: File | null;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, totalAmount }) => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: '',
    instagramUsername: '',
    addressLine1: '',
    barangay: '',
    city: '',
    mobileNumber: '',
    paymentProof: null
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const { clearCart, cartItems, token } = useCart();

  // Pre-fill form data with user profile information when the modal opens
  useEffect(() => {
    if (isOpen) {
      // Start with the user's name from auth
      let initialData: Partial<CheckoutFormData> = {
        name: user?.name || '',
      };
      
      // Add profile data if available
      if (profile) {
        initialData = {
          ...initialData,
          instagramUsername: profile.instagram_username || '',
          addressLine1: profile.address_line1 || '',
          barangay: profile.barangay || '',
          city: profile.city || '',
          mobileNumber: profile.mobile_number || '',
        };
      }
      
      setFormData(prevData => ({
        ...prevData,
        ...initialData
      }));
      
      // Reset states when modal opens
      setCurrentStep(1);
      setErrors({});
      setOrderSuccess(false);
      setOrderError(null);
      setIsSubmitting(false);
    }
  }, [user, profile, isOpen]);

  const bankDetails = `
    Payment Options:
    
    GCash:
    Account Name: ShopMara PH
    Account Number: 09123456789
    
    Bank Transfer:
    BDO
    Account Name: ShopMara PH
    Account Number: 1234567890
    
    BPI
    Account Name: ShopMara PH
    Account Number: 9876543210
  `;

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (errors[name as keyof CheckoutFormData]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, paymentProof: e.target.files[0] });
      
      // Clear error when field is edited
      if (errors.paymentProof) {
        setErrors({ ...errors, paymentProof: '' });
      }
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof CheckoutFormData, string>> = {};
    
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.instagramUsername.trim()) newErrors.instagramUsername = 'Instagram username is required';
      if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
      if (!formData.barangay.trim()) newErrors.barangay = 'Barangay is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    } else if (step === 2) {
      if (!formData.paymentProof) newErrors.paymentProof = 'Proof of payment is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      // Save the profile information first
      try {
        setIsSubmitting(true);
        
        // First save user profile for future checkouts
        await saveUserProfile();
        
        // Then create the order
        await createOrder();
        
        // On success, show confirmation and clear cart
        setOrderSuccess(true);
        clearCart();
      } catch (error) {
        setOrderError(error instanceof Error ? error.message : 'An error occurred while processing your order');
        console.error('Order error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Save user profile information to be used in future checkouts
  const saveUserProfile = async () => {
    try {
      await updateProfile({
        instagram_username: formData.instagramUsername,
        address_line1: formData.addressLine1,
        barangay: formData.barangay,
        city: formData.city,
        mobile_number: formData.mobileNumber,
      });
      console.log('Profile saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  };

  // Create a new order with the cart items and shipping information
  const createOrder = async () => {
    if (!token || !formData.paymentProof) {
      throw new Error('Missing token or payment proof');
    }

    // Create a FormData object to send the payment proof file
    const orderData = new FormData();
    orderData.append('customer_name', formData.name);
    orderData.append('instagram_username', formData.instagramUsername);
    orderData.append('address_line1', formData.addressLine1);
    orderData.append('barangay', formData.barangay);
    orderData.append('city', formData.city);
    orderData.append('mobile_number', formData.mobileNumber);
    orderData.append('payment_proof', formData.paymentProof);

    try {
      const data = await OrderApi.createOrder(token, orderData);
      return data.data.order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="modal-headline"
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                  {orderSuccess ? 'Order Placed Successfully!' : `Checkout - Step ${currentStep} of 3`}
                </h3>
                
                {!orderSuccess && (
                  <>
                    {/* Progress Indicator */}
                    <div className="mt-4 mb-6">
                      <div className="flex items-center">
                        <div className={`flex items-center justify-center h-8 w-8 rounded-full ${currentStep >= 1 ? 'bg-black text-white' : 'bg-gray-200'}`}>
                          1
                        </div>
                        <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-black' : 'bg-gray-200'}`}></div>
                        <div className={`flex items-center justify-center h-8 w-8 rounded-full ${currentStep >= 2 ? 'bg-black text-white' : 'bg-gray-200'}`}>
                          2
                        </div>
                        <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? 'bg-black' : 'bg-gray-200'}`}></div>
                        <div className={`flex items-center justify-center h-8 w-8 rounded-full ${currentStep >= 3 ? 'bg-black text-white' : 'bg-gray-200'}`}>
                          3
                        </div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>Customer Info</span>
                        <span>Payment</span>
                        <span>Confirmation</span>
                      </div>
                    </div>
                  </>
                )}

                {orderError && (
                  <div className="bg-red-50 p-4 rounded border border-red-200 mb-4">
                    <p className="text-red-800">{orderError}</p>
                    <p className="text-sm text-red-600 mt-1">Please try again or contact support for assistance.</p>
                  </div>
                )}

                {orderSuccess ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded border border-green-200">
                      <h4 className="font-medium text-green-800 mb-2">Your order has been placed!</h4>
                      <p className="text-gray-700 mb-2">
                        Thank you for your order. We have received your payment proof and will verify it shortly.
                      </p>
                      <p className="text-gray-700">
                        Your order is now on <span className="font-medium">hold</span> and the products have been reserved for you.
                      </p>
                    </div>
                      
                    <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                      <h4 className="font-medium text-yellow-800 mb-2">What happens next?</h4>
                      <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                        <li>We'll verify your payment within 24 hours</li>
                        <li>Once verified, your order will be processed and packed</li>
                        <li>You'll receive a shipping confirmation on Instagram</li>
                        <li>Your order will be delivered within 3-5 business days</li>
                      </ol>
                    </div>
                  </div>
                ) : (
                  <form>
                    {/* Step 1: Customer Information */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                          />
                          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>
                        
                        <div>
                          <label htmlFor="instagramUsername" className="block text-sm font-medium text-gray-700">Instagram Username</label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                              @
                            </span>
                            <input
                              type="text"
                              id="instagramUsername"
                              name="instagramUsername"
                              value={formData.instagramUsername}
                              onChange={handleChange}
                              className="flex-1 block w-full border border-gray-300 rounded-none rounded-r-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                            />
                          </div>
                          {errors.instagramUsername && <p className="mt-1 text-sm text-red-600">{errors.instagramUsername}</p>}
                        </div>
                        
                        <div>
                          <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">Address Line 1</label>
                          <input
                            type="text"
                            id="addressLine1"
                            name="addressLine1"
                            value={formData.addressLine1}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                          />
                          {errors.addressLine1 && <p className="mt-1 text-sm text-red-600">{errors.addressLine1}</p>}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="barangay" className="block text-sm font-medium text-gray-700">Barangay</label>
                            <input
                              type="text"
                              id="barangay"
                              name="barangay"
                              value={formData.barangay}
                              onChange={handleChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                            />
                            {errors.barangay && <p className="mt-1 text-sm text-red-600">{errors.barangay}</p>}
                          </div>
                          
                          <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                            <input
                              type="text"
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                            />
                            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                          <input
                            type="text"
                            id="mobileNumber"
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                          />
                          {errors.mobileNumber && <p className="mt-1 text-sm text-red-600">{errors.mobileNumber}</p>}
                        </div>
                      </div>
                    )}
                    
                    {/* Step 2: Payment Information */}
                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Total Amount: ₱{totalAmount.toFixed(2)}</h4>
                          
                          <div className="bg-gray-50 p-4 rounded text-sm whitespace-pre-line">
                            {bankDetails}
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="paymentProof" className="block text-sm font-medium text-gray-700">Proof of Payment</label>
                          <input
                            type="file"
                            id="paymentProof"
                            name="paymentProof"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                          />
                          <p className="mt-1 text-xs text-gray-500">Please upload a screenshot of your payment receipt.</p>
                          {errors.paymentProof && <p className="mt-1 text-sm text-red-600">{errors.paymentProof}</p>}
                        </div>
                      </div>
                    )}
                    
                    {/* Step 3: Confirmation */}
                    {currentStep === 3 && (
                      <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded border border-green-200">
                          <h4 className="font-medium text-green-800 mb-2">Order Summary</h4>
                          <ul className="text-sm text-gray-700 space-y-2">
                            <li><span className="font-medium">Name:</span> {formData.name}</li>
                            <li><span className="font-medium">Instagram:</span> @{formData.instagramUsername}</li>
                            <li><span className="font-medium">Address:</span> {formData.addressLine1}, {formData.barangay}, {formData.city}</li>
                            <li><span className="font-medium">Mobile:</span> {formData.mobileNumber}</li>
                            <li><span className="font-medium">Total Amount:</span> ₱{totalAmount.toFixed(2)}</li>
                            <li>
                              <span className="font-medium">Payment Proof:</span> {formData.paymentProof?.name}
                            </li>
                          </ul>
                        </div>
                        
                        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                          <h4 className="font-medium text-yellow-800 mb-2">What happens next?</h4>
                          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                            <li>We'll verify your payment within 24 hours</li>
                            <li>Once verified, your order will be processed and packed</li>
                            <li>You'll receive a shipping confirmation on Instagram</li>
                            <li>Your order will be delivered within 3-5 business days</li>
                          </ol>
                        </div>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {orderSuccess ? (
              <button
                type="button"
                onClick={onClose}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-black text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black sm:ml-3 sm:w-auto sm:text-sm"
              >
                Close
              </button>
            ) : (
              <>
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-black text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-black text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-400 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isSubmitting ? 'Processing...' : 'Place Order'}
                  </button>
                )}
                
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Back
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal; 