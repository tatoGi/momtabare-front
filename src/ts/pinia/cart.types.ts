import type { ICart } from "@/ts/models/cart.types"

export interface ICartState {
  cart: ICart | null
  cartCount: number
  isLoading: boolean
  // internal flag to prevent concurrent fetches
  _fetchInFlight?: boolean
  lastFetchedAt?: number
}
