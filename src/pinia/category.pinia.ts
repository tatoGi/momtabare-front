import { defineStore } from "pinia"
import { getCategoriesForLocale } from "../services/categories.ts"
import type { ICategoriesState } from "../ts/pinia/categories.types.ts"
import type { ICategory } from "@/types/category"
import type { ICategoryDisplay } from "@/ts/models/category.types"
import { useAppStore } from "@/pinia/app.pinia"
import { ELanguages } from "@/ts/pinia/app.types"
import { getAssetUrl } from "@/utils/config/env"

export const useCategoryStore = defineStore("category", {
  state: (): ICategoriesState => ({
    categories: null,
  }),
  actions: {
    async fetchCategories(locale?: string): Promise<void> {
      try {
        // Get current locale if not provided
        if (!locale) {
          const appStore = useAppStore()
          locale = appStore.language === ELanguages.KA ? 'ka' : 'en'
        }
        
        const backendCategories = await getCategoriesForLocale(locale)
        
        // Convert ICategoryDisplay[] to ICategory[] for compatibility
        this.categories = backendCategories.map(category => ({
          id: category.id,
          name: {
            en: category.title, // Use title for both languages for now
            ka: category.title
          },
          slug: category.slug,
          icon: category.icon || undefined,
          image: category.icon ? getAssetUrl(`storage/${category.icon}`) : undefined,
          parent: category.parent_id,
          children: category.children ? category.children.map(child => ({
            id: child.id,
            name: {
              en: child.title,
              ka: child.title
            },
            slug: child.slug,
            icon: child.icon || undefined,
            image: child.icon ? getAssetUrl(`storage/${child.icon}`) : undefined,
            parent: child.parent_id,
            children: []
          })) : []
        }))
        
      } catch (error) {
        
        this.categories = []
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
