// Using shared AxiosJSON instance; remove unused axios import
import type { ICart } from "@/ts/models/cart.types"
import type { IUser } from "@/ts/models/user-types"
import { getLocalizedApiUrl } from '@/utils/config/env'
import AxiosJSON from '@/utils/helpers/axios'

// Backend cart API endpoints

// Response interfaces for backend API
interface BackendCartResponse {
  items: BackendCartItem[]
  subtotal: number
  cartCount: number
  owner?: IUser // User who owns the cart
}

interface BackendCartItem {
  id: number
  name: string
  price: number
  image: string
}

interface AddToCartResponse {
  success: boolean
  message: string
  cart?: BackendCartResponse
  cart_count?: number
}

interface WishlistResponse {
  exists?: boolean
  wishlistCount?: number
  success?: boolean
}
export async function ensureCsrfToken(): Promise<boolean> {
  try {
    await AxiosJSON.get(getLocalizedApiUrl('sanctum/csrf-cookie'))
    return true
  } catch (error) {
    console.error('Failed to get CSRF token:', error)
    return false
  }
}
/**
 * Fetch cart data from backend
 */
export async function getCart(): Promise<ICart> {
  try {
    await ensureCsrfToken()
    // Use shared Axios instance so Authorization and CSRF are attached
    const response = await AxiosJSON.get<BackendCartResponse>(getLocalizedApiUrl('/show-cart'), {
      withCredentials: true
    })
    // First get CSRF cookie for Sanctum
   
    
    const backendCart = response.data
    // Convert backend format to frontend ICart format
    const cartItems = backendCart.items?.map((item: BackendCartItem) => ({
      id: item.id,
      product: {
        id: item.id,
        name: item.name,
        price: item.price.toString(),
        // Add all required IProduct fields
        sku: '',
        slug: '',
        location: '',
        size: '',
        rating: null,
        ratings_amount: 0,
        views: 0,
        status: 'active',
        description: '',
        product_owner: backendCart.owner || {} as any,
        comments_amount: 0,
        categories: [],
        images: item.image ? [{ id: 1, url: item.image }] : [],
        is_favorite: false,
        booked_dates: []
      },
      quantity: 1, // Default quantity
      rental_days: 1, // Default rental days
      total_price: item.price.toString(),
      unit_price: item.price.toString(),
      user: {} as any, // Will be filled by the component if needed
      start_date: new Date(),
      end_date: new Date()
    })) || []

    return {
      items: cartItems,
      total_items: backendCart.cartCount || 0,
      total_price: backendCart.subtotal || 0,
      owner: backendCart.owner || null
    }
  } catch (error: any) {
    console.error('Failed to fetch cart:', error)
    
    // If it's a 401 error, check if it's a backend issue vs token issue
    if (error.response?.status === 401) {
      const backendMessage = error.response.data?.message;
      const token = localStorage.getItem('auth_token');
      
      if (token && backendMessage === 'Unauthenticated.') {
        console.warn('⚠️ Backend cart endpoint issue - keeping token for retry');
      } else if (backendMessage === 'Token has expired' || !token) {
        console.warn('Clearing expired/invalid tokens');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_auth_token');
      }
    }
    
    // Return empty cart on error
    return {
      items: [],
      total_items: 0,
      total_price: 0,
      owner: null
    }
  }
}

/**
 * Add product to cart
 */
export async function addToCart(
  productId: number, 
  rentalDates?: { rental_start_date: string; rental_end_date: string }
): Promise<AddToCartResponse> {
  try { 
    await ensureCsrfToken()
    const payload: any = { productId }
    
    // Add rental dates if provided
    if (rentalDates) {
      payload.rental_start_date = rentalDates.rental_start_date
      payload.rental_end_date = rentalDates.rental_end_date
    }
    
    const response = await AxiosJSON.post<AddToCartResponse>(
      getLocalizedApiUrl('/add-to-cart'),
      payload,
      { withCredentials: true }
    )

    return response.data
  } catch (error: any) {
    console.error('Failed to add to cart:', error)
    
    if (error.response?.status === 401) {
      return {
        success: false,
        message: 'Authentication required'
      }
    }
    
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to add to cart'
    }
  }
}

/**
 * Remove product from cart
 */
export async function removeFromCart(productId: number): Promise<{ success: boolean }> {
  try {
    const response = await AxiosJSON.post(getLocalizedApiUrl(`/remove-from-cart`), {
      productId: productId
    }, { withCredentials: true })

    // Check if the response indicates success
    return { success: response.status === 200 || response.status === 204 }
  } catch (error) {
    console.error('Failed to remove from cart:', error)
    return { success: false }
  }
}

/**
 * Add product to wishlist
 */
export async function addToWishlist(productId: number): Promise<WishlistResponse> {
  try {
    const response = await AxiosJSON.post<WishlistResponse>(getLocalizedApiUrl('/add-to-wishlist'), {
      product_id: productId
    }, { withCredentials: true })

    return response.data
  } catch (error) {
    console.error('Failed to add to wishlist:', error)
    return { exists: false, wishlistCount: 0 }
  }
}

/**
 * Remove product from wishlist
 */
export async function removeFromWishlist(productId: number): Promise<WishlistResponse> {
  try {
    const response = await AxiosJSON.post<WishlistResponse>(getLocalizedApiUrl('/remove-from-wishlist'), {
      productId: productId
    }, { withCredentials: true })

    return response.data
  } catch (error) {
    console.error('Failed to remove from wishlist:', error)
    return { success: false }
  }
}

/**
 * Get wishlist products
 */
export async function getWishlist(): Promise<any> {
  try {
    const response = await AxiosJSON.post(getLocalizedApiUrl('/wishlist'), {}, { withCredentials: true })

    return response.data
  } catch (error) {
    console.error('Failed to fetch wishlist:', error)
    return { products: [] }
  }
}

/**
 * Get cart count (simplified function for header display)
 */
export async function getCartCount(): Promise<number> {
  try {
    const cart = await getCart()
    return cart.total_items
  } catch (error) {
    console.error('Failed to get cart count:', error)
    return 0
  }
}

/**
 * Update cart item (quantity, rental_days, etc.)
 */
export async function updateCartItem(updateData: { quantity: number; rental_days: number }, itemId: number): Promise<{ success: boolean; message?: string }> {
  try {
    await ensureCsrfToken()
    
    const response = await AxiosJSON.post(
      getLocalizedApiUrl('/update-cart-item'),
      {
        item_id: itemId,
        quantity: updateData.quantity,
        rental_days: updateData.rental_days
      },
      { withCredentials: true }
    )

    return { success: response.status === 200 || response.status === 204 }
  } catch (error: any) {
    console.error('Failed to update cart item:', error)
    
    if (error.response?.status === 401) {
      return {
        success: false,
        message: 'Authentication required'
      }
    }
    
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update cart item'
    }
  }
}
