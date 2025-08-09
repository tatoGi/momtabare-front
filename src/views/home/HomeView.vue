<script lang="ts" setup>
import FAQComponent from "@/components/faq/FAQComponent.vue"
import JoinUsComponent from "@/components/home/JoinUsComponent.vue"
import RentalStepsComponent from "@/components/home/RentalStepsComponent.vue"
import CategoriesComponent from "@/components/home/categories/CategoriesComponent.vue"
import SliderComponent from "@/components/home/slider/SliderComponent.vue"
import PopularProductsSlider from "@/components/home/PopularProductsSlider.vue"
import type { IProductListItem } from "@/ts/models/product.types.js"
import { onMounted, onUnmounted, ref, watch } from 'vue'
import BlogList from "@/components/blog/BlogList.vue"
import { getHomePageData, getBlogPosts } from "@/services/pages"
import { getProducts } from "@/services/products"
import type { IBanner } from "@/ts/models/page.types"
import { useAppStore } from "@/pinia/app.pinia"
import { ELanguages } from "@/ts/pinia/app.types"
import { getAssetUrl } from "@/utils/config/env"

// Static popular products data

const products = ref<IProductListItem[] | null>(null)
const homeBanners = ref<IBanner[]>([])
const blogPosts = ref<any[]>([])
// Dynamic section data from posts
type JoinUsData = {
  titleTop?: string
  titleBottom?: string
  descriptions?: string[]
  buttonLabel?: string
  buttonLink?: string
  imageMain?: string
  helmetImage?: string
  snowboardImage?: string
}
type RentalData = {
  titleLine1?: string
  titleLine2?: string
  description?: string
  steps?: { title: string; text: string }[]
  imageMain?: string
}
const joinUsData = ref<JoinUsData | null>(null)
const rentalData = ref<RentalData | null>(null)
const appStore = useAppStore()

// Function to fetch home page dynamic data (banners + posts)
async function fetchHomePageDynamic() {
  try {
    const currentLocale = appStore.language === ELanguages.KA ? 'ka' : 'en'
    const fallbackLocale = currentLocale === 'ka' ? 'en' : 'ka'
    const homePageData = await getHomePageData(currentLocale)
   
  // Banners
  homeBanners.value = homePageData?.banners ?? []
  
  // Fetch popular products
  try {
    const productsData = await getProducts()
    console.log('Products data received:', productsData)
    
    // Handle different possible response structures
    if (productsData?.products && Array.isArray(productsData.products)) {
      products.value = productsData.products
    } else if (productsData?.data && Array.isArray(productsData.data)) {
      products.value = productsData.data
    } else if (Array.isArray(productsData)) {
      products.value = productsData
    } else {
      console.warn('No products found in response:', productsData)
      products.value = []
    }
    
    console.log('Products loaded:', products.value?.length || 0, 'items')
  } catch (error) {
    console.error('Error fetching products:', error)
    products.value = []
  }
  
  // Fetch blog posts from dedicated API
  const blogPostsData = await getBlogPosts()
  // Blog Posts
  if (blogPostsData?.posts && Array.isArray(blogPostsData.posts)) {
    blogPosts.value = blogPostsData.posts.map((post: any) => {
      
      // Extract localized attributes
      const getPostAttribute = (key: string) => {
        const attr = post.attributes?.find((a: any) => 
          a.attribute_key === key && (a.locale === currentLocale || a.locale === null)
        )
        if (attr) return attr.attribute_value
        
        // Fallback to other locale
        const fallbackAttr = post.attributes?.find((a: any) => 
          a.attribute_key === key && a.locale === fallbackLocale
        )
        return fallbackAttr?.attribute_value || ''
      }

      return {
        id: post.id,
        title: getPostAttribute('title'),
        date: post.published_at ? new Date(post.published_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        image: getPostAttribute('featured_image') ? getAssetUrl(`storage/${getPostAttribute('featured_image')}`) : null,
        slug: getPostAttribute('slug'),
        content: getPostAttribute('content'),
        author: getPostAttribute('author')
      }
    })
  } else {
    blogPosts.value = []
  }

  // Products from home page response
  if (homePageData?.products && Array.isArray(homePageData.products)) {
    // Transform backend products to match IProductListItem interface
    products.value = homePageData.products.slice(0, 8).map((backendProduct: any) => ({
      id: backendProduct.id,
      sku: backendProduct.product_identify_id || `product-${backendProduct.id}`,
      slug: backendProduct.slug,
      name: backendProduct.title,
      price: parseFloat(backendProduct.price?.replace(/[^\d.]/g, '') || '0'),
      images: [
        {
          id: backendProduct.images?.[0]?.id || 1,
          url: backendProduct.images?.[0]?.image_name ? getAssetUrl(`storage/${backendProduct.images[0].image_name}`) : getAssetUrl('storage/placeholder-image.jpg'),
          is_primary: true
        }
      ],
      rating: 4.5, // Default rating since backend doesn't provide this
      reviews_count: 0, // Default since backend doesn't provide this
      is_favorited: false, // Default since backend doesn't provide this
      is_popular: true,
      product_owner: {
        id: 1,
        name: 'Momtabare',
        avatar: 'https://via.placeholder.com/50'
      },
      location: backendProduct.location || 'Tbilisi, Georgia'
    }))
  } else {
    products.value = null
  }

  // Posts -> extract join_us / rental
  joinUsData.value = null
  rentalData.value = null

  const posts = homePageData?.posts ?? []
  // Helper to get localized attribute map for a post
  const getAttrMap = (post: any) => {
    const map: Record<string, string> = {}
    if (!post?.attributes) return map
    // select preferred locale first, then fallback if missing
    for (const attr of post.attributes as any[]) {
      if (!map[attr.attribute_key] && (attr.locale === currentLocale || attr.locale == null)) {
        map[attr.attribute_key] = String(attr.attribute_value)
      }
    }
    for (const attr of post.attributes as any[]) {
      if (!map[attr.attribute_key] && (attr.locale === fallbackLocale)) {
        map[attr.attribute_key] = String(attr.attribute_value)
      }
    }
    return map
  }

  posts.forEach((post: any) => {
    const attrs = getAttrMap(post)
    
    const postType = attrs['post_type'] || attrs['type']
    if (!postType) {
      return
    }

    if (postType === 'join_us' && !joinUsData.value) {
      const descriptions: string[] = []
      ;['join_description_1', 'join_description_2', 'join_description_3'].forEach(k => {
        if (attrs[k]) descriptions.push(attrs[k])
      })
      const mainImageUrl = attrs['main_image'] ? getAssetUrl(`storage/${attrs['main_image']}`) : undefined
      const helmetImageUrl = attrs['helmet_image'] ? getAssetUrl(`storage/${attrs['helmet_image']}`) : undefined
      const snowboardImageUrl = attrs['snowboard_image'] ? getAssetUrl(`storage/${attrs['snowboard_image']}`) : undefined
      
      joinUsData.value = {
        titleTop: attrs['join_title_line_1'],
        titleBottom: attrs['join_title_line_2'],
        descriptions: descriptions.length ? descriptions : undefined,
        buttonLabel: attrs['join_button_text'],
        buttonLink: attrs['button_url'],
        imageMain: mainImageUrl,
        helmetImage: helmetImageUrl,
        snowboardImage: snowboardImageUrl,
      }
    }
   
    if (postType === 'rental_steps' && !rentalData.value) {
     
      const steps: { title: string; text: string }[] = []
      for (let i = 1; i <= 6; i++) {
        const t = attrs[`step_${i}_title`]
        const d = attrs[`step_${i}_text`] || attrs[`step_${i}_desc`]
        if (t && d) steps.push({ title: t, text: d })
      }
      rentalData.value = {
        titleLine1: attrs['title_line_1'] || attrs['title1'] || attrs['title_line1'],
        titleLine2: attrs['title_line_2'] || attrs['title2'] || attrs['title_line2'],
        description: attrs['description'] || attrs['desc'],
        steps: steps.length ? steps : undefined,
        imageMain: attrs['image_main'] ? getAssetUrl(`storage/${attrs['image_main']}`) : undefined,
      }
    }
  })

  } catch (error) {
    console.error('Error fetching home page data:', error)
  }
}

onMounted(async () => {
  // Fetch all home page data (banners, posts, products)
  await fetchHomePageDynamic()
})

// Watch for language changes and re-fetch banner data
watch(
  () => appStore.language,
  async () => {
    console.log('Language changed, re-fetching banner data...')
    await fetchHomePageDynamic()
  }
)

const isMobile = ref(false);
const windowWidth = ref(0);
const isDev = import.meta.env.DEV;

// Function to safely get viewport width
const getViewportWidth = () => {
  if (typeof window === 'undefined') return 0;
  return Math.min(
    window.innerWidth,
    window.screen.width,
    document.documentElement.clientWidth
  ) || window.innerWidth;
};

const checkIfMobile = () => {
  if (typeof window === 'undefined') return;
  
  // Get the most reliable width value
  const width = getViewportWidth();
  
  windowWidth.value = width;
  
  // Check viewport settings and device type
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isSmallScreen = width <= 768;
  
  // Consider it mobile if any of these are true
  const mobile = isSmallScreen || isMobileUserAgent || isTouchDevice;
  
  // Debug information
  if (import.meta.env.DEV) {
    const viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
  
  }
  
  isMobile.value = mobile;
};

// Initial check on component mount
onMounted(() => {
  // Force a small delay to ensure viewport is properly calculated
  const checkWithDelay = () => {
    checkIfMobile();
    // Check again after a short delay to catch any viewport changes
    setTimeout(checkIfMobile, 50);
    setTimeout(checkIfMobile, 200);
  };
  
  // Initial check
  checkWithDelay();
  
  // Add event listeners
  window.addEventListener('resize', checkWithDelay);
  window.addEventListener('orientationchange', checkWithDelay);
  
  // Check again when the page is fully loaded
  if (document.readyState === 'complete') {
    checkWithDelay();
  } else {
    window.addEventListener('load', checkWithDelay);
  }
  
  // Fetch home page data
  fetchHomePageDynamic();
});

// Clean up event listeners
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', checkIfMobile);
    window.removeEventListener('orientationchange', checkIfMobile);
    window.removeEventListener('load', checkIfMobile);
  }
});
</script>

<template>
  <div class="flex flex-col py-11 dark:bg-customBlack main-div">
    <SliderComponent :banners="homeBanners" />
    <CategoriesComponent/>
   
    
    <!-- Static Popular Products Section -->
   
    
    <JoinUsComponent
      v-if="joinUsData"
      :title-top="joinUsData.titleTop"
      :title-bottom="joinUsData.titleBottom"
      :descriptions="joinUsData.descriptions"
      :button-label="joinUsData.buttonLabel"
      :image-main="joinUsData.imageMain"
      :helmet-image="joinUsData.helmetImage"
      :snowboard-image="joinUsData.snowboardImage"
    />
    <div v-if="products && products.length > 0" class="container mx-auto px-4 mt-8">
     
      <!-- Mobile View -->
      <div v-if="isMobile" class="mobile-view">
        <PopularProductsSlider :products="products" />
      </div>
      
      <!-- Desktop View -->
      <div v-else class="desktop-view">
        <PopularProductsSlider
          :products="products"
        />
      </div>
    </div>
    <!-- Dynamic Products Section -->
    <!-- <ProductList
        v-if="products && products.length > 0"
        :products="products"
        :title="$t('featuredProducts')"
        class="w-full"
        route-to-name="products"
    /> -->
    <RentalStepsComponent
      v-if="rentalData"
      :title-line1="rentalData.titleLine1"
      :title-line2="rentalData.titleLine2"
      :description="rentalData.description"
      :steps="rentalData.steps"
      :image-main="rentalData.imageMain"
    />
    <BlogList :blog-posts="blogPosts" />
    <FAQComponent/>
  </div>
</template>
