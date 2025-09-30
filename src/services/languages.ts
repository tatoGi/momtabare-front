import axios from 'axios'
import { ENV } from '@/utils/config/env'
import type { IBackendLanguage } from '@/ts/models/language.types'

// Axios instance for languages API
const LanguagesAxios = axios.create({
  baseURL: ENV.BACKEND_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Cache for languages data
let cachedLanguages: IBackendLanguage[] | null = null
let langCacheTimestamp = 0
const LANG_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getLanguages(locale: string = 'en'): Promise<IBackendLanguage[] | null> {
  const now = Date.now()
  if (cachedLanguages && (now - langCacheTimestamp) < LANG_CACHE_DURATION) {
    return cachedLanguages
  }

  const endpoint = `/${locale}/api/languages`
  const maxRetries = 3

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await LanguagesAxios.get(endpoint)
      const data = response.data
      const list: IBackendLanguage[] = data?.data || (Array.isArray(data) ? data : [])

      // Normalize fields (backend may use different naming)
      const normalized = list.map((l) => ({
        id: l.id,
        code: l.code || l.locale,
        locale: l.locale || l.code,
        title: l.title || l.name,
        name: l.name || l.title,
        native_title: (l as any).native_title || (l as any).native_name || l.nativeName,
        nativeName: (l as any).native_name || (l as any).native_title || l.nativeName,
        active: (typeof (l as any).is_active !== 'undefined') ? (l as any).is_active : l.active,
        icon: l.icon,
        // keep extra fields if needed
        is_default: (l as any).is_default,
        sort_order: (l as any).sort_order,
      })) as IBackendLanguage[]

      cachedLanguages = normalized
      langCacheTimestamp = now
      return normalized
    } catch (error) {
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, attempt * 2000))
      }
    }
  }

  // Fallback to cache if available
  if (cachedLanguages) return cachedLanguages
  return null
}
