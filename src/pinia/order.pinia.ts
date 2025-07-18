import { getOrders } from "../services/order.ts"
import { IOrderState } from "../ts/pinia/order.types.ts"
import { defineStore } from "pinia"

export const useOrderStore = defineStore("order", {
  state: (): IOrderState => ({
    orders: null,
  }),
  actions: {
    async fetchOrders(): Promise<void> {
      try {
        const response = await getOrders()
        if (response) this.orders = response.orders
      } catch (error) {
        console.log(error)
      }
    },
  },
  getters: {
    getOrders(state: IOrderState): IOrderState["orders"] {
      return state.orders
    },
  },
})
