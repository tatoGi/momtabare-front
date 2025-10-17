<script lang="ts" setup>
import BaseIcon from "@/components/base/BaseIcon.vue"
import CommentsStatusComponent from "@/components/products/product-stats/CommentsStatusComponent.vue"
import LocationStatusComponent from "@/components/products/product-stats/LocationStatusComponent.vue"
import RatingStatusComponent from "@/components/products/product-stats/RatingStatusComponent.vue"
import type { IProductListItem } from "../../ts/models/product.types"
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { toggleFavoriteProduct } from "../../services/products"
import { useUserStore } from "../../pinia/user.pinia"

const props = defineProps<{
  item: IProductListItem
  routeToPath?: string
}>()
const userStore = useUserStore()
const heart = ref<boolean>(props.item.is_favorite)
const computedImageUrl = computed<string>(() => {
  // Safely access images array with null checks
  let imageUrl = props.item.images?.[0]?.url || props.item.image || ''
 
  // If no image URL, return a default placeholder
  if (!imageUrl) {
    return '/images/placeholder-product.jpg'
  }
  
  // If the URL already starts with http or /, use it as is
  if (imageUrl.startsWith('http') || imageUrl.startsWith('/')) {
    return imageUrl
  }
  
  // Otherwise, prepend the backend URL
  return `https://admin.momtabare.com/${imageUrl}`
})
const router = useRouter()

// Format rental period dates
const formattedRentalPeriod = computed<string>(() => {
  // If rental_period string is available, use it
  if (props.item.rental_period) {
    return props.item.rental_period
  }
  
  // Otherwise, format from start and end dates
  if (props.item.rental_start_date && props.item.rental_end_date) {
    try {
      const startDate = new Date(props.item.rental_start_date)
      const endDate = new Date(props.item.rental_end_date)
      
      // Format dates as "DD MMM - DD MMM" (e.g., "15 Oct - 20 Oct")
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
      const startFormatted = startDate.toLocaleDateString('ka-GE', options)
      const endFormatted = endDate.toLocaleDateString('ka-GE', options)
      
      return `${startFormatted} - ${endFormatted}`
    } catch (error) {
      console.error('❌ Error formatting rental dates:', error)
      return ''
    }
  }
  
  return ''
})

function navigateToProduct() {
  // Use slug if available, otherwise fallback to SKU or ID
  const identifier = props.item.slug || props.item.sku || props.item.id
  
  // Only navigate if we have a valid identifier
  if (identifier) {
    router.push({ path: `/product/${identifier}` })
  } else {
    console.warn('Product navigation failed: no valid identifier found', props.item)
  }
}

async function favoriteProduct(): Promise<void> {
  const currentFavoriteStatus = heart.value
  
  try {
    const result = await toggleFavoriteProduct(props.item.id, currentFavoriteStatus)
    
    if (result.success) {
      heart.value = result.is_favorite || false
    } else {
      console.warn('Failed to toggle favorite:', result.message)
    }
  } catch (error) {
    console.error('💥 Error toggling favorite:', error)
  }
}
</script>

<template>
  <div
    class="flex flex-col border rounded-2xl border-transparent hover:cursor-pointer hover:border-customBlack/10 dark:hover:border-white/10 product-item"
    @click.left="navigateToProduct">
    <div class="relative flex h-52 justify-center pt-4 product-img-container">
      <BaseIcon ref="favoriteButtonRef" :class="{ 'text-customRed': heart }" :fill="heart" :size="24"
        class="absolute left-6 top-6 z-10 cursor-pointer transition-all hover:text-customRed dark-white-text-hover"
        name="favorite" rounded @click.left.stop="favoriteProduct" />
      <img :src="computedImageUrl" alt="Product Image" class="h-full w-52 object-contain product-img" />
    </div>
    <div class="flex flex-col p-4">
      <div class="flex flex-col gap-1.5">
        <LocationStatusComponent :location="props.item.location" />
        <p class="truncate text-sm font-semibold dark:text-white">
          {{ props.item.name }}
        </p>
        <CommentsStatusComponent :comments_amount="props.item.comments_amount || 0" />
      </div>

      <div class="flex flex-col gap-1.5 pt-3">
        <RatingStatusComponent :rating="props.item.rating" :ratings-amount="props.item.ratings_amount" />
        <p v-if="formattedRentalPeriod" class="text-xs font-medium text-customBlack/70 dark:text-white/70">
          {{ formattedRentalPeriod }}
        </p>
      </div>

      <div class="flex items-end gap-1 pt-3">
        <p class="text-lg font-extrabold text-customRed">
          {{ props.item.price }} ₾
        </p>
        <p class="pb-1 text-xs font-medium text-customBlack/70 dark:text-white/70">
          /
        </p>
        <p class="pb-1 text-xs font-medium text-customBlack/70 dark:text-white/70">
          {{ $t('daily') }}
        </p>
      </div>
    </div>
  </div>
</template>
