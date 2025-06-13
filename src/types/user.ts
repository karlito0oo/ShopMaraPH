export interface UserProfile {
  id: number;
  user_id: number;
  instagram_username: string | null;
  address_line1: string | null;
  barangay: string | null;
  province: string | null;
  city: string | null;
  mobile_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  profile?: UserProfile | null;
  created_at: string;
  updated_at: string;
} 