import { IProduct } from "./product.types"
import { IUser } from "./user.types"

export interface ICart {
  items: ICartItem[]
  total_items: number
  total_price: number
}

export interface ICartItem {
  id: number
  product: IProduct
  quantity: number
  rental_days: number
  total_price: string
  unit_price: string
  user: IUser
  start_date : Date,
  end_date : Date
}
