import type {
  IBogOrderPayload,
  IBogOrderResponse,
  IBogPaymentDetails,
  IBogCardOperation
} from '@/ts/services/bogPayment.types';

import AxiosJSON from '@/utils/helpers/axios';
import { getLocalizedApiUrl, getBackendUrlWithFallback } from '@/utils/config/env';
import { getCurrentLocale } from '@/services/user';

export interface ISavedCardSummary {
  id: string;
  brand: 'visa' | 'mastercard' | string;
  last4: string;
  expires?: string;
  holder?: string;
  parentOrderId: string;
}

class BogPaymentService {
  private static instance: BogPaymentService | null = null;

  private constructor() {}

  public static getInstance(): BogPaymentService {
    if (!BogPaymentService.instance) {
      BogPaymentService.instance = new BogPaymentService();
    }
    return BogPaymentService.instance;
  }

  private _uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0xf) >> 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  async getToken(): Promise<string | null> {
    try {
      const response = await AxiosJSON.get(getLocalizedApiUrl('bog/token'));
      return response.data.access_token;
    } catch (error) {
      console.error('Failed to get BOG token:', error);
      return null;
    }
  }

  async createOrder(orderData: IBogOrderPayload): Promise<IBogOrderResponse> {
    try {
      const orderId = orderData.external_order_id || `order_${Date.now()}`;
      const baseUrl = window.location.origin;
      const requestPayload = {
        ...orderData,
        external_order_id: orderId,
        redirect_urls: orderData.redirect_urls || {
          success: `${baseUrl}/payment/success?order_id=${orderId}`,
          fail: `${baseUrl}/payment/fail?order_id=${orderId}`
        }
      };

  const response = await AxiosJSON.post(
    getLocalizedApiUrl('/bog/orders'),
    requestPayload,
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: false
    }
  );

      const responseData = response.data;
      
      return {
        success: true,
        order_id: responseData.id || responseData.order_id,
        redirect_url: responseData.redirect_url || responseData._links?.redirect?.href,
        data: responseData
      };
    } catch (error: any) {
      console.error('Error creating BOG order:', {
        error: error,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      // Check for validation errors specifically
      if (error.response?.data?.errors) {
        console.error('❌ Validation errors:', error.response.data.errors);
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create order',
        error_code: error.response?.data?.error_code || 'order_creation_failed',
        errors: error.response?.data?.errors,
        details: error.response?.data
      };
    }
  }

  async getOrderDetails(orderId: string): Promise<IBogOrderResponse> {
    try {
      const url = getLocalizedApiUrl(`bog/orders/${encodeURIComponent(orderId)}`);
      const response = await AxiosJSON.get(url);
      const responseData = response.data;

      // Process the response directly
      return this.processOrderResponse(responseData);
    } catch (error: any) {
      console.error('Error fetching BOG order details:', error);
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error_description ||
                          error.message ||
                          'Failed to verify payment';

      return {
        success: false,
        data: error.response?.data,
        status: 'error',
        error_code: error.response?.data?.error_code || 'verification_failed',
        message: errorMessage
      };
    }
  }

  private processOrderResponse(responseData: any): IBogOrderResponse {
    // Log the full response for debugging
    console.log('BOG Order Response:', JSON.stringify(responseData, null, 2));

    // Normalize the payment status
    const status = (responseData.status || '').toLowerCase();
    const paymentStatus = responseData.payment_status?.toLowerCase();
    const transactionStatus = responseData.transaction_status?.toLowerCase();
    const orderStatus = responseData.order_status?.toLowerCase();

    // Enhanced success detection with more status variations
    const isSuccessful =
      status === 'completed' ||
      status === 'approved' ||
      status === 'succeeded' ||
      status === 'success' ||
      status === 'paid' ||
      status === 'confirmed' ||
      paymentStatus === 'completed' ||
      paymentStatus === 'approved' ||
      paymentStatus === 'succeeded' ||
      paymentStatus === 'success' ||
      paymentStatus === 'paid' ||
      paymentStatus === 'confirmed' ||
      transactionStatus === 'completed' ||
      transactionStatus === 'approved' ||
      transactionStatus === 'succeeded' ||
      transactionStatus === 'success' ||
      transactionStatus === 'paid' ||
      transactionStatus === 'confirmed' ||
      orderStatus === 'completed' ||
      orderStatus === 'approved' ||
      orderStatus === 'succeeded' ||
      orderStatus === 'success' ||
      orderStatus === 'paid' ||
      orderStatus === 'confirmed' ||
      responseData.success === true ||
      responseData.payment_success === true;

    // Enhanced debugging
    console.log('Payment Status Analysis:', {
      status,
      paymentStatus,
      transactionStatus,
      orderStatus,
      isSuccessful,
      rawResponse: responseData
    });

    // Extract all possible error details
    const errorDetails = [
      responseData.error_description,
      responseData.error_message,
      responseData.error,
      responseData.payment_error,
      responseData.transaction_error,
      responseData.decline_reason,
      responseData.decline_code,
      responseData.decline_message
    ].filter(Boolean).join('\n');

    // Get any validation errors
    const validationErrors = responseData.validation_errors
      ? Object.entries(responseData.validation_errors)
          .map(([field, error]) => `${field}: ${error}`)
          .join('\n')
      : '';

    return {
      success: isSuccessful,
      data: responseData,
      status: status,
      error_code: responseData.error_code || responseData.decline_code,
      message: isSuccessful
        ? 'Payment verified successfully'
        : [
            `Payment Status: ${status || 'unknown'}`,
            errorDetails && `Error Details: ${errorDetails}`,
            validationErrors && `Validation Errors: ${validationErrors}`,
            responseData.message && `Message: ${responseData.message}`,
            `Transaction ID: ${responseData.transaction_id || 'N/A'}`,
            `Order ID: ${responseData.order_id || 'N/A'}`
          ].filter(Boolean).join('\n')
    };
  }

  async getSavedCards(): Promise<ISavedCardSummary[]> {
    try {
      // Import and use the cards service to get saved cards
      const { listCards } = await import('./cards');
      const result = await listCards();
      
      console.log('📇 Fetched saved cards from cards service:', result);
      
      if (!result.success || !result.cards) {
        console.log('❌ No cards found or fetch failed');
        return [];
      }

      // Transform Card[] to ISavedCardSummary[] format
      const transformedCards: ISavedCardSummary[] = result.cards.map(card => ({
        id: String(card.id),
        brand: card.card_type.toLowerCase() as 'visa' | 'mastercard' | string,
        last4: card.card_mask.slice(-4),
        expires: card.formatted_expiry,
        holder: card.card_holder_name,
        parentOrderId: String(card.id) // Use card ID as parent order ID for now
      }));

      console.log('✅ Transformed cards for checkout:', transformedCards);
      return transformedCards;
    } catch (error) {
      console.error('❌ Error fetching saved cards:', error);
      return [];
    }
  }

  async getUserPayments(): Promise<any> {
    try {
      console.log('📋 Fetching user payment history...');
      const url = getLocalizedApiUrl('bog/payments');
      const response = await AxiosJSON.get(url);
      
      console.log('✅ Payment history response:', response.data);
      
      return {
        success: true,
        payments: response.data.payments || response.data.data || [],
        ...response.data
      };
    } catch (error: any) {
      console.error('❌ Error fetching payment history:', error);
      return {
        success: false,
        payments: [],
        message: error.response?.data?.message || 'Failed to fetch payment history'
      };
    }
  }

  async saveCard(orderId: string): Promise<IBogCardOperation> {
    try {
      const idempotencyKey = this._uuidv4();
      
      console.log('Attempting to save card for order:', orderId, 'with idempotency key:', idempotencyKey);
      
      const response = await AxiosJSON.post(getLocalizedApiUrl(`bog/orders/${orderId}/save-card`), {}, {
        headers: { 'Idempotency-Key': idempotencyKey }
      });
      
      console.log('Save card response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Save card error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to save card',
        error: error.response?.data?.error
      };
    }
  }

  async payWithSavedCard(parentOrderId: string, paymentData: IBogPaymentDetails): Promise<IBogCardOperation> {
    try {
      const locale = getCurrentLocale();
      const url = getLocalizedApiUrl(`bog/ecommerce/orders/${encodeURIComponent(parentOrderId)}/pay`);
      
      console.log('💳 Paying with saved card - URL:', url);
      console.log('📦 Payment data:', JSON.stringify(paymentData, null, 2));
      
      const response = await AxiosJSON.post(url, paymentData);
      
      console.log('✅ Payment response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Payment with saved card failed:', {
        message: error.response?.data?.message,
        errors: error.response?.data?.errors,
        status: error.response?.status,
        url: error.config?.url
      });
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to process payment',
        error: error.response?.data?.errors || error.response?.data?.error
      };
    }
  }

  redirectToPaymentPage(paymentUrl: string): void {
    if (paymentUrl) {
      console.log('Redirecting to payment page:', paymentUrl);
      window.location.href = paymentUrl;
    }
  }

  // Handle post-payment card saving
  async handlePostPaymentCardSaving(orderId: string): Promise<void> {
    try {
      const shouldSaveCard = localStorage.getItem('should_save_card') === 'true';
      
      if (shouldSaveCard) {
        console.log('Attempting to save card for order:', orderId);
        
        // Try to save the card directly without checking order details first
        // This avoids potential conflicts with the payment verification process
        const saveResult = await this.saveCard(orderId);
        
        if (saveResult.success) {
          console.log('Card saved successfully:', saveResult);
          // Clear the flag
          localStorage.removeItem('should_save_card');
        } else {
          console.warn('Failed to save card:', saveResult.message);
          // Don't clear the flag so we can try again later
        }
      }
    } catch (error) {
      console.error('Error during post-payment card saving:', error);
    }
  }

  // Test save card functionality
  async testSaveCard(): Promise<void> {
    console.log('=== Testing Save Card Functionality ===');
    
    try {
      const testCart = {
        id: 'test_save_card_' + Date.now(),
        total_price: 1.00,
        items: [{
          product: {
            id: 'test_product',
            name: 'Test Product for Save Card',
            price: 1.00
          },
          quantity: 1
        }]
      };

      console.log('🧪 Testing with save_card: true');
      
      const { processCheckout } = useBogPayment();
      const result = await processCheckout(testCart, true, null); // saveCard = true
      
      console.log('💾 Save card test result:', result);
      
    } catch (error) {
      console.error('❌ Save card test failed:', error);
    }
    
    console.log('=== End Save Card Test ===');
  }

  // Test order creation with minimal data
  async testOrderCreation(): Promise<void> {
    console.log('=== Testing Order Creation ===');
    
    try {
      const testCart = {
        id: 'test_cart_123',
        total_price: 1.00,
        items: [{
          product: {
            id: 'test_product',
            name: 'Test Product',
            price: 1.00
          },
          quantity: 1
        }]
      };

      console.log('Testing with cart:', testCart);
      
      const { processCheckout } = useBogPayment();
      const result = await processCheckout(testCart, false, null);
      
      console.log('Test result:', result);
      
    } catch (error) {
      console.error('Test failed:', error);
    }
    
    console.log('=== End Test ===');
  }

  // Debug function to test BOG integration
  async debugBogIntegration(): Promise<void> {
    console.log('=== BOG Integration Debug ===');
    
    try {
      // Test token retrieval
      console.log('1. Testing token retrieval...');
      const token = await this.getToken();
      console.log('Token result:', token ? 'SUCCESS' : 'FAILED');
      
      // Test order creation with minimal payload
      console.log('2. Testing order creation...');
      const testOrderData: IBogOrderPayload = {
        application_type: 'web',
        capture: 'automatic',
        callback_url: `${window.location.origin}/bog/callback`,
        purchase_units: {
          total_amount: 1.00,
          currency: 'GEL',
          basket: [{
            product_id: 'test_product',
            quantity: 1,
            unit_price: 1.00,
            name: 'Test Product'
          }]
        },
        redirect_urls: {
          success: `${window.location.origin}/payment/success`,
          fail: `${window.location.origin}/payment/fail`
        },
        language: 'en',
        save_card: false,
        external_order_id: `debug_${Date.now()}`
      };
      
      const orderResult = await this.createOrder(testOrderData);
      console.log('Order creation result:', orderResult);
      
    } catch (error) {
      console.error('Debug test failed:', error);
    }
    
    console.log('=== End Debug ===');
  }
}

const bogPaymentInstance = BogPaymentService.getInstance();

export function useBogPayment() {
  const processCheckout = async (
    cart: any,
    saveCard: boolean = false,
    selectedSavedCard?: ISavedCardSummary | null,
    useModal: boolean = false,
    userId?: number
  ): Promise<IBogOrderResponse> => {
    try {
      // Prepare basket items (needed for both new and saved card payments)
      const basket = cart.items.map((item: any) => ({
        product_id: String(item.product.id),
        quantity: item.quantity,
        unit_price: typeof item.product.price === 'number' ? item.product.price : parseFloat(item.product.price),
        name: item.product.name || `Product ${item.product.id}`
      }));

      // Calculate total amount
      const amount = typeof cart.total_price === 'number' ? cart.total_price : parseFloat(cart.total_price);

      // Get callback URLs
      const callbackBase = (import.meta as any).env?.VITE_CALLBACK_BASE || getBackendUrlWithFallback(true);
      const secureCallbackBase = callbackBase.replace(/^http:/, 'https:');
      const callbackUrl = `${secureCallbackBase.replace(/\/+$/, '')}/api/bog/callback`;

      // If using a saved card
      if (selectedSavedCard?.parentOrderId) {
        console.log('💳 Paying with saved card:', selectedSavedCard);
        console.log('📦 Payment data:', { amount, basket, callbackUrl, userId });

        const paymentResponse = await bogPaymentInstance.payWithSavedCard(
          selectedSavedCard.parentOrderId,
          {
            amount,
            currency: 'GEL',
            callback_url: callbackUrl,
            basket,
            external_order_id: cart?.id ? String(cart.id) : `order_${Date.now()}`
          }
        );

        return {
          success: paymentResponse.success,
          message: paymentResponse.message,
          data: paymentResponse.data
        };
      }

      // Prepare callback URLs for new payment
      const locale = getCurrentLocale() || 'ka';
      const successUrl = `${window.location.origin}/payment/success`;
      const failUrl = `${window.location.origin}/payment/fail`;

      console.log('Generated URLs:', {
        callbackBase,
        secureCallbackBase,
        callbackUrl,
        successUrl,
        failUrl,
        currentOrigin: window.location.origin,
        userId
      });

      const allowedLocales = ['en', 'ka', 'ru'] as const;
      const mappedLocale = allowedLocales.includes(locale as any) ? locale as 'en' | 'ka' | 'ru' : 'ka';

      // Create order payload
      const orderData: IBogOrderPayload = {
        application_type: 'web',
        capture: 'automatic',
        callback_url: callbackUrl,
        user_id: userId,
        purchase_units: {
          total_amount: amount,
          currency: 'GEL',
          basket: basket
        },
        redirect_urls: {
          success: successUrl,
          fail: failUrl
        },
        language: mappedLocale,
        save_card: saveCard,
        external_order_id: cart?.id ? String(cart.id) : `order_${Date.now()}`
      };

      console.log('💳 Creating order with save_card flag:', saveCard);
      console.log('� User ID:', userId || 'Not provided');
      console.log('�📦 Final order payload being sent to Laravel:', JSON.stringify(orderData, null, 2));
      
      // Validate that save_card flag is properly set
      if (saveCard) {
        console.log('✅ Save card is ENABLED - card will be saved for future payments');
      } else {
        console.log('❌ Save card is DISABLED - card will NOT be saved');
      }
      
      // Validate user_id
      if (userId) {
        console.log('✅ User ID is included in payment:', userId);
      } else {
        console.warn('⚠️ User ID is NOT included in payment - card may not be saved correctly');
      }

      if (cart?.id) {
        orderData.external_order_id = String(cart.id);
      }

      // Create BOG order
      const response = await bogPaymentInstance.createOrder(orderData);

      if (response.success && response.redirect_url) {
        console.log('Order created successfully, redirecting to:', response.redirect_url);
        
        // Store order ID and save card preference if available
        if (response.order_id) {
          localStorage.setItem('last_order_id', response.order_id);
          // Store save card preference for post-payment processing
          if (saveCard) {
            localStorage.setItem('should_save_card', 'true');
          }
        }

        // Handle redirect - skip if using modal
        if (!useModal) {
          bogPaymentInstance.redirectToPaymentPage(response.redirect_url);
        }
        return response;
      } else {
        console.error('Order creation failed or no redirect URL:', response);
      }

      throw new Error(response.message || 'Failed to create payment order');
    } catch (error: any) {
      console.error('Checkout error:', error);
      return {
        success: false,
        message: error.message || 'Failed to process payment',
        error_code: 'checkout_failed'
      };
    }
  };

  return {
    processCheckout,
    getOrderDetails: bogPaymentInstance.getOrderDetails.bind(bogPaymentInstance),
    getSavedCards: bogPaymentInstance.getSavedCards.bind(bogPaymentInstance),
    getUserPayments: bogPaymentInstance.getUserPayments.bind(bogPaymentInstance),
    saveCard: bogPaymentInstance.saveCard.bind(bogPaymentInstance),
    payWithSavedCard: bogPaymentInstance.payWithSavedCard.bind(bogPaymentInstance),
    handlePostPaymentCardSaving: bogPaymentInstance.handlePostPaymentCardSaving.bind(bogPaymentInstance),
    testSaveCard: bogPaymentInstance.testSaveCard.bind(bogPaymentInstance),
    testOrderCreation: bogPaymentInstance.testOrderCreation.bind(bogPaymentInstance),
    debugBogIntegration: bogPaymentInstance.debugBogIntegration.bind(bogPaymentInstance)
  };
}

export default bogPaymentInstance;
