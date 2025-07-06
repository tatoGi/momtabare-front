import { IOrder } from "../models/order.types.ts"

export interface IOrderState {
  orders: {
    pending: IOrder[]
    active: IOrder[]
    completed: IOrder[]
    cancelled: IOrder[]
  } | null
}
