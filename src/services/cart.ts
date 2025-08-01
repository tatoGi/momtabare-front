import type { ICart } from "@/ts/models/cart.types"

export async function getCart(): Promise<ICart> {
  // This is a mock implementation
  return {
    items: [
      {
        id: 1,
        product: {
          id: 1,
          name: 'Demo Product',
          sku: 'DP001',
          location: 'Warehouse A',
          size: 'M',
          price: '100',
          rating: 4.5,
          ratings_amount: 10,
          views: 100,
          status: 'available',
          description: 'Demo product description',
          product_owner: {
            id: 1,
            first_name: 'Demo',
            last_name: 'User',
            email: 'demo@example.com',
            country_code: 'US',
            phone_number: '1234567890',
            profile_picture: '',
            rating_stats: {
              average: 4.5,
              total: 10,
              rating_1: 0,
              rating_2: 0,
              rating_3: 1,
              rating_4: 2,
              rating_5: 7
            },
            products_amount: 5,
            comments_amount: 3,
            is_retailer: 1,
            is_admin: 0,
            created_at: new Date().toISOString()
          },
          categories: [
            { 
              id: 1, 
              name: { en: 'Demo Category', ka: 'დემო კატეგორია' },
              slug: 'demo-category',
              icon: 'category-icon',
              image: 'category-image.jpg',
              parent: null,
              children: []
            }
          ],
          comments_amount: 5,
          images: [],
          is_favorited: false,
          booked_dates: []
        },
        quantity: 2,
        rental_days: 1,
        total_price: '200',
        unit_price: '100',
        user: {
          id: 1,
          first_name: 'Demo',
          last_name: 'User',
          email: 'demo@example.com',
          country_code: 'US',
          phone_number: '1234567890',
          profile_picture: '',
          rating_stats: {
            average: 4.5,
            total: 10,
            rating_1: 0,
            rating_2: 0,
            rating_3: 1,
            rating_4: 2,
            rating_5: 7
          },
          products_amount: 5,
          comments_amount: 3,
          is_retailer: 1,
          is_admin: 0,
          created_at: new Date().toISOString()
        },
        start_date: new Date(),
        end_date: new Date()
      }
    ],
    total_items: 1,
    total_price: 200
  };
}

export async function addToCart() {
  return { success: true };
}

export async function removeFromCart() {
  return { success: true };
}

export async function updateCartItem() {
  return { success: true };
}
