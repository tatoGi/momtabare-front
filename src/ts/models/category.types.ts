// Backend category translation interface
export interface ICategoryTranslation {
  id: number
  category_id: number
  locale: string
  title: string
  slug: string
  description: string
}

// Backend category interface
export interface IBackendCategory {
  id: number
  parent_id: number | null
  active: number
  icon: string | null
  created_at: string
  updated_at: string
  title: string
  slug: string
  description: string
  translations: ICategoryTranslation[]
}

// Frontend category interface for display
export interface ICategoryDisplay {
  id: number
  title: string
  slug: string
  description: string
  icon: string | null
  parent_id: number | null
  active: boolean
  children?: ICategoryDisplay[]
}
