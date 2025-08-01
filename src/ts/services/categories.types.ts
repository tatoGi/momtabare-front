import type { ICategory } from "@/types/category"

export interface IGetCategoriesResponse {
  message: string
  categories: ICategory[]
}
