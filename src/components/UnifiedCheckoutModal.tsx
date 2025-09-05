import React, { useState, useEffect } from 'react';
import { getProvinces, getCities, getBarangays } from 'select-philippines-address';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useGuestProfile } from '../context/GuestProfileContext';
import { useSettings } from '../context/SettingsContext';
import {  OrderApi } from '../services/ApiService';
import { nanoid } from 'nanoid';
import { useCart } from '../context/CartContext';

interface Province {
  province_code: string;
  province_name: string;
}

interface City {
  city_code: string;
  city_name: string;
  province_code: string;
}

interface Barangay {
  brgy_code: string;
  brgy_name: string;
  city_code: string;
}

interface UnifiedCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onOrderSuccess?: () => void;
  province?: string;
}

interface HoldTimerProps {
  expiryTime: number;
  handleExpired: () => void;
}

const HoldTimer: React.FC<HoldTimerProps> = ({ expiryTime, handleExpired }) => {
  const [timeLeft, setTimeLeft] = useState<number>(Math.abs(expiryTime));
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number): string => {
    if (seconds <= 0){
      handleExpired();
      return 'Expired';
    } 
  
    const totalSeconds = Math.floor(seconds); // 👈 Ensure it's a whole number
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
  
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-yellow-800 font-medium">Products on hold</p>
          <p className="text-sm text-yellow-600">Your selected items are reserved for:</p>
        </div>
        <div className="text-2xl font-bold font-header text-yellow-800">{formatTime(timeLeft)}</div>
      </div>
    </div>
  );
};

const initialFormData = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  instagramUsername: '',
  addressLine1: '',
  barangay: '',
  province: '',
  city: '',
  mobileNumber: '',
  paymentProof: null as File | null,
};

type FormMode = 'initial' | 'register' | 'checkout';

type Step = 1 | 2 | 3;

const UnifiedCheckoutModal: React.FC<UnifiedCheckoutModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  onOrderSuccess,
  province,
}) => {
  const { user, isAuthenticated, register } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { profile: guestProfile } = useGuestProfile();
  const settings = useSettings();
  const { cartItems, clearCart, holdProducts, fetchCart } = useCart();
  const [formMode, setFormMode] = useState<FormMode>(isAuthenticated ? 'checkout' : 'initial');
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState({ ...initialFormData });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [accountCreated, setAccountCreated] = useState(false);
  const [holdExpiryTime, setHoldExpiryTime] = useState<number | null>(null);

  // Address select state
  const [provinceOptions, setProvinceOptions] = useState<Province[]>([]);
  const [cityOptions, setCityOptions] = useState<City[]>([]);
  const [barangayOptions, setBarangayOptions] = useState<Barangay[]>([]);

  // Load provinces on mount
  useEffect(() => {
    getProvinces().then(setProvinceOptions);
  }, []);

  // Load cities when province changes
  useEffect(() => {
    if (formData.province) {
      getCities(formData.province).then(setCityOptions);
      setFormData((prev) => ({ ...prev, city: '', barangay: '' }));
      setBarangayOptions([]);
    }
  }, [formData.province]);

  // Load barangays when city changes
  useEffect(() => {
    if (formData.city) {
      getBarangays(formData.city).then(setBarangayOptions);
      setFormData((prev) => ({ ...prev, barangay: '' }));
    }
  }, [formData.city]);
  
  useEffect(() => {
    const handleEffect = async () => {
      if (currentStep === 2) {
        const response = await holdProducts();
        console.log(response);
        if(response.success){
          if (!response.is_hold_expired) {
            setHoldExpiryTime(response.hold_expiry_time_in_seconds);
          }
        }
        else{
          onClose();
          await fetchCart();
          return;
        }
        
      }
    }
    handleEffect();
  }, [currentStep]);

  // Prefill for logged-in users and guests, and update province from prop
  useEffect(() => {
    if (isOpen) {
      let provinceToUse = province || '';
      if (isAuthenticated && user) {
        const initial: any = {
          name: user.name || '',
          email: user.email || '',
        };
        if (profile) {
          const profileFields = {
            instagramUsername: profile.instagram_username || '',
            addressLine1: profile.address_line1 || '',
            barangay: profile.barangay || '',
            city: profile.city || '',
            mobileNumber: profile.mobile_number || '',
            province: provinceToUse || profile.province || '',
          };
          setFormData((prev) => ({ ...prev, ...initial, ...profileFields }));
        } else {
          setFormData((prev) => ({ ...prev, ...initial, province: provinceToUse }));
        }
      } else if (guestProfile) {
        // Prefill with guest profile data if available
        const guestFields = {
          name: guestProfile.customer_name || '',
          email: guestProfile.email || '',
          instagramUsername: guestProfile.instagram_username || '',
          addressLine1: guestProfile.address_line1 || '',
          barangay: guestProfile.barangay || '',
          city: guestProfile.city || '',
          mobileNumber: guestProfile.mobile_number || '',
          province: provinceToUse || guestProfile.province || '',
        };
        setFormData(() => ({ ...initialFormData, ...guestFields }));
      } else {
        setFormData(() => ({ ...initialFormData, province: provinceToUse }));
      }
      setFormMode(isAuthenticated ? 'checkout' : 'initial');
      setCurrentStep(1);
      setErrors({});
      setOrderSuccess(false);
      setOrderError(null);
      setIsSubmitting(false);
      setAccountCreated(false);
    }
  }, [isOpen, isAuthenticated, user, profile, guestProfile, province]);

  if (!isOpen) return null;

  // --- Handlers ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, paymentProof: e.target.files[0] });
      if (errors.paymentProof) setErrors({ ...errors, paymentProof: '' });
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  // --- Validation ---
  const validateStep = (step: Step): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (formMode === 'register') {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.password.trim()) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (formData.password !== formData.password_confirmation) newErrors.password_confirmation = 'Passwords do not match';
    } else {
      if (step === 1) {
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!isAuthenticated && !formData.email.trim()) newErrors.email = 'Email is required';
        else if (!isAuthenticated && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.instagramUsername.trim()) newErrors.instagramUsername = 'Instagram username is required';
        if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
        if (!formData.barangay.trim()) newErrors.barangay = 'Barangay is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
        if (!formData.province) newErrors.province = 'Province is required';
      } else if (step === 2) {
        if (!formData.paymentProof) newErrors.paymentProof = 'Proof of payment is required';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Stepper ---
  const nextStep =  () => {
    if (validateStep(currentStep)) setCurrentStep((s) => (s < 3 ? ((s + 1) as Step) : s));
  };
  const prevStep = () => setCurrentStep((s) => (s > 1 ? ((s - 1) as Step) : s));

  // --- Account Creation ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1)) return;
    setIsSubmitting(true);
    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.password_confirmation,
        JSON.stringify(cartItems.map(item => ({
          product_id: item.product.id
        })))
      );
      setAccountCreated(true);
      setFormMode('checkout');
    } catch (error: any) {
      setErrors({ form: error.message || 'Registration failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Order Submission ---
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);
    setOrderError(null);
    try {
      let shippingFee = 0;
      if (formData.province) {
        shippingFee = formData.province === 'Metro Manila' ? settings.deliveryFeeNcr : settings.deliveryFeeOutsideNcr;
      }
      const grandTotal = totalAmount + shippingFee;
      // Prepare order data
      const orderData = new FormData();
      orderData.append('customer_name', formData.name);
      orderData.append('instagram_username', formData.instagramUsername);
      orderData.append('address_line1', formData.addressLine1);
      orderData.append('barangay', formData.barangay);
      orderData.append('province', formData.province);
      orderData.append('city', formData.city);
      orderData.append('mobile_number', formData.mobileNumber);
      orderData.append('payment_proof', formData.paymentProof!);
      orderData.append('shipping_fee', shippingFee.toString());
      orderData.append('grand_total', grandTotal.toString());
      if (!isAuthenticated) {
        // Guest order
        let guestId = localStorage.getItem('guest_id');
        if (!guestId) {
          guestId = nanoid();
          localStorage.setItem('guest_id', guestId);
          window.dispatchEvent(new Event('guest_id_set'));
        }
        orderData.append('guest_id', guestId);
        orderData.append('email', formData.email);
        orderData.append('cart_items', JSON.stringify(cartItems.map(item => ({
          product_id: item.product.id
        }))));
        await OrderApi.createGuestOrder(orderData);
      } else {
        // User order
        await updateProfile({
          instagram_username: formData.instagramUsername,
          address_line1: formData.addressLine1,
          barangay: formData.barangay,
          province: formData.province,
          city: formData.city,
          mobile_number: formData.mobileNumber,
        });
        await OrderApi.createOrder(localStorage.getItem('token')!, orderData);
      }
      setOrderSuccess(true);
      clearCart();
      if (onOrderSuccess) onOrderSuccess();
    } catch (error: any) {
      setOrderError(error.message || 'An error occurred while processing your order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ModalHeader = ({title}: {title: string}) => {
    return (
        <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl leading-6 font-medium text-gray-900" id="modal-headline">
          {title}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="Close"
        >
          x
        </button>
      </div>
    )
  }
  // --- UI ---
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              {/* Stepper/Progress */}
              {(!isAuthenticated && formMode === 'initial') && (
                <>
                  <ModalHeader title='Before you checkout'/>
                  <p className="text-gray-600 mb-6">
                    Would you like to save your cart by creating an account, or continue as a guest?
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => setFormMode('register')}
                      className="w-full bg-[#ad688f] text-white px-4 py-3 rounded hover:bg-[#96577b] transition-colors"
                    >
                      Create an Account
                    </button>
                    <button
                      onClick={() => setFormMode('checkout')}
                      className="w-full border border-gray-300 bg-white text-gray-700 px-4 py-3 rounded hover:bg-gray-50 transition-colors"
                    >
                      Continue as Guest
                    </button>
                  </div>
                </>
              )}
              {formMode === 'register' && !accountCreated && (
                <>
                  <ModalHeader title='Create Your Account'/>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ad688f] focus:border-[#ad688f] sm:text-sm"
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ad688f] focus:border-[#ad688f] sm:text-sm"
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ad688f] focus:border-[#ad688f] sm:text-sm"
                      />
                      {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                    </div>
                    <div>
                      <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                      <input
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ad688f] focus:border-[#ad688f] sm:text-sm"
                      />
                      {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>}
                    </div>
                    {errors.form && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">{errors.form}</div>}
                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#ad688f] text-white px-4 py-3 rounded hover:bg-[#96577b] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Creating Account...' : 'Create Account & Continue'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormMode('initial')}
                        className="w-full text-gray-600 mt-2 text-sm"
                      >
                        Back to options
                      </button>
                    </div>
                  </form>
                </>
              )}
              {(formMode === 'checkout' || (formMode === 'register' && accountCreated)) && !orderSuccess && (
                <>
                
                <ModalHeader title='Checkout'/>
                  <div className="mt-4 mb-6">
                    <div className="flex items-center">
                      <div className={`flex items-center justify-center h-8 w-8 rounded-full ${currentStep >= 1 ? 'bg-[#ad688f] text-white' : 'bg-gray-200'}`}>1</div>
                      <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-[#ad688f]' : 'bg-gray-200'}`}></div>
                      <div className={`flex items-center justify-center h-8 w-8 rounded-full ${currentStep >= 2 ? 'bg-[#ad688f] text-white' : 'bg-gray-200'}`}>2</div>
                      <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? 'bg-[#ad688f]' : 'bg-gray-200'}`}></div>
                      <div className={`flex items-center justify-center h-8 w-8 rounded-full ${currentStep >= 3 ? 'bg-[#ad688f] text-white' : 'bg-gray-200'}`}>3</div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>Customer Info</span>
                      <span>Payment</span>
                      <span>Confirmation</span>
                    </div>
                  </div>
                  {orderError && (
                    <div className="bg-red-50 p-4 rounded border border-red-200 mb-4">
                      <p className="text-red-800">{orderError}</p>
                      <p className="text-sm text-red-600 mt-1">Please try again or contact support for assistance.</p>
                    </div>
                  )}
                  { holdExpiryTime && (
                    <HoldTimer expiryTime={holdExpiryTime} handleExpired={async () => {
                      await fetchCart();
                      onClose();
                    }} />
                  )}
                  <form onSubmit={handleOrderSubmit}>
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
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ad688f] focus:border-[#ad688f] sm:text-sm"
                          />
                          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>
                        {!isAuthenticated && (
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ad688f] focus:border-[#ad688f] sm:text-sm"
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                          </div>
                        )}
                        <div>
                          <label htmlFor="instagramUsername" className="block text-sm font-medium text-gray-700">Instagram Username</label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">@</span>
                            <input
                              type="text"
                              id="instagramUsername"
                              name="instagramUsername"
                              value={formData.instagramUsername}
                              onChange={handleChange}
                              className="flex-1 block w-full border border-gray-300 rounded-none rounded-r-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ad688f] focus:border-[#ad688f] sm:text-sm"
                            />
                          </div>
                          {errors.instagramUsername && <p className="mt-1 text-sm text-red-600">{errors.instagramUsername}</p>}
                        </div>
                        {/* Address fields in proper order: Province > City > Barangay > Address Line 1 */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="province" className="block text-sm font-medium text-gray-700">Province</label>
                            <select
                              id="province"
                              name="province"
                              value={formData.province}
                              onChange={handleSelectChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ad688f] focus:border-[#ad688f] sm:text-sm"
                            >
                              <option value="">Select Province</option>
                              {provinceOptions.map((prov: Province) => (
                                <option key={prov.province_code} value={prov.province_name}>{prov.province_name}</option>
                              ))}
                            </select>
                            {errors.province && <p className="mt-1 text-sm text-red-600">{errors.province}</p>}
                          </div>
                          <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                            <select
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleSelectChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ad688f] focus:border-[#ad688f] sm:text-sm"
                              disabled={!formData.province}
                            >
                              <option value="">Select City</option>
                              {cityOptions.map((city: City) => (
                                <option key={city.city_code} value={city.city_name}>{city.city_name}</option>
                              ))}
                            </select>
                            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="barangay" className="block text-sm font-medium text-gray-700">Barangay</label>
                            <select
                              id="barangay"
                              name="barangay"
                              value={formData.barangay}
                              onChange={handleSelectChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ad688f] focus:border-[#ad688f] sm:text-sm"
                              disabled={!formData.city}
                            >
                              <option value="">Select Barangay</option>
                              {barangayOptions.map((brgy: Barangay) => (
                                <option key={brgy.brgy_code} value={brgy.brgy_name}>{brgy.brgy_name}</option>
                              ))}
                            </select>
                            {errors.barangay && <p className="mt-1 text-sm text-red-600">{errors.barangay}</p>}
                          </div>
                          <div>
                            <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">Address Line 1</label>
                            <input
                              type="text"
                              id="addressLine1"
                              name="addressLine1"
                              value={formData.addressLine1}
                              onChange={handleChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ad688f] focus:border-[#ad688f] sm:text-sm"
                            />
                            {errors.addressLine1 && <p className="mt-1 text-sm text-red-600">{errors.addressLine1}</p>}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                            <input
                              type="text"
                              id="mobileNumber"
                              name="mobileNumber"
                              value={formData.mobileNumber}
                              onChange={handleChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ad688f] focus:border-[#ad688f] sm:text-sm"
                            />
                            {errors.mobileNumber && <p className="mt-1 text-sm text-red-600">{errors.mobileNumber}</p>}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Step 2: Payment */}
                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded border border-green-200">
                          <h4 className="font-medium text-green-800 mb-2">Order Summary</h4>
                          <ul className="text-sm text-gray-700 space-y-2">
                            <li><span className="font-medium">Name:</span> {formData.name}</li>
                            {!isAuthenticated && <li><span className="font-medium">Email:</span> {formData.email}</li>}
                            <li><span className="font-medium">Instagram:</span> @{formData.instagramUsername}</li>
                            <li><span className="font-medium">Address:</span> {formData.addressLine1}, {formData.barangay}, {formData.city}, {formData.province}</li>
                            <li><span className="font-medium">Mobile:</span> {formData.mobileNumber}</li>
                            <li><span className="font-medium">Subtotal:</span> ₱{totalAmount.toFixed(2)}</li>
                            <li><span className="font-medium">Shipping Fee:</span> {settings.isLoading ? 'Loading...' : `₱${formData.province ? (formData.province === 'Metro Manila' ? settings.deliveryFeeNcr : settings.deliveryFeeOutsideNcr).toFixed(2) : '0.00'}`}</li>
                            <li><span className="font-medium">Grand Total:</span> {settings.isLoading ? 'Loading...' : `₱${formData.province ? (totalAmount).toFixed(2) : totalAmount.toFixed(2)}`}</li>
                          </ul>
                        </div>
                        {!!settings.paymentOptionsDescription && (
                          <div className="mt-4">
                            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: settings.paymentOptionsDescription }} />
                          </div>
                        )}
                        <div className="mt-4">
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
                    {currentStep === 3 && settings.whatHappensAfterPayment && (
                      <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: settings.whatHappensAfterPayment }} />
                      </div>
                    )}
                    <div className="flex justify-between mt-6">
                      {currentStep > 1 && (
                        <button
                          type="button"
                          onClick={prevStep}
                          className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                          Back
                        </button>
                      )}
                      {currentStep < 3 && (
                        <button
                          type="button"
                          onClick={nextStep}
                          className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#ad688f] text-base font-medium text-white hover:bg-[#96577b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ad688f] sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Continue
                        </button>
                      )}
                      {currentStep === 3 && (
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#ad688f] text-base font-medium text-white hover:bg-[#96577b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ad688f] disabled:bg-gray-400 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          {isSubmitting ? 'Processing...' : 'Place Order'}
                        </button>
                      )}
                    </div>
                  </form>
                </>
              )}
              {orderSuccess && (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded border border-green-200">
                    <p className="text-gray-700 mb-2">
                      Thank you, fairy✨
                      <br />
                      <br />
                      Your order is now pending while we verify your payment within 24 hours. Once confirmed, your order will be carefully packed just for you. 💕
                      <br />
                      <br />
                      We can hold paid orders for up to 2 weeks. If you’d like us to hold your order for single shipping with other items, please message us on Instagram (@shopmaraph). Otherwise, your order will be shipped automatically. You’ll receive tracking details via email (or on Instagram if you’ve shared your username).
                      <br />
                      <br />
                      Thank you for your patience and understanding.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedCheckoutModal; 