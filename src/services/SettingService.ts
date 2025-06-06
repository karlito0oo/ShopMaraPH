import { apiRequest } from './ApiService';

interface PublicSettings {
  delivery_fee_ncr: number;
  delivery_fee_outside_ncr: number;
  free_delivery_threshold: number;
}

interface Setting {
  id: number;
  key: string;
  value: string;
  type: string;
  display_name: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const SettingService = {
  /**
   * Get public settings (delivery fee, etc.)
   */
  getPublicSettings: async (): Promise<PublicSettings> => {
    try {
      const response = await apiRequest('/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching public settings:', error);
      // Return default values if API call fails
      return {
        delivery_fee_ncr: 80,
        delivery_fee_outside_ncr: 120,
        free_delivery_threshold: 0
      };
    }
  },

  /**
   * Admin: Get all settings
   */
  getAllSettings: async (token: string): Promise<Setting[]> => {
    const response = await apiRequest('/admin/settings', 'GET', null, token);
    return response.data;
  },

  /**
   * Admin: Update a setting
   */
  updateSetting: async (token: string, key: string, value: string | number | boolean): Promise<any> => {
    const response = await apiRequest(`/admin/settings/${key}`, 'PUT', { value }, token);
    return response.data;
  },

  /**
   * Admin: Update multiple settings at once
   */
  updateMultipleSettings: async (token: string, settings: { key: string, value: any }[]): Promise<any> => {
    const response = await apiRequest('/admin/settings', 'POST', { settings }, token);
    return response.data;
  }
}; 