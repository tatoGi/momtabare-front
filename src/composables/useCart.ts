import { computed } from 'vue'
import { useCartStore } from '@/pinia/cart.pinia'
import { useUserStore } from '@/pinia/user.pinia'

/**
 * Cart management composable
 * Provides reactive cart state and actions
 */
export function useCart() {
  const cartStore = useCartStore()
  const userStore = useUserStore()

  // Reactive cart state
  const cartItems = computed(() => cartStore.getCartLength)
  const cartTotal = computed(() => cartStore.getTotalPrice)
  const isLoading = computed(() => cartStore.getIsLoading)
  const cart = computed(() => cartStore.getCart)

  /**
   * Add product to cart
   * Requires user authentication
   */
  const addToCart = async (
    productId: number,
    rentalDates?: { rental_start_date: string; rental_end_date: string }
  ): Promise<{ success: boolean; message?: string }> => {
    // Check if user is authenticated
    if (!userStore.authenticated || !userStore.user) {
      return {
        success: false,
        message: 'Authentication required. Please log in to add items to cart.'
      }
    }

    try {
      console.log(`🛒 Adding product ${productId} to cart...`)
      if (rentalDates) {
        console.log(`📅 With rental dates: ${rentalDates.rental_start_date} - ${rentalDates.rental_end_date}`)
      }
      const success = await cartStore.addProductToCart(productId, rentalDates)
      
      if (success) {
        console.log(`✅ Product ${productId} added to cart successfully`)
        return { success: true }
      } else {
        return {
          success: false,
          message: 'Failed to add product to cart. Please try again.'
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      return {
        success: false,
        message: 'An error occurred while adding to cart.'
      }
    }
  }

  /**
   * Remove product from cart
   */
  const removeFromCart = async (productId: number): Promise<{ success: boolean; message?: string }> => {
    if (!userStore.authenticated || !userStore.user) {
      return {
        success: false,
        message: 'Authentication required.'
      }
    }

    try {
      console.log(`🛒 Removing product ${productId} from cart...`)
      const success = await cartStore.removeProductFromCart(productId)
      
      if (success) {
        console.log(`✅ Product ${productId} removed from cart successfully`)
        return { success: true }
      } else {
        return {
          success: false,
          message: 'Failed to remove product from cart.'
        }
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
      return {
        success: false,
        message: 'An error occurred while removing from cart.'
      }
    }
  }

  /**
   * Refresh cart data from backend
   */
  const refreshCart = async (): Promise<void> => {
    if (userStore.authenticated && userStore.user) {
      console.log('🔄 Refreshing cart data...')
      await cartStore.fetchCart()
    }
  }

  /**
   * Clear cart (on logout)
   */
  const clearCart = (): void => {
    console.log('🗑️ Clearing cart data')
    cartStore.clearCart()
  }

  return {
    // State
    cartItems,
    cartTotal,
    isLoading,
    cart,
    
    // Actions
    addToCart,
    removeFromCart,
    refreshCart,
    clearCart
  }
}
