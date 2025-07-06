import { ICartItem } from "../models/cart.types.ts"

export interface IGetCartResponse {
  items: ICartItem[]
  total_items: number
  total_price: number
}

export interface IAddToCartParams {
  product_id: number
  quantity: number
  start_date : Date,
  end_date : Date
}

export interface IUpdateCartParams {
  quantity: number
  start_date : Date,
  end_date : Date
}

// interface IUpdateCartParamsPayload {
//
// }
