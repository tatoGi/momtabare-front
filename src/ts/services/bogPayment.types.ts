// BOG Payment TypeScript Types
// This file contains all the necessary interfaces and types for BOG payment integration

export interface IBogOrderPayload {
  application_type?: string;
  capture?: 'automatic' | 'manual';
  callback_url?: string;
  user_id?: number;
  purchase_units: {
    total_amount: number;
    currency: string;
    basket: Array<{
      product_id: string;
      quantity: number;
      unit_price: number;
      name: string;
    }>;
  };
  redirect_urls: {
    success: string;
    fail: string;
  };
  language?: 'en' | 'ka' | 'ru';
  save_card?: boolean;
  external_order_id?: string;
}

export interface IBogOrderResponse {
  success: boolean;
  order_id?: string;
  redirect_url?: string;
  data?: any;
  status?: string;
  error_code?: string;
  message?: string;
  errors?: any;
  details?: any;
}

export interface IBogPaymentDetails {
  amount: number;
  currency: string;
  callback_url: string;
  basket: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    name: string;
  }>;
  external_order_id?: string;
  save_card?: boolean;
  pre_authorize?: boolean;
}

export interface IBogCardOperation {
  success: boolean;
  message?: string;
  error?: any;
  data?: any;
}

export interface IBogSavedCard {
  id: string;
  user_id: number;
  card_token: string;
  card_mask: string;
  card_type: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface IBogCallbackData {
  order_id: string;
  status: string;
  transaction_id?: string;
  amount?: number;
  currency?: string;
  error_code?: string;
  error_description?: string;
  signature?: string;
}

export interface IBogPaymentStatus {
  order_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  transaction_id?: string;
  amount?: number;
  currency?: string;
  error_code?: string;
  error_message?: string;
  payment_method?: string;
  card_details?: {
    brand: string;
    last4: string;
    type: string;
  };
}
