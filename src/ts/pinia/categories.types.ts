import { ICategory } from "../models/category.types.ts"

export interface ICategoriesState {
  categories: ICategory[] | null
}
