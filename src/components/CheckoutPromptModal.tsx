import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface CheckoutPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueAsGuest: () => void;
  onCreateAccount: (name: string, email: string, password: string) => Promise<void>;
}

const CheckoutPromptModal: React.FC<CheckoutPromptModalProps> = ({ 
  isOpen, 
  onClose, 
  onContinueAsGuest, 
  onCreateAccount 
}) => {
  const [formMode, setFormMode] = useState<'initial' | 'register'>('initial');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await onCreateAccount(formData.name, formData.email, formData.password);
      // After successful account creation, the parent component will handle redirection
    } catch (error) {
      console.error('Account creation error:', error);
      if (error instanceof Error) {
        setErrors({ form: error.message });
      } else {
        setErrors({ form: 'An error occurred while creating your account' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full"
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="modal-headline"
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              {formMode === 'initial' ? (
                <>
                  <h3 className="text-xl leading-6 font-medium text-gray-900 mb-4" id="modal-headline">
                    Before you checkout
                  </h3>
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
                      onClick={onContinueAsGuest}
                      className="w-full border border-gray-300 bg-white text-gray-700 px-4 py-3 rounded hover:bg-gray-50 transition-colors"
                    >
                      Continue as Guest
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl leading-6 font-medium text-gray-900 mb-4" id="modal-headline">
                    Create Your Account
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create an account to save your cart and track your orders.
                  </p>

                  {errors.form && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">
                      {errors.form}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
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
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPromptModal; 