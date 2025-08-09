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

// Blog post attribute interface
export interface IPostAttribute {
  id: number
  post_id: number
  attribute_key: string
  attribute_value: string
  locale: string | null
  created_at: string
  updated_at: string
}

// Blog post category interface
export interface IPostCategory {
  id: number
  parent_id: number | null
  active: number
  icon: string
  slug: string
  created_at: string
  updated_at: string
  translations: any[]
}

// Blog post interface
export interface IPost {
  id: number
  page_id: number
  category_id: number
  sort_order: number
  active: boolean
  created_at: string
  updated_at: string
  published_at: string
  attributes: IPostAttribute[]
  category: IPostCategory
  translations: any[]
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
  posts?: IPost[] // Blog posts for blog pages
  blogPosts?: {
    current_page: number
    data: IPost[]
    first_page_url: string
    from: number
    last_page: number
    last_page_url: string
    links: any[]
    next_page_url: string | null
    path: string
    per_page: number
    prev_page_url: string | null
    to: number
    total: number
  }
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
