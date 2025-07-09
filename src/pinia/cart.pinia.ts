import {getCart} from "../services/cart"
import {ICartState} from "../ts/pinia/cart.types"
import {defineStore} from "pinia"

export const useCartStore = defineStore("cart", {
    state: (): ICartState => ({
        cart: null,
    }),
    actions: {
        async fetchCart(): Promise<void> {
            try {
                this.cart = await getCart()
                console.log(this.cart)
            } catch (error) {
                console.log(error)
            }
        },
    },
    getters: {
        getCart(state: ICartState): ICartState["cart"] {
            return state.cart
        },
        getCartLength(state: ICartState): number {
            return state?.cart?.items.length || 0
        }
    },
})
