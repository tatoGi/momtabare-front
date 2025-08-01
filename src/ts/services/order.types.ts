import type { IOrder } from "../models/order.types"

export interface IGetOrdersResponse {
  message: string
  orders: {
    pending: IOrder[]
    active: IOrder[]
    completed: IOrder[]
    cancelled: IOrder[]
  }
}
