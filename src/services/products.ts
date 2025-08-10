import axios from 'axios'
import { ENV } from '@/utils/config/env'
import type { IGetProductsResponse, IGetProductsQuery } from '@/ts/services/products.types'
import type { IProductListItem } from '@/ts/models/product.types'
import { useAppStore } from '@/pinia/app.pinia'
import { ELanguages } from '@/ts/pinia/app.types'
import NProgress from 'nprogress'

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
    const apiUrl = `${API_BASE_URL}/${locale}/products`
    
    
    // Use localized API endpoint: /en/products or /ka/products
    const response = await axios.get(apiUrl, { 
      params,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
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
      is_favorited: false // Not provided by backend yet
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

export async function getProductBySku({ sku }: { sku: string }): Promise<{ product: any } | null> {
  try {
    NProgress.start()
    
    // First get all products and find by slug (sku parameter is actually the slug from URL)
    const productsResponse = await getProducts()
    const product = productsResponse.products.find((p: IProductListItem) => 
      p.slug === sku || p.slug?.startsWith(sku) || p.sku === sku
    )
    
    if (!product) {
      NProgress.done()
      console.error('Product not found with slug/SKU:', sku)
      console.log('Available products:', productsResponse.products.map(p => ({ slug: p.slug, sku: p.sku })))
      return null
    }

    // Get detailed product data using the ID with locale
    const locale = getCurrentLocale()
    const detailApiUrl = `${API_BASE_URL}/${locale}/products/${product.id}`
    console.log('🔍 Fetching product details:', detailApiUrl)
    
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
      product_owner: {
        id: 1,
        first_name: 'მფლობელი',
        last_name: '',
        email: 'owner@example.com'
      },
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
      is_favorited: false, // Not provided by backend yet
      booked_dates: []
    }

    NProgress.done()
    return {
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

export async function getFavoriteProducts() {
  return {
    products: [
      { id: 2, name: 'Sample Product', price: 200 }
    ],
    total: 1
  };
}

export async function toggleFavoriteProduct(productId: number): Promise<{ success: boolean }> {
  console.log('Toggling favorite for product:', productId);
  // In a real implementation, this would make an API call
  return { success: true };
}