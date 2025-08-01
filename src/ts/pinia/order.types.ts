import type { IOrder } from "../models/order.types"

export interface IOrderState {
  orders: {
    pending: IOrder[]
    active: IOrder[]
    completed: IOrder[]
    cancelled: IOrder[]
  } | null
}
