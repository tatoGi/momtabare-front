<script lang="ts" setup>
import FAQComponent from "@/components/faq/FAQComponent.vue"
import JoinUsComponent from "@/components/home/JoinUsComponent.vue"
import RentalStepsComponent from "@/components/home/RentalStepsComponent.vue"
import CategoriesComponent from "@/components/home/categories/CategoriesComponent.vue"
import SliderComponent from "@/components/home/slider/SliderComponent.vue"
import ProductList from "@/components/products/ProductList.vue"
import {IProductListItem} from "@/ts/models/product.types.js"
import {IGetProductsResponse} from "@/ts/services/products.types.ts"
import {getProducts} from "@/services/products.js"
import {onMounted, ref} from "vue"
import itemPlaceholder from "@/assets/img/itemplaceholder.png"

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
</script>

<template>
  <div class="flex flex-col py-11 dark:bg-customBlack" style="gap: 120px;">
    <SliderComponent/>
    <CategoriesComponent/>
    
    <!-- Static Popular Products Section -->
   
    
    <JoinUsComponent/>
    <ProductList
        :products="popularProducts"
        :title="$t('popularProducts')"
        class="w-full"
        route-to-name="products"
    />
    <!-- Dynamic Products Section -->
    <!-- <ProductList
        v-if="products && products.length > 0"
        :products="products"
        :title="$t('featuredProducts')"
        class="w-full"
        route-to-name="products"
    /> -->
    <RentalStepsComponent/>
    <!--    <BlogList />-->
    <FAQComponent/>
  </div>
</template>
