import { IOrder } from "../models/order.types.ts"

export interface IGetOrdersResponse {
  message: string
  orders: {
    pending: IOrder[]
    active: IOrder[]
    completed: IOrder[]
    cancelled: IOrder[]
  }
}
