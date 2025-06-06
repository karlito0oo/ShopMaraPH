import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SettingService } from '../../services/SettingService';

interface DeliverySettingsProps {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

const DeliverySettings = ({ onSuccess, onError }: DeliverySettingsProps) => {
  const { token } = useAuth();
  const [deliveryFeeNcr, setDeliveryFeeNcr] = useState<number>(80);
  const [deliveryFeeOutsideNcr, setDeliveryFeeOutsideNcr] = useState<number>(120);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const settings = await SettingService.getAllSettings(token);
        const ncrSetting = settings.find(s => s.key === 'delivery_fee_ncr');
        const outsideNcrSetting = settings.find(s => s.key === 'delivery_fee_outside_ncr');
        const thresholdSetting = settings.find(s => s.key === 'free_delivery_threshold');
        if (ncrSetting) setDeliveryFeeNcr(parseInt(ncrSetting.value));
        if (outsideNcrSetting) setDeliveryFeeOutsideNcr(parseInt(outsideNcrSetting.value));
        if (thresholdSetting) setFreeDeliveryThreshold(parseInt(thresholdSetting.value));
      } catch (err) {
        const errorMessage = 'Failed to load delivery settings';
        if (onError) onError(errorMessage);
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [token, onError]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      setSaving(true);
      const response = await SettingService.updateMultipleSettings(token, [
        { key: 'delivery_fee_ncr', value: deliveryFeeNcr },
        { key: 'delivery_fee_outside_ncr', value: deliveryFeeOutsideNcr },
        { key: 'free_delivery_threshold', value: freeDeliveryThreshold }
      ]);
      if (response && !Boolean(response.errors?.length)) {
        const successMessage = 'Delivery settings updated successfully';
        if (onSuccess) onSuccess(successMessage);
      } else {
        if (response && response.data && response.data.errors) {
          const errorKeys = Object.keys(response.data.errors);
          if (errorKeys.length > 0) {
            throw new Error(`Error: ${response.data.errors[errorKeys[0]]}`);
          }
        }
        throw new Error('Failed to update settings');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update delivery settings';
      if (onError) onError(errorMessage);
      console.error('Error updating settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading delivery settings...</div>;
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-medium mb-6">Delivery Fee Settings</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="deliveryFeeNcr" className="block text-sm font-medium text-gray-700 mb-1">
            Standard Delivery Fee Within NCR (₱)
          </label>
          <input
            type="number"
            id="deliveryFeeNcr"
            min="0"
            step="1"
            value={deliveryFeeNcr}
            onChange={(e) => setDeliveryFeeNcr(parseInt(e.target.value) || 0)}
            className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            The standard delivery fee for addresses within NCR.
          </p>
        </div>
        <div className="mb-4">
          <label htmlFor="deliveryFeeOutsideNcr" className="block text-sm font-medium text-gray-700 mb-1">
            Standard Delivery Fee Outside NCR (₱)
          </label>
          <input
            type="number"
            id="deliveryFeeOutsideNcr"
            min="0"
            step="1"
            value={deliveryFeeOutsideNcr}
            onChange={(e) => setDeliveryFeeOutsideNcr(parseInt(e.target.value) || 0)}
            className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            The standard delivery fee for addresses outside NCR.
          </p>
        </div>
        <div className="mb-6">
          <label htmlFor="freeDeliveryThreshold" className="block text-sm font-medium text-gray-700 mb-1">
            Free Delivery Threshold (₱)
          </label>
          <input
            type="number"
            id="freeDeliveryThreshold"
            min="0"
            step="1"
            value={freeDeliveryThreshold}
            onChange={(e) => setFreeDeliveryThreshold(parseInt(e.target.value) || 0)}
            className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
          />
          <p className="text-sm text-gray-500 mt-1">
            Orders above this amount will qualify for free delivery. Set to 0 to disable free delivery.
          </p>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeliverySettings; 