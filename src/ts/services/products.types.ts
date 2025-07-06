import {IProduct, IProductListItem} from "../models/product.types.ts"
import {IPagination} from "./pagination.types"

export interface IGetProductsQuery {
    page?: number
    sort?: string
    search?: string
    location?: string
    min_price?: number | null
    max_price?: number | null
    start_date?: string | null
    end_date?: string | null
    retailer_id?: number | null
    category_slug?: string | null
}

export interface IGetProductsResponse {
    message: string
    products: IProductListItem[]
    pagination: IPagination
}

export interface IGetProductByIdQuery {
    sku: string
}

export interface IGetProductByIdResponse {
    message: string
    product: IProduct
}
