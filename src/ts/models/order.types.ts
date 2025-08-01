import type { EProductOrderStatus, IProduct } from "./product.types"

export interface IOrder {
  id: number
  product: IProduct
  rental_period: {
    start_date: Date
    end_date: Date
    days_remaining: number
    total_days: number
  }
  status: EProductOrderStatus
  actions_allowed: {
    can_cancel: Boolean
    can_confirm: Boolean
  }
  order_placed_at: Date
}
