import AxiosJSON from '@/utils/helpers/axios'
import { getLocalizedApiUrl } from '@/utils/config/env'

export interface Card {
  id: number
  card_mask: string
  card_type: string
  expiry_month: string
  expiry_year: string
  formatted_expiry: string
  is_default: boolean
  card_holder_name?: string
  added_manually?: boolean
  created_at: string
}

export interface AddCardData {
  card_number: string
  card_holder_name: string
  expiry_month: string
  expiry_year: string
  cvv: string
  card_type?: string
}

/**
 * Get CSRF cookie for card operations
 */
async function ensureCsrfToken() {
  try {
    await AxiosJSON.get(getLocalizedApiUrl('/sanctum/csrf-cookie'), { 
      withCredentials: true 
    })
  } catch (error) {
    console.error('Failed to get CSRF token:', error)
  }
}

/**
 * List all saved cards for the authenticated user
 */
export async function listCards(): Promise<{ success: boolean; cards?: Card[]; message?: string }> {
  try {
    const response = await AxiosJSON.get(getLocalizedApiUrl('/bog/cards'), {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      withCredentials: true,
    })
    
    console.log('📋 Cards loaded:', response.data)
    
    return {
      success: true,
      cards: response.data.cards || [],
    }
  } catch (error: any) {
    console.error('Error listing cards:', error)
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to load cards',
    }
  }
}

/**
 * Add a new card manually
 */
export async function addCard(cardData: AddCardData): Promise<{ success: boolean; card?: Card; message?: string; error?: any }> {
  try {
    console.log('🔵 Adding card - Request data:', {
      card_number: cardData.card_number.substring(0, 4) + '...' + cardData.card_number.slice(-4),
      card_holder_name: cardData.card_holder_name,
      expiry_month: cardData.expiry_month,
      expiry_year: cardData.expiry_year,
      cvv: '***',
      card_type: cardData.card_type
    })
    
    await ensureCsrfToken()
    // Must include /api prefix

    // Retrieve token from localStorage or your auth provider
    const token = localStorage.getItem('token')

    const response = await AxiosJSON.post(
      getLocalizedApiUrl('/bog/cards/add'),
      cardData,
      {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        withCredentials: true,
      }
    )
    
    console.log('✅ Card added successfully - Response:', response.data)
    
    // Check if response is HTML (login page redirect)
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
      console.error('❌ Received HTML instead of JSON - User not authenticated')
      return {
        success: false,
        message: 'Authentication failed. Please log in again.',
        error: { type: 'auth_redirect' }
      }
    }
    
    return {
      success: true,
      card: response.data.card,
      message: response.data.message || 'Card added successfully',
    }
  } catch (error: any) {
    console.error('❌ Error adding card:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    })
    
    // Check if error response is HTML
    if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
      return {
        success: false,
        message: 'Authentication failed. Please log in again.',
        error: { type: 'auth_redirect' }
      }
    }
    
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to add card',
      error: error.response?.data
    }
  }
}

/**
 * Delete a saved card
 */
export async function deleteCard(cardId: number): Promise<{ success: boolean; message?: string }> {
  try {
    await ensureCsrfToken()
    const response = await AxiosJSON.delete(getLocalizedApiUrl(`/bog/cards/${cardId}`), {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      withCredentials: true,
    })
    return {
      success: true,
      message: response.data.message || 'Card deleted successfully',
    }
  } catch (error: any) {
    console.error('Error deleting card:', error)
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete card',
    }
  }
}

/**
 * Set a card as default
 */
export async function setDefaultCard(cardId: number): Promise<{ success: boolean; message?: string }> {
  try {
    await ensureCsrfToken()
    const response = await AxiosJSON.post(
      getLocalizedApiUrl(`/bog/cards/${cardId}/set-default`),
      {},
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        withCredentials: true,
      }
    )
    return {
      success: true,
      message: response.data.message || 'Default card updated successfully',
    }
  } catch (error: any) {
    console.error('Error setting default card:', error)
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to set default card',
    }
  }
}
