export interface Announcement {
  id: number;
  text: string;
  is_active: boolean;
  display_order: number;
  button_text: string | null;
  button_link: string | null;
  background_color: string;
  text_color: string;
  created_at?: string;
  updated_at?: string;
}

// Frontend representation (camelCase)
export interface AnnouncementData {
  id: number;
  text: string;
  isActive: boolean;
  displayOrder: number;
  buttonText: string | null;
  buttonLink: string | null;
  backgroundColor: string;
  textColor: string;
  createdAt?: string;
  updatedAt?: string;
} 