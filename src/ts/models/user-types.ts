// User types definition - matches Laravel backend database schema
export interface IUser {
    // Required fields from database
    id: number
    email: string
    password?: string // Only included in some responses
    is_retailer: boolean | number
    created_at: string
    updated_at: string
    
    // Optional profile fields
    first_name?: string | null
    surname?: string | null
    phone?: string | null
    avatar?: string | null
    personal_id?: string | null
    birth_date?: string | null
    gender?: string | null
    
    // Email verification fields
    email_verification_token?: string | null
    verification_code?: string | null
    verification_expires_at?: string | null
    email_verified_at?: string | null
    
    // Retailer fields
    retailer_status?: string | null
    retailer_requested_at?: string | null
    
    // Authentication fields
    remember_token?: string | null
    
    // Legacy/compatibility fields
    last_name?: string | null
    profile_picture?: string | null
    country_code?: string
    phone_number?: string
    rating_stats?: IUserRatingStats
    products_amount?: number
    products_count?: number // Backend uses products_count
    comments_amount?: number
    is_admin?: number
}

export interface IUserRatingStats {
    average: number
    total: number
    rating_1: number
    rating_2: number
    rating_3: number
    rating_4: number
    rating_5: number
}

import type { ComputedRef } from 'vue'

export interface IUserCard {
  icon: string
  title: string
  name: string
  description: string
  showBadge?: boolean | (() => boolean) | ComputedRef<boolean>
}
