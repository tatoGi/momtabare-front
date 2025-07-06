import { ICategory } from "../models/category.types.ts"

export interface IGetCategoriesResponse {
  message: string
  categories: ICategory[]
}
