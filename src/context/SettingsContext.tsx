import React, { createContext, useContext, useState, useEffect } from "react";
import { SettingService } from "../services/SettingService";

interface SettingsContextType {
  deliveryFeeNcr: number;
  deliveryFeeOutsideNcr: number;
  freeDeliveryThreshold: number;
  paymentOptionsDescription: string;
  whatHappensAfterPayment: string;
  thanksMessage: string;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: SettingsContextType = {
  deliveryFeeNcr: 80,
  deliveryFeeOutsideNcr: 120,
  freeDeliveryThreshold: 0,
  paymentOptionsDescription: "",
  whatHappensAfterPayment: "",
  thanksMessage: "",
  isLoading: true,
  refreshSettings: async () => {},
};

const SettingsContext = createContext<SettingsContextType>(defaultSettings);

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [deliveryFeeNcr, setDeliveryFeeNcr] = useState<number>(
    defaultSettings.deliveryFeeNcr
  );
  const [deliveryFeeOutsideNcr, setDeliveryFeeOutsideNcr] = useState<number>(
    defaultSettings.deliveryFeeOutsideNcr
  );
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(
    defaultSettings.freeDeliveryThreshold
  );
  const [paymentOptionsDescription, setPaymentOptionsDescription] =
    useState<string>(defaultSettings.paymentOptionsDescription);
  const [whatHappensAfterPayment, setWhatHappensAfterPayment] =
    useState<string>(defaultSettings.whatHappensAfterPayment);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [thanksMessage, setThanksMessage] = useState<string>(
    defaultSettings.whatHappensAfterPayment
  );

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const settings = await SettingService.getPublicSettings();
      setDeliveryFeeNcr(settings.delivery_fee_ncr);
      setDeliveryFeeOutsideNcr(settings.delivery_fee_outside_ncr);
      setFreeDeliveryThreshold(settings.free_delivery_threshold);
      setPaymentOptionsDescription(settings.payment_options_description || "");
      setWhatHappensAfterPayment(settings.what_happens_after_payment || "");
      setThanksMessage(settings.thanks_message || "");
    } catch (error) {
      console.error("Error fetching settings:", error);
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
    deliveryFeeNcr,
    deliveryFeeOutsideNcr,
    freeDeliveryThreshold,
    paymentOptionsDescription,
    whatHappensAfterPayment,
    thanksMessage,
    isLoading,
    refreshSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
