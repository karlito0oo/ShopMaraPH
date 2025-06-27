export type Step = 'cart' | 'shipping' | 'payment' | 'confirmation';

export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  password?: string;
  paymentProof: File | null;
}

export interface FormErrors {
  [key: string]: string | null;
} 