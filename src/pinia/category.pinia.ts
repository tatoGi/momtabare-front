import { defineStore } from "pinia"
import { getCategories } from "../services/categories.ts"
import { ICategoriesState } from "../ts/pinia/categories.types.ts"
import { ICategory } from "../ts/models/category.types.ts"

export const useCategoryStore = defineStore("category", {
  state: (): ICategoriesState => ({
    categories: null,
  }),
  actions: {
    async fetchCategories(): Promise<void> {
      try {
        this.categories = await getCategories()
      } catch (error) {
        console.log(error)
      }
    },
  },
  getters: {
    getCategories(state: ICategoriesState): ICategoriesState["categories"] {
      return state.categories
    },
    getRootCategories(state: ICategoriesState): ICategory[] {
      return (
        state.categories?.map((category) => ({
          ...category,
          children: [],
        })) || []
      )
    },
    getCategoryBySlug:
      (state: ICategoriesState) =>
      (slug: string): ICategory | null => {
        if (!state.categories) return null

        const searchCategory = (
          cats: ICategory[],
          targetSlug: string,
        ): ICategory | null => {
          for (const cat of cats) {
            if (cat.slug === targetSlug) return cat

            const found = searchCategory(cat.children, targetSlug)
            if (found) return found
          }

          return null
        }

        return searchCategory(state.categories, slug)
      },
    getPathBySlug:
      (state: ICategoriesState) =>
      (slug: string): string[] | null => {
        if (!state.categories) return null

        const findSlugPath = (
          cats: ICategory[],
          targetSlug: string,
          path: string[],
        ): string[] | null => {
          for (const cat of cats) {
            const newPath = [...path, cat.slug]
            if (cat.slug === targetSlug) {
              return newPath
            }

            const found = findSlugPath(cat.children, targetSlug, newPath)
            if (found) return found
          }

          return null
        }

        return findSlugPath(state.categories, slug, [])
      },
  },
})
