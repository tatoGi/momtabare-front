<script lang="ts" setup>
import BaseBreadcrumbs from "@/components/base/BaseBreadcrumbs.vue"
import BaseSlider from "@/components/base/BaseSlider.vue"
import ProductCommentSection from "@/components/products/ProductCommentSection.vue"
import ProductDetailsComponent from "@/components/products/ProductDetailsComponent.vue"
import ProductImagesComponent from "@/components/products/ProductImagesComponent.vue"
import ProductItem from "@/components/products/ProductItem.vue"
import ProductStatsComponent from "@/components/products/ProductStatsComponent.vue"
// import {IComment} from "@/ts/models/comment.types.ts" // Temporarily disabled to fix import issues
import type {IProduct, IProductListItem} from "@/ts/models/product.types.ts"
import type {IGetProductByIdResponse, IGetProductsResponse} from "@/ts/services/products.types.ts"
import {windowScrollToTop} from "@/utils/helpers/scroll.ts"
import {getCommentsByProduct} from "@/services/comments.ts"
import {getProductBySku, getProducts} from "@/services/products.ts"
import Skeleton from "../../components/ui/skeleton/Skeleton.vue"
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from "vue-router"
import { getAssetUrl } from "@/utils/config/env"
const route = useRoute()

const response = ref<IGetProductByIdResponse | null>()
const recommendedProducts = ref<IProductListItem[] | undefined>()

const product = ref<IProduct | null>(null)
const comments = ref<any[] | null>(null)

const productLoaded = ref<boolean>(false)
const commentsLoaded = ref<boolean>(false)

const recommendedProductLoaded = ref<boolean>(false)
const ownerProductCount = ref<number>(0)

const computedProductSku = computed<string | null>(() => {
  return (route.params.productSku as string) || null
})

async function fetchProductData(): Promise<void> {
  if (!computedProductSku.value) return
  
  try {
    productLoaded.value = false
    recommendedProductLoaded.value = false
    
    response.value = await getProductBySku({sku: computedProductSku.value})

    if (!response.value) return
    product.value = response.value.product
    setTimeout(() => (productLoaded.value = true), 200)
    await fetchRecommendedProducts()
    await fetchComments()
    await fetchOwnerProductCount()
  } catch (error) {
    console.error("Error fetching the product:", error)
  }
}

async function fetchRecommendedProducts(): Promise<void> {
  const response = (await getProducts()) as IGetProductsResponse
  recommendedProducts.value = response?.products

  recommendedProductLoaded.value = true
}

async function fetchComments() {
  const tempProduct: IProduct | null = product.value

  if (!tempProduct || !tempProduct?.id) return

  const response = await getCommentsByProduct({ id: tempProduct.id })

  if (!response) return

  comments.value = response.data
  commentsLoaded.value = true
}

async function fetchOwnerProductCount() {
  if (!product.value?.product_owner) return 
  
  try {
    // Use the products_count directly from the product_owner data (backend uses products_count)
    ownerProductCount.value = product.value.product_owner.products_count || product.value.product_owner.products_amount || 0
   
  } catch (error) {
    console.error('Error setting owner product count:', error)
    ownerProductCount.value = 0
  }
}


onMounted(fetchProductData)

watch(
    () => route.params.productSku,
    () => {
      windowScrollToTop()
      fetchProductData()
    },
)
</script>

<template>
  <div class="py-5">
    <transition name="fade">
      <div v-if="productLoaded" class="flex flex-col items-start gap-5">
        <BaseBreadcrumbs
            v-if="product"
            :disable-route="true"
            :path="[product?.name]"
            prepend-path="products"
        />

        <div class="grid grid-cols-3 gap-2">
          <ProductImagesComponent :product="product"/>
          <ProductDetailsComponent :product="product"/>
          <ProductStatsComponent :product="product"/>
        </div>
        
        <ProductCommentSection
            v-if="commentsLoaded"
            :comments="comments"
            :product="product"
            @refresh-comments="fetchComments"
        />

        <div v-if="!commentsLoaded" class="w-full space-y-5">
          <Skeleton class="h-24"/>
          <Skeleton class="h-24"/>
          <Skeleton class="h-24"/>
        </div>

        <BaseSlider title="სხვა პროდუქტები">
          <div
              v-for="(product, index) in recommendedProducts"
              :key="index"
              class="w-1/4 flex-shrink-0"
              style="scroll-snap-align: start"
          >
            <ProductItem :item="product"/>
          </div>
        </BaseSlider>
      </div>
      <div v-else class="space-y-5 mb-[800px]">
        <div class="grid grid-cols-3 gap-5 pt-12">
          <Skeleton v-for="i in 3" :key="i" class="h-96 rounded-2xl"/>
        </div>
        <Skeleton class="h-52 w-full rounded-2xl"/>
      </div>
    </transition>
  </div>

</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
