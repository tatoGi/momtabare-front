// User types definition
export interface IUser {
    id: number
    first_name: string
    // Some endpoints use surname instead of last_name
    surname?: string | null
    last_name?: string | null
    email: string
    // Laravel profile fields
    phone?: string | null
    personal_id?: string | null
    birth_date?: string | null
    gender?: string | null
    // Legacy fields kept for compatibility with older screens
    country_code?: string
    phone_number?: string
    profile_picture: string
    rating_stats: IUserRatingStats
    products_amount: number
    comments_amount: number
    is_retailer: number | boolean
    retailer_status?: string | null
    retailer_requested_at?: string | null
    is_admin: number
    created_at: string
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

export interface IUserCard {
  icon: string
  title: string
  name: string
  description: string
}
