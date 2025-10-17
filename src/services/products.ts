import AxiosJSON from '@/utils/helpers/axios'
import { getLocalizedApiUrl } from '@/utils/config/env'
import type { IGetProductsResponse, IGetProductsQuery } from '@/ts/services/products.types'
import type { IProductListItem } from '@/ts/models/product.types'
import { useAppStore } from '@/pinia/app.pinia'
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

const API_BASE_URL = '' // Use relative URLs for static hosting proxy

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
    const response = await AxiosJSON.get(apiUrl, { 
      params,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Language': locale,
        'X-Localization': locale,
      }
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
      rating: product.rating || product.average_rating || null,
      ratings_amount: product.ratings_amount || product.ratings_count || 0,
      comments_amount: product.comments_amount || product.comments_count || product.product_comments_count || product.productCommentsCount || 0,
      views: product.views || 0,
      rental_period: product.rental_period || '',
      rental_start_date: product.rental_start_date || null,
      rental_end_date: product.rental_end_date || null,
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
    const detailApiUrl = getLocalizedApiUrl(`products/${product.id}`)
    
    const response = await AxiosJSON.get(detailApiUrl)
    const backendProduct = response.data.data

    console.log('📊 Backend product rating data:', {
      rating: backendProduct.rating,
      average_rating: backendProduct.average_rating,
      ratings_amount: backendProduct.ratings_amount,
      ratings_count: backendProduct.ratings_count
    })

    // Map backend data to frontend IProduct format
    const mappedProduct = {
      id: backendProduct.id,
      name: backendProduct.title,
      sku: backendProduct.product_identify_id,
      slug: backendProduct.slug,
      location: backendProduct.location || 'თბილისი',
      size: backendProduct.size || 'Standard',
      price: backendProduct.price?.toString() || '0',
      rating: backendProduct.rating || backendProduct.average_rating || null,
      ratings_amount: backendProduct.ratings_amount || backendProduct.ratings_count || 0,
      views: backendProduct.views || 0,
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
      comments_amount: backendProduct.comments_amount || backendProduct.comments_count || 0,
      images: backendProduct.images.map((img: any) => ({
        id: img.id,
        url: img.url.replace(API_BASE_URL + '/', '') // Remove base URL as component adds it back
      })),
      is_favorite: backendProduct.is_favorite === 1 || backendProduct.is_favorite === true,
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

    
    const response = await AxiosJSON.get(apiUrl, {
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
        views: product.views || 0,
        rental_period: product.rental_period || '',
        rental_start_date: product.rental_start_date ?? product.start_date ?? null,
        rental_end_date: product.rental_end_date ?? product.end_date ?? null,
        categories: product.categories?.map((cat: any) => ({
          id: cat.id,
          name: cat.name || 'Uncategorized',
          slug: cat.slug || `category-${cat.id}`
        })) || [],
        images: mappedImages.length ? mappedImages : [{ id: 0, url: '' }],
        is_favorite: Boolean(product.is_favorite),
        status: product.status
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
    const locale = getCurrentLocale()
    const apiUrl = getLocalizedApiUrl('products')
    
    // Debug logging
    console.log('🔍 getPopularProducts Debug:', {
      locale,
      apiUrl,
      params
    })
    
    // Get all products and filter for popular products (is_popular = 1)
    const response = await AxiosJSON.get(apiUrl, { 
      params,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Language': locale,
        'X-Localization': locale,
      }
    })
    
    // Filter products where is_popular = 1 (only popular products)
    const allProducts = response.data.data || []
    const popularProducts = allProducts.filter((product: any) => product.is_popular === 1)
   
    console.log('🔍 Popular Products Debug:', {
      totalProducts: allProducts.length,
      popularCount: popularProducts.length,
      sampleProduct: popularProducts[0] ? {
        id: popularProducts[0].id,
        title: popularProducts[0].title,
        views: popularProducts[0].views,
        comments_amount: popularProducts[0].comments_amount,
        comments_count: popularProducts[0].comments_count,
        product_comments_count: popularProducts[0].product_comments_count,
        productCommentsCount: popularProducts[0].productCommentsCount,
        allKeys: Object.keys(popularProducts[0]).filter(k => k.toLowerCase().includes('comment'))
      } : null
    })
    
    const products: IProductListItem[] = popularProducts.map((product: any) => {
      const mappedProduct = {
        id: product.id,
        name: product.title,
        sku: product.product_identify_id,
        slug: product.slug,
        location: product.location,
        price: product.price,
        rating: product.rating || product.average_rating || null,
        ratings_amount: product.ratings_amount || product.ratings_count || 0,
        comments_amount: product.comments_amount || product.comments_count || product.product_comments_count || product.productCommentsCount || 0,
        views: product.views || 0,
        rental_period: product.rental_period || '',
        rental_start_date: product.rental_start_date || null,
        rental_end_date: product.rental_end_date || null,
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
            // If URL already has a protocol (http/https), ensure it doesn't have duplicate domains
            if (img.url.startsWith('http')) {
              // Remove any duplicate domain parts
              const url = new URL(img.url)
              // If the path already contains the domain, remove the duplicate
              const cleanPath = url.pathname.replace(new RegExp(`^${url.hostname}/?`), '')
              return {
                id: img.id,
                url: `https://${url.hostname}${cleanPath}`
              }
            }
            
            // If URL has storage/products, ensure it's a relative path
            if (img.url.includes('storage/products/')) {
              // Ensure it's a relative path
              const cleanUrl = img.url.startsWith('/') ? img.url : `/${img.url}`
              return {
                id: img.id,
                url: cleanUrl
              }
            }
            
            // Transform relative URLs to include products directory
            return {
              id: img.id,
              url: img.url.includes('storage/products') 
                ? `/${img.url.replace(/^\/?(storage\/products)\/?/i, '$1/')}`
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
      }      
      return mappedProduct
    })
    
    console.log('📊 Total popular products:', products.length, 
                'With ratings:', products.filter(p => p.rating && p.rating > 0).length)

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
    const locale = getCurrentLocale()
    const apiUrl = getLocalizedApiUrl('products')
    
    // Get all products and filter for favorites (is_favorite = 1)
    const response = await AxiosJSON.get(apiUrl, { 
      params,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Language': locale,
        'X-Localization': locale,
      }
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
      rating: product.rating || product.average_rating || null,
      ratings_amount: product.ratings_amount || product.ratings_count || 0,
      comments_amount: product.comments_amount || product.comments_count || product.product_comments_count || product.productCommentsCount || 0,
      views: product.views || 0,
      rental_period: product.rental_period || '',
      rental_start_date: product.rental_start_date || null,
      rental_end_date: product.rental_end_date || null,
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
      apiUrl = getLocalizedApiUrl('remove-from-wishlist')
      requestData = { product_id: productId }
    } else {
      // Product is not favorite, so add it
      apiUrl = getLocalizedApiUrl('add-to-wishlist')
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
    const response = await AxiosJSON.post(apiUrl, requestData, { 
      headers
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
          apiUrl = getLocalizedApiUrl('remove-from-wishlist')
          requestData = { product_id: productId }
        } else {
          apiUrl = getLocalizedApiUrl('add-to-wishlist')
          requestData = { product_id: productId }
        }
        
        const response = await AxiosJSON.post(apiUrl, requestData, {
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

/**
 * Update product rental status after successful payment
 */
export async function updateProductRentalStatus(
  productId: number,
  rentalData: {
    is_rented: boolean
    is_ordered: boolean
    ordered_by: number
    rental_start_date: string
    rental_end_date: string
  }
): Promise<{ success: boolean; message: string }> {
  try {
    const locale = getCurrentLocale()
    const apiUrl = getLocalizedApiUrl(`products/${productId}/rental-status`)
    
    console.log('📦 Updating rental status for product:', productId, rentalData)
    
    const response = await AxiosJSON.post(apiUrl, rentalData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Language': locale,
        'X-Localization': locale,
      }
    })
    
    return {
      success: true,
      message: response.data.message || 'Product rental status updated successfully'
    }
  } catch (error: any) {
    console.error('❌ Failed to update product rental status:', error)
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update product rental status'
    }
  }
}

/**
 * Update multiple products rental status (for cart checkout)
 */
export async function updateCartProductsRentalStatus(
  cartItems: Array<{
    product_id: number
    rental_start_date: Date | string
    rental_end_date: Date | string
    ordered_by: number
  }>
): Promise<{ success: boolean; message: string; errors?: any[] }> {
  try {
    const locale = getCurrentLocale()
    const apiUrl = getLocalizedApiUrl('products/bulk-rental-status')
    
    // Format the data
    const rentalUpdates = cartItems.map(item => ({
      product_id: item.product_id,
      is_rented: true,
      is_ordered: true,
      ordered_by: item.ordered_by,
      rental_start_date: typeof item.rental_start_date === 'string' 
        ? item.rental_start_date 
        : item.rental_start_date.toISOString(),
      rental_end_date: typeof item.rental_end_date === 'string'
        ? item.rental_end_date
        : item.rental_end_date.toISOString()
    }))
    
    console.log('📦 Bulk updating rental status for products:', rentalUpdates)
    
    const response = await AxiosJSON.post(apiUrl, { products: rentalUpdates }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Language': locale,
        'X-Localization': locale,
      }
    })
    
    return {
      success: true,
      message: response.data.message || 'Products rental status updated successfully',
      errors: response.data.errors
    }
  } catch (error: any) {
    console.error('❌ Failed to bulk update product rental status:', error)
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update products rental status',
      errors: error.response?.data?.errors
    }
  }
}