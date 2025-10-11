import axios from 'axios'
import { ENV, getLocalizedApiUrl } from '@/utils/config/env'
import type { IGetProductsResponse, IGetProductsQuery } from '@/ts/services/products.types'
import type { IProductListItem } from '@/ts/models/product.types'
import { useAppStore } from '@/pinia/app.pinia'
import { getApiUrl } from '@/utils/api/url'
import { ELanguages } from '@/ts/pinia/app.types'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// Helper function to get cookie value by name
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

const API_BASE_URL = ENV.BACKEND_URL

// Get current locale for API calls
function getCurrentLocale(): string {
  try {
    const appStore = useAppStore()
    return appStore.language === ELanguages.KA ? 'ka' : 'en'
  } catch {
    return 'en' // fallback
  }
}

export async function getProducts(params?: IGetProductsQuery): Promise<IGetProductsResponse> {
  try {
    NProgress.start()
    const locale = getCurrentLocale()
    const apiUrl = getLocalizedApiUrl('products')
    
    
    // Use API endpoint with locale in headers: /api/products
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
    
    
    // Map backend data to frontend format
    const products: IProductListItem[] = response.data.data.map((product: any) => ({
      id: product.id,
      name: product.title,
      sku: product.product_identify_id,
      slug: product.slug,
      location: product.location,
      price: product.price,
      brand: product.brand,
      color: product.color,
      rating: null, // Not provided by backend yet
      ratings_amount: 0, // Not provided by backend yet
      comments_amount: 0, // Not provided by backend yet
      categories: product.category ? [{
        id: product.category.id,
        name: {
          ka: product.category.title,
          en: product.category.title
        },
        slug: product.category.slug
      }] : [],
      images: product.images || [],
      is_favorite: product.is_favorite === 1 // Map backend is_favorite field
    }))

    NProgress.done()
    return {
      message: 'Products fetched successfully',
      products,
      pagination: {
        current_page: response.data.pagination?.current_page || 1,
        last_page: response.data.pagination?.last_page || 1,
        per_page: response.data.pagination?.per_page || 12,
        total: response.data.pagination?.total || products.length
      }
    }
  } catch (error) {
    NProgress.done()
    console.error('Error fetching products:', error)
    return {
      message: 'Failed to fetch products',
      products: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 12,
        total: 0
      }
    }
  }
}

export async function getProductBySku({ sku }: { sku: string }): Promise<{ message: string; product: any } | null> {
  try {
    NProgress.start()
    
    // First get all products and find by slug (sku parameter is actually the slug from URL)
    const productsResponse = await getProducts()
    const product = productsResponse.products.find((p: IProductListItem) => 
      p.slug === sku || p.slug?.startsWith(sku) || p.sku === sku
    )
    
    if (!product) {
      NProgress.done()
      return null
    }

    // Get detailed product data using the ID with locale
    const detailApiUrl = getApiUrl(`/api/products/${product.id}`, API_BASE_URL)
    
    const response = await axios.get(detailApiUrl)
    const backendProduct = response.data.data

    // Map backend data to frontend IProduct format
    const mappedProduct = {
      id: backendProduct.id,
      name: backendProduct.title,
      sku: backendProduct.product_identify_id,
      slug: backendProduct.slug,
      location: backendProduct.location || 'თბილისი',
      size: backendProduct.size || 'Standard',
      price: backendProduct.price?.toString() || '0',
      rating: null, // Not provided by backend yet
      ratings_amount: 0, // Not provided by backend yet
      views: 0, // Not provided by backend yet
      status: 'available',
      description: backendProduct.description || '',
      product_owner: backendProduct.product_owner,
      categories: backendProduct.category ? [{
        id: backendProduct.category.id,
        name: {
          ka: backendProduct.category.title,
          en: backendProduct.category.title
        },
        slug: backendProduct.category.slug
      }] : [],
      comments_amount: 0, // Not provided by backend yet
      images: backendProduct.images.map((img: any) => ({
        id: img.id,
        url: img.url.replace(API_BASE_URL + '/', '') // Remove base URL as component adds it back
      })),
      is_favorite: false, // Not provided by backend yet
      booked_dates: []
    }

    NProgress.done()
    return {
      message: 'Product fetched successfully',
      product: mappedProduct
    }
  } catch (error) {
    NProgress.done()
    console.error('Error fetching product by SKU:', error)
    return null
  }
}

export async function getProductBySeller() {
  return {
    products: [
      { id: 1, name: 'Demo Product', price: 100 }
    ],
    total: 1
  };
}

export async function getProductsByUser(userId: number): Promise<{ data: IProductListItem[] }> {
  try {
    NProgress.start()
       const apiUrl = getLocalizedApiUrl('/retailer/user/products')

    
    const response = await axios.get(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      params: { user_id: userId }
    })

    // Handle paginated response structure
    const paginated = response.data.data
    const productsArray = Array.isArray(paginated.data) ? paginated.data : []

    const products: IProductListItem[] = productsArray.map((product: any) => {
      const mappedImages = Array.isArray(product.images)
        ? product.images.map((img: any) => ({
            id: img.id ?? 0,
            url: img.image_name || img.url || img.path || img.image_path || img.file_path || img.src || ''
          }))
        : []

      return {
        id: product.id,
        name: product.title || 'No Title',
        sku: product.product_identify_id || `product-${product.id}`,
        slug: product.slug || `product-${product.id}`,
        location: product.location || 'Location not specified',
        price: product.price || '0.00',
        rating: 0,
        ratings_amount: 0,
        comments_amount: 0,
        categories: product.categories?.map((cat: any) => ({
          id: cat.id,
          name: cat.name || 'Uncategorized',
          slug: cat.slug || `category-${cat.id}`
        })) || [],
        images: mappedImages.length ? mappedImages : [{ id: 0, url: '' }],
        is_favorite: Boolean(product.is_favorite),
        status: product.status,
        rental_start_date: product.rental_start_date ?? product.start_date ?? null,
        rental_end_date: product.rental_end_date ?? product.end_date ?? null
      } as IProductListItem & { status?: string }
    })

    // Optionally return pagination info if needed
    // return { data: products, pagination: paginated }
    return { data: products }
  } catch (error) {
    console.error('Error fetching user products:', error)
    return { data: [] }
  } finally {
    NProgress.done()
  }
}

export async function getPopularProducts(params?: IGetProductsQuery): Promise<IGetProductsResponse> {
  try {
    NProgress.start()
    const apiUrl = getApiUrl('/api/products', API_BASE_URL)
    
    // Get all products and filter for popular products (is_popular = 1)
    const response = await axios.get(apiUrl, { 
      params,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      withCredentials: true
    })
    
    // Filter products where is_popular = 1 (only popular products)
    const allProducts = response.data.data || []
    const popularProducts = allProducts.filter((product: any) => product.is_popular === 1)
    
    const products: IProductListItem[] = popularProducts.map((product: any) => ({
      id: product.id,
      name: product.title,
      sku: product.product_identify_id,
      slug: product.slug,
      location: product.location,
      price: product.price,
      rating: null,
      ratings_amount: 0,
      comments_amount: 0,
      categories: product.category ? [{
        id: product.category.id,
        name: {
          ka: product.category.title,
          en: product.category.title
        },
        slug: product.category.slug
      }] : [],
      images: (() => {
        // If no images, return default placeholder
        if (!product.images || product.images.length === 0) {
          return [{
            id: 0,
            url: '/storage/products/placeholder.jpg'
          }]
        }
        
        return product.images.map((img: any) => {
          // Handle case where image is already in the correct format
          if (img.url) {
            // If URL already has products directory or is external, use as is
            if (img.url.includes('storage/products/') || img.url.startsWith('http')) {
              return {
                id: img.id,
                url: img.url
              }
            }
            
            // Transform URL to include products directory
            return {
              id: img.id,
              url: img.url.includes('storage/products') 
                ? img.url.replace('storage/products', 'storage/products/')
                : `/storage/products/${img.url.replace(/^\//, '')}` // Remove leading slash if present
            }
          }
          
          // Handle case where we only have image_name
          if (img.image_name) {
            return {
              id: img.id,
              url: `/storage/products/${img.image_name.replace(/^\//, '')}`
            }
          }
          
          // Fallback to default placeholder
          return {
            id: img.id,
            url: '/storage/products/placeholder.jpg'
          }
        })
      })(),
      is_favorite: product.is_favorite === 1 // Map actual favorite status from backend
    }))

    NProgress.done()
    return {
      message: 'Popular products fetched successfully',
      products,
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: products.length,
        total: products.length
      }
    }
  } catch (error) {
    NProgress.done()
    console.error('Error fetching popular products:', error)
    return {
      message: 'Failed to fetch popular products',
      products: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 12,
        total: 0
      }
    }
  }
}

export async function getFavoriteProducts(params?: IGetProductsQuery): Promise<IGetProductsResponse> {
  try {
    NProgress.start()
    const apiUrl = getApiUrl('/api/products', API_BASE_URL)
    
    // Get all products and filter for favorites (is_favorite = 1)
    const response = await axios.get(apiUrl, { 
      params,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      withCredentials: true
    })
    
    // Filter products where is_favorite = 1 (only actually favorited products)
    const allProducts = response.data.data || []
    const favoriteProducts = allProducts.filter((product: any) => product.is_favorite === 1)
    
    const products: IProductListItem[] = favoriteProducts.map((product: any) => ({
      id: product.id,
      name: product.title,
      sku: product.product_identify_id,
      slug: product.slug,
      location: product.location,
      price: product.price,
      rating: null,
      ratings_amount: 0,
      comments_amount: 0,
      categories: product.category ? [{
        id: product.category.id,
        name: {
          ka: product.category.title,
          en: product.category.title
        },
        slug: product.category.slug
      }] : [],
      images: product.images?.map((img: any) => ({
        id: img.id,
        url: img.url ? img.url.replace('/storage/', '/storage/') : `/storage/${img.image_name || 'placeholder.jpg'}`
      })) || [],
      is_favorite: true // All products in this list are favorited
    }))

    NProgress.done()
    return {
      message: 'Favorite products fetched successfully',
      products,
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: products.length,
        total: products.length
      }
    }
  } catch (error) {
    NProgress.done()
    console.error('Error fetching favorite products:', error)
    return {
      message: 'Failed to fetch favorite products',
      products: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 12,
        total: 0
      }
    }
  }
}

export async function toggleFavoriteProduct(productId: number, currentFavoriteStatus: boolean): Promise<{ success: boolean; is_favorite?: boolean; message?: string }> {
  try {
    NProgress.start()
    
    let apiUrl: string
    let requestData: any
    
    if (currentFavoriteStatus) {
      // Product is currently favorite, so remove it
      apiUrl = getApiUrl('/api/remove-from-wishlist', API_BASE_URL)
      requestData = { product_id: productId }
    } else {
      // Product is not favorite, so add it
      apiUrl = getApiUrl('/api/add-to-wishlist', API_BASE_URL)
      requestData = { product_id: productId }
    }
    
    // Prepare headers with credentials
    const headers: any = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') // Get CSRF token from cookies
    }
    
    const authToken = localStorage.getItem('auth_token')
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }
    
    // Make API call to add/remove favorite with credentials
    const response = await axios.post(apiUrl, requestData, { 
      headers,
      withCredentials: true // Important for sessions and cookies
    })
    
    NProgress.done()
    const newFavoriteStatus = currentFavoriteStatus ? false : true
    
    return {
      success: true,
      is_favorite: newFavoriteStatus,
      message: currentFavoriteStatus 
        ? 'Product removed from wishlist' 
        : (response.data.exists ? 'Product already in wishlist' : 'Product added to wishlist')
    }
  } catch (error: any) {
    NProgress.done()
    
    // For non-authenticated users, we can still allow wishlist operations
    // The backend should handle session-based wishlist for non-authenticated users
    if (error.response?.status === 401) {
      // Try without authentication - might work for session-based wishlist
      try {
        let apiUrl: string
        let requestData: any
        
        if (currentFavoriteStatus) {
          apiUrl = getApiUrl('/api/remove-from-wishlist', API_BASE_URL)
          requestData = { product_id: productId }
        } else {
          apiUrl = getApiUrl('/api/add-to-wishlist', API_BASE_URL)
          requestData = { product_id: productId }
        }
        
        const response = await axios.post(apiUrl, requestData, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        
        const newFavoriteStatus = currentFavoriteStatus ? false : true
        
        return {
          success: true,
          is_favorite: newFavoriteStatus,
          message: currentFavoriteStatus 
            ? 'Product removed from wishlist' 
            : (response.data.exists ? 'Product already in wishlist' : 'Product added to wishlist')
        }
      } catch (retryError: any) {
        return { 
          success: false, 
          message: 'Failed to update wishlist. Please try again.' 
        }
      }
    }
    
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to update wishlist' 
    }
  }
}