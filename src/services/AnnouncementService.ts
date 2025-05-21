import { apiRequest } from './ApiService';
import type { Announcement, AnnouncementData } from '../types/announcement';

// Helper to convert snake_case API response to camelCase for frontend
const formatAnnouncement = (announcement: Announcement): AnnouncementData => ({
  id: announcement.id,
  text: announcement.text,
  isActive: announcement.is_active,
  displayOrder: announcement.display_order,
  buttonText: announcement.button_text,
  buttonLink: announcement.button_link,
  backgroundColor: announcement.background_color,
  textColor: announcement.text_color,
  createdAt: announcement.created_at,
  updatedAt: announcement.updated_at
});

export const AnnouncementService = {
  // Get all active announcements for display
  getActiveAnnouncements: async (): Promise<AnnouncementData[]> => {
    try {
      const response = await apiRequest('/announcements');
      return response.data.map(formatAnnouncement);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  },

  // Admin functions
  getAllAnnouncements: async (token: string): Promise<AnnouncementData[]> => {
    const response = await apiRequest('/admin/announcements', 'GET', null, token);
    return response.data.map(formatAnnouncement);
  },

  getAnnouncementById: async (token: string, id: number): Promise<AnnouncementData> => {
    const response = await apiRequest(`/admin/announcements/${id}`, 'GET', null, token);
    return formatAnnouncement(response.data);
  },

  createAnnouncement: async (token: string, data: Omit<AnnouncementData, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Convert camelCase to snake_case for API
    const apiData = {
      text: data.text,
      is_active: data.isActive,
      display_order: data.displayOrder,
      button_text: data.buttonText,
      button_link: data.buttonLink,
      background_color: data.backgroundColor,
      text_color: data.textColor
    };
    
    const response = await apiRequest('/admin/announcements', 'POST', apiData, token);
    return formatAnnouncement(response.data);
  },

  updateAnnouncement: async (token: string, id: number, data: Partial<Omit<AnnouncementData, 'id' | 'createdAt' | 'updatedAt'>>) => {
    // Convert camelCase to snake_case for API
    const apiData: any = {};
    
    if (data.text !== undefined) apiData.text = data.text;
    if (data.isActive !== undefined) apiData.is_active = data.isActive;
    if (data.displayOrder !== undefined) apiData.display_order = data.displayOrder;
    if (data.buttonText !== undefined) apiData.button_text = data.buttonText;
    if (data.buttonLink !== undefined) apiData.button_link = data.buttonLink;
    if (data.backgroundColor !== undefined) apiData.background_color = data.backgroundColor;
    if (data.textColor !== undefined) apiData.text_color = data.textColor;
    
    const response = await apiRequest(`/admin/announcements/${id}`, 'PUT', apiData, token);
    return formatAnnouncement(response.data);
  },

  deleteAnnouncement: async (token: string, id: number) => {
    await apiRequest(`/admin/announcements/${id}`, 'DELETE', null, token);
    return true;
  },

  toggleAnnouncementStatus: async (token: string, id: number, isActive: boolean) => {
    const response = await apiRequest(`/admin/announcements/${id}/toggle`, 'POST', { is_active: isActive }, token);
    return formatAnnouncement(response.data);
  }
}; 