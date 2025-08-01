<script lang="ts" setup>
import FAQComponent from "@/components/faq/FAQComponent.vue"
import JoinUsComponent from "@/components/home/JoinUsComponent.vue"
import RentalStepsComponent from "@/components/home/RentalStepsComponent.vue"
import CategoriesComponent from "@/components/home/categories/CategoriesComponent.vue"
import SliderComponent from "@/components/home/slider/SliderComponent.vue"
import PopularProductsSlider from "@/components/home/PopularProductsSlider.vue"
import ProductList from "@/components/products/ProductList.vue"
import {IProductListItem} from "@/ts/models/product.types.js"
import {IGetProductsResponse} from "@/ts/services/products.types.ts"
import {getProducts} from "@/services/products.js"
import { onMounted, onUnmounted, ref } from "vue"
import itemPlaceholder from "@/assets/img/itemplaceholder.png"
import BlogList from "@/components/blog/BlogList.vue"

// Static popular products data
const popularProducts = ref<IProductListItem[]>([
  {
    id: 1,
    sku: 'stroller-001',
    name: 'Premium Baby Stroller',
    price: 29.99,
    images: [
      {
        id: 1,
        url: itemPlaceholder,
        is_primary: true
      }
    ],
    rating: 4.8,
    reviews_count: 124,
    is_favorited: false,
    is_popular: true,
    product_owner: {
      id: 1,
      name: 'Momtabare',
      avatar: 'https://via.placeholder.com/50'
    },
    location: 'New York, NY'
  },
  {
    id: 2,
    sku: 'carseat-001',
    name: 'Convertible Car Seat',
    price: 24.99,
    images: [
      {
        id: 1,
        url: itemPlaceholder,
        is_primary: true
      }
    ],
    rating: 4.9,
    reviews_count: 98,
    is_favorited: false,
    is_popular: true,
    product_owner: {
      id: 1,
      name: 'Momtabare',
      avatar: 'https://via.placeholder.com/50'
    },
    location: 'Los Angeles, CA'
  },
  {
    id: 3,
    sku: 'highchair-001',
    name: 'Baby High Chair',
    price: 19.99,
    images: [
      {
        id: 1,
        url: itemPlaceholder,
        is_primary: true
      }
    ],
    rating: 4.7,
    reviews_count: 87,
    is_favorited: false,
    is_popular: true,
    product_owner: {
      id: 1,
      name: 'Momtabare',
      avatar: 'https://via.placeholder.com/50'
    },
    location: 'Chicago, IL'
  },
  {
    id: 4,
    sku: 'swing-001',
    name: 'Baby Swing',
    price: 22.99,
    images: [
      {
        id: 1,
        url: itemPlaceholder,
        is_primary: true
      }
    ],
    rating: 4.6,
    reviews_count: 112,
    is_favorited: false,
    is_popular: true,
    product_owner: {
      id: 1,
      name: 'Momtabare',
      avatar: 'https://via.placeholder.com/50'
    },
    location: 'Houston, TX'
  },
  {
    id: 5,
    sku: 'stroller-001',
    name: 'Premium Baby Stroller',
    price: 29.99,
    images: [
      {
        id: 1,
        url: itemPlaceholder,
        is_primary: true
      }
    ],
    rating: 4.8,
    reviews_count: 124,
    is_favorited: false,
    is_popular: true,
    product_owner: {
      id: 1,
      name: 'Momtabare',
      avatar: 'https://via.placeholder.com/50'
    },
    location: 'New York, NY'
  },
  {
    id: 6,
    sku: 'carseat-001',
    name: 'Convertible Car Seat',
    price: 24.99,
    images: [
      {
        id: 1,
        url: itemPlaceholder,
        is_primary: true
      }
    ],
    rating: 4.8,
    reviews_count: 124,
    is_favorited: false,  
    is_popular: true,
    product_owner: {
      id: 1,
      name: 'Momtabare',
      avatar: 'https://via.placeholder.com/50'
    },
    location: 'New York, NY'
  },
  {
    id: 7,
    sku: 'carseat-001',
    name: 'Convertible Car Seat',
    price: 24.99,
    images: [
      {
        id: 1,
        url: itemPlaceholder,
        is_primary: true
      }
    ],
    rating: 4.9,
    reviews_count: 98,
    is_favorited: false,
    is_popular: true,
    product_owner: {
      id: 1,
      name: 'Momtabare',
      avatar: 'https://via.placeholder.com/50'
    },
    location: 'Los Angeles, CA'
  },
  {
    id: 8,
    sku: 'highchair-001',
    name: 'Baby High Chair',
    price: 19.99,
    images: [
      {
        id: 1,
        url: itemPlaceholder,
        is_primary: true
      }
    ],
    rating: 4.7,
    reviews_count: 87,
    is_favorited: false,
    is_popular: true,
    product_owner: {
      id: 1,
      name: 'Momtabare',
      avatar: 'https://via.placeholder.com/50'
    },
    location: 'Chicago, IL'
  },

])

const products = ref<IProductListItem[] | null>(null)

onMounted(async () => {
  const allProducts: IGetProductsResponse | null = await getProducts()
  products.value = allProducts?.products.slice(0, 8) ?? []
})

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
    <SliderComponent/>
    <CategoriesComponent/>
   
    
    <!-- Static Popular Products Section -->
   
    
    <JoinUsComponent/>
    <div class="container mx-auto px-4 mt-8">
     
      <!-- Mobile View -->
      <div v-if="isMobile" class="mobile-view">
        <PopularProductsSlider :products="popularProducts" />
      </div>
      
      <!-- Desktop View -->
      <div v-else class="desktop-view">
        <ProductList
          :products="popularProducts"
          :title="$t('popularProducts')"
          class="w-full"
          route-to-name="products"
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
    <RentalStepsComponent/>
    <BlogList />
    <FAQComponent/>
  </div>
</template>
