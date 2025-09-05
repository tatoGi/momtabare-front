export interface IBackendLanguage {
  id?: number
  code?: string // e.g., 'en', 'ka'
  locale?: string // alternative key for code
  title?: string // display title
  name?: string // alternative name field
  native_title?: string
  nativeName?: string
  active?: number | boolean
  icon?: string // optional icon path from backend
}

export interface ILanguageDisplay {
  code: 'en' | 'ka' | string
  label: string // short label for button e.g., 'ENG' | 'GEO'
  name: string // English name fallback
  nativeName?: string // Native language name
  active: boolean
  icon?: string // full asset URL if provided
}
