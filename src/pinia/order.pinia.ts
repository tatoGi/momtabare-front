import { getOrders } from "@/services/order"
import type { IOrderState } from "@/ts/pinia/order.types"
import { defineStore } from "pinia"
import { useBogPayment } from "@/services/bogPayment"

export const useOrderStore = defineStore("order", {
  state: (): IOrderState => ({
    orders: null,
  }),
  actions: {
    async fetchOrders(): Promise<void> {
      try {
        const { getUserPayments } = useBogPayment()
        const response = await getUserPayments()
        
        if (response && response.success && response.payments) {
          this.orders = response.payments
          console.log('✅ Fetched orders from payment history:', response.payments)
        } else {
          console.log('⚠️ No payments found, trying fallback order service')
          const fallbackResponse = await getOrders()
          if (fallbackResponse) this.orders = fallbackResponse.orders
        }
      } catch (error) {
        console.log('❌ Error fetching orders:', error)
      }
    },
  },
  getters: {
    getOrders(state: IOrderState): IOrderState["orders"] {
      return state.orders
    },
  },
})
