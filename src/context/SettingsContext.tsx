import React, { createContext, useContext, useState, useEffect } from 'react';
import { SettingService } from '../services/SettingService';

interface SettingsContextType {
  deliveryFee: number;
  freeDeliveryThreshold: number;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: SettingsContextType = {
  deliveryFee: 80,
  freeDeliveryThreshold: 0,
  isLoading: true,
  refreshSettings: async () => {}
};

const SettingsContext = createContext<SettingsContextType>(defaultSettings);

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deliveryFee, setDeliveryFee] = useState<number>(defaultSettings.deliveryFee);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(defaultSettings.freeDeliveryThreshold);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const settings = await SettingService.getPublicSettings();
      setDeliveryFee(settings.delivery_fee);
      setFreeDeliveryThreshold(settings.free_delivery_threshold);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshSettings = async () => {
    await fetchSettings();
  };

  const value = {
    deliveryFee,
    freeDeliveryThreshold,
    isLoading,
    refreshSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}; 