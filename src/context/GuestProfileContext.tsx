import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { GuestProfileApi } from '../services/ApiService';
import { useToast } from './ToastContext';

interface GuestProfile {
  customer_name: string;
  instagram_username?: string;
  email?: string;
  address_line1: string;
  barangay: string;
  province: string;
  city: string;
  mobile_number: string;
}

interface GuestProfileContextType {
  profile: GuestProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  saveProfile: (profileData: GuestProfile) => Promise<void>;
}

const GuestProfileContext = createContext<GuestProfileContextType | undefined>(undefined);

// Key for guest ID in localStorage
const GUEST_ID_KEY = 'guest_id';

export const GuestProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<GuestProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Get headers for API requests
  const getHeaders = (): Record<string, string> => {
    const guestId = localStorage.getItem(GUEST_ID_KEY);
    return guestId ? { 'X-Guest-ID': guestId } : {};
  };

  const fetchProfile = async () => {
    const guestId = localStorage.getItem(GUEST_ID_KEY);
    if (!guestId) {
      setProfile(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const headers: Record<string, string> = { 'X-Guest-ID': guestId };
      const response = await GuestProfileApi.getProfile(headers);
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching guest profile:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching the profile');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (profileData: GuestProfile) => {
    const guestId = localStorage.getItem(GUEST_ID_KEY);
    if (!guestId) {
      showToast('Guest ID not found', 'error');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const headers: Record<string, string> = { 'X-Guest-ID': guestId };
      const response = await GuestProfileApi.saveProfile(headers, profileData);
      setProfile(response.data);
      showToast('Profile saved successfully', 'success');
    } catch (error) {
      console.error('Error saving guest profile:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while saving the profile');
      showToast('Failed to save profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch profile when guest ID changes
  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <GuestProfileContext.Provider
      value={{
        profile,
        isLoading,
        error,
        fetchProfile,
        saveProfile,
      }}
    >
      {children}
    </GuestProfileContext.Provider>
  );
};

export const useGuestProfile = () => {
  const context = useContext(GuestProfileContext);
  if (context === undefined) {
    throw new Error('useGuestProfile must be used within a GuestProfileProvider');
  }
  return context;
}; 