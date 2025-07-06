import AxiosJSON from "../utils/helpers/axios.ts"
import { IGetCategoriesResponse } from "../ts/services/categories.types.ts"
import { ICategory } from "../ts/models/category.types.ts"

export async function getCategories(): Promise<ICategory[] | null> {
  try {
    const response = await AxiosJSON.get<IGetCategoriesResponse>("/categories")
    return response.data.categories
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return null
  }
}

export async function getCategory(id: number): Promise<ICategory[] | null> {
  try {
    const response = await AxiosJSON.get<IGetCategoriesResponse>(
      `/category/${id}`,
    )
    return response.data.categories
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return null
  }
}
