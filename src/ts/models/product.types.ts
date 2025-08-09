import type { ICategory } from "@/types/category"
import type { IUser } from "./user-types"

export interface IProductThumbnail {
  id: number
  url: string
}

export interface IProduct {
  id: number
  name: string
  sku: string
  slug?: string
  location: string
  size: string
  price: string
  rating: number | null
  ratings_amount: number
  views: number
  status: string
  description: string
  product_owner: IUser
  categories: ICategory[]
  comments_amount: number
  images: IProductThumbnail[]
  is_favorited : boolean
  booked_dates : IBookedDate[]
}

export interface IBookedDate {
  start_date : Date,
  end_date : Date,
  status : EProductOrderStatus
}

export enum EProductOrderStatus{
  PENDING = "pending",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

export interface IProductListItem {
  id: number
  name: string
  sku: string
  slug?: string
  location: string
  rating: number | null
  ratings_amount: number
  price: string
  comments_amount: number
  categories: ICategory[]
  images: IProductThumbnail[]
  is_favorited : boolean
}
