// User types definition
export interface IUser {
    id: number
    first_name: string
    last_name: string
    email: string
    country_code: string
    phone_number: string
    profile_picture: string
    rating_stats: IUserRatingStats
    products_amount: number
    comments_amount: number
    is_retailer: number
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
