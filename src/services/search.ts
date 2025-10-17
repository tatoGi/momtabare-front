import axios from 'axios'
import { getLocalizedApiUrl } from '@/utils/config/env'
import { useAppStore } from '@/pinia/app.pinia'
import { ELanguages } from '@/ts/pinia/app.types'
import NProgress from 'nprogress'

// Get current locale for API calls
function getCurrentLocale(): string {
  try {
    const appStore = useAppStore()
    return appStore.language === ELanguages.KA ? 'ka' : 'en'
  } catch {
    return 'en' // fallback
  }
}

export interface ISearchQuery {
  search?: string
  start_date?: string
  end_date?: string
  location?: string
  per_page?: number
  page?: number
}

export interface ISearchProduct {
  id: number
  slug: string
  title: string
  description: string
  brand: string
  price: number
  currency: string
  image: string | null
  location: string
  size: string
  category: {
    id: number
    title: string
    slug: string
  } | null
  rental_period: string
  rental_start_date: string | null
  rental_end_date: string | null
  is_favorite: boolean
  is_popular: boolean
  average_rating: number
  total_comments: number
  created_at: string
  updated_at: string
}

export interface ISearchCategory {
  id: number
  slug: string
  title: string
  description: string
  image: string | null
}

export interface ISearchPagination {
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number | null
  to: number | null
}

export interface ISearchFilters {
  search: string
  start_date: string | null
  end_date: string | null
  location: string | null
}

export interface ISearchResponse {
  success: boolean
  data: {
    products: ISearchProduct[]
    categories: ISearchCategory[]
    pagination: ISearchPagination
    filters: ISearchFilters
  }
}

export async function searchProducts(params: ISearchQuery): Promise<ISearchResponse> {
  try {
    NProgress.start()
    const locale = getCurrentLocale()
    const apiUrl = getLocalizedApiUrl('search')
    
    const response = await axios.get(apiUrl, { 
      params,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Language': locale,
        'X-Localization': locale,
      },
      withCredentials: true
    })
    
    NProgress.done()
    return response.data
  } catch (error) {
    NProgress.done()
    console.error('Error searching products:', error)
    
    // Return empty response structure on error
    return {
      success: false,
      data: {
        products: [],
        categories: [],
        pagination: {
          total: 0,
          per_page: 10,
          current_page: 1,
          last_page: 1,
          from: null,
          to: null
        },
        filters: {
          search: params.search || '',
          start_date: params.start_date || null,
          end_date: params.end_date || null,
          location: params.location || null
        }
      }
    }
  }
}
