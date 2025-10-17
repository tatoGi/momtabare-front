import { getCart, addToCart, removeFromCart, getCartCount } from "../services/cart"
import type { ICartState } from "@/ts/pinia/cart.types"
import { defineStore } from "pinia"

export const useCartStore = defineStore("cart", {
    state: (): ICartState => ({
        cart: null,
        cartCount: 0,
        isLoading: false,
        _fetchInFlight: false as unknown as boolean,
        // throttle to avoid frequent refetches
        lastFetchedAt: 0 as unknown as number
    }),
    actions: {
        async fetchCart(): Promise<void> {
            // Throttle: skip if fetched within last 5 seconds
            const now = Date.now()
            if (((this as any)._fetchInFlight)) return
            if ((this as any).lastFetchedAt && (now - (this as any).lastFetchedAt) < 5000) return
            ;(this as any)._fetchInFlight = true
            this.isLoading = true
            try {
                this.cart = await getCart()
                this.cartCount = this.cart.total_items
                ;(this as any).lastFetchedAt = Date.now()
            } catch (error) {
                console.error('Failed to fetch cart:', error)
                this.cart = null
                this.cartCount = 0
            } finally {
                this.isLoading = false
                ;(this as any)._fetchInFlight = false
            }
        },
        
        async addProductToCart(
            productId: number, 
            rentalDates?: { rental_start_date: string; rental_end_date: string }
        ): Promise<boolean> {
            try {
                const result = await addToCart(productId, rentalDates)
                if (result.success) {
                    // Always refetch cart to get updated items and count
                    await this.fetchCart()
                    return true
                } else {
                    console.error('Failed to add to cart:', result.message)
                    return false
                }
            } catch (error) {
                console.error('Error adding to cart:', error)
                return false
            }
        },
        
        async removeProductFromCart(productId: number): Promise<boolean> {
            try {
                const result = await removeFromCart(productId)
                if (result.success) {
                    // Refetch cart to get updated count
                    await this.fetchCart()
                    return true
                } else {
                    console.error('Failed to remove from cart')
                    return false
                }
            } catch (error) {
                console.error('Error removing from cart:', error)
                return false
            }
        },
        
        async refreshCartCount(): Promise<void> {
            try {
                this.cartCount = await getCartCount()
            } catch (error) {
                console.error('Failed to refresh cart count:', error)
                this.cartCount = 0
            }
        },
        
        clearCart(): void {
            this.cart = null
            this.cartCount = 0
        }
    },
    getters: {
        getCart(state: ICartState): ICartState["cart"] {
            return state.cart
        },
        getCartLength(state: ICartState): number {
            return state.cartCount || 0
        },
        getTotalPrice(state: ICartState): number {
            return state.cart?.total_price || 0
        },
        getIsLoading(state: ICartState): boolean {
            return state.isLoading || false
        }
    },
})
