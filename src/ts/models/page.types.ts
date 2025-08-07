// Banner translation interface
export interface IBannerTranslation {
  id: number
  banner_id: number
  locale: string
  title: string
  slug: string
  desc: string
  created_at: string
  updated_at: string
}

// Banner image interface
export interface IBannerImage {
  id: number
  banner_id: number
  image_name: string
  created_at: string
  updated_at: string
}

// Banner interface
export interface IBanner {
  id: number
  type_id: number
  thumb: string | null
  author_id: number
  created_at: string
  updated_at: string
  title: string
  slug: string
  desc: string
  images?: IBannerImage[]
  pivot: {
    page_id: number
    banner_id: number
    sort: number
  }
  translations: IBannerTranslation[]
}

// Page translation interface
export interface IPageTranslation {
  id: number
  page_id: number
  locale: string
  title: string
  keywords: string
  slug: string
  desc: string
  icon: string | null
  active: number
  created_at: string
  updated_at: string
}

// Main page interface
export interface IPage {
  id: number
  parent_id: number | null
  type_id: number
  sort: number | null
  created_at: string
  updated_at: string
  title: string
  locale: string
  keywords: string
  slug: string
  active: number
  desc: string
  translations: IPageTranslation[]
  products: any[] // You can define product types later
  banners: IBanner[]
}

// Navigation menu item interface (processed from pages)
export interface INavigationItem {
  id: number
  title: string
  slug: string
  path: string
  active: boolean
  icon?: string
  children?: INavigationItem[]
  parent_id?: number | null
}

// API response type for pages
export interface IPagesResponse {
  data?: IPage[]
  pages?: IPage[]
  // Add other possible response properties
}

// Helper type for getting translation by locale
export type PageWithTranslation = IPage & {
  currentTranslation?: IPageTranslation
}
