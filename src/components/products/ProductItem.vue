<script lang="ts" setup>
import BaseIcon from "@/components/base/BaseIcon.vue"
import CommentsStatusComponent from "@/components/products/product-stats/CommentsStatusComponent.vue"
import LocationStatusComponent from "@/components/products/product-stats/LocationStatusComponent.vue"
import RatingStatusComponent from "@/components/products/product-stats/RatingStatusComponent.vue"
import ViewsStatusComponent from "@/components/products/product-stats/ViewsStatusComponent.vue"
import type { IProductListItem } from "../../ts/models/product.types"
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { toggleFavoriteProduct } from "../../services/products"
import { getAssetUrl } from "@/utils/config/env"
import { useToast } from "@/components/ui/toast/use-toast"

const props = defineProps<{
  item: IProductListItem
  routeToPath?: string
  forceVertical?: boolean // Force vertical layout even on mobile (for carousels)
}>()
const heart = ref<boolean>(props.item.is_favorite)
const { addToast } = useToast()
const computedImageUrl = computed<string>(() => {
  // Safely access images array with null checks
  let imageUrl = props.item.images?.[0]?.url || ''

  // If no image URL, return a default placeholder
  if (!imageUrl) {
    return '/images/placeholder-product.jpg'
  }

  // Always use getAssetUrl to ensure proper URL construction and cleaning
  // It will handle all cases: full URLs, relative paths, and asset paths
  return getAssetUrl(imageUrl)
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
      
      // Show success toast
      if (result.is_favorite) {
        addToast({
          title: 'დამატებულია ფავორიტებში',
          description: 'პროდუქტი წარმატებით დაემატა თქვენს ფავორიტებს',
          variant: 'success',
          duration: 3000
        })
      } else {
        addToast({
          title: 'წაშლილია ფავორიტებიდან',
          description: 'პროდუქტი წაშლილია თქვენი ფავორიტებიდან',
          variant: 'info',
          duration: 3000
        })
      }
    } else {
      console.warn('Failed to toggle favorite:', result.message)
    }
  } catch (error) {
    console.error('💥 Error toggling favorite:', error)
  }
}
</script>

<template>
  <!-- Mobile: Horizontal Layout (Photo Left, Info Right) - Only show if NOT forceVertical -->
  <div v-if="!props.forceVertical"
    class="sm:hidden flex flex-row gap-3 border rounded-2xl border-transparent hover:cursor-pointer hover:border-customBlack/10 dark:hover:border-white/10 product-item p-2"
    @click.left="navigateToProduct">
    <!-- Left: Product Image (108x72px with 12px border-radius) -->
    <div class="relative flex w-[108px] h-[72px] flex-shrink-0 items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden">
      <BaseIcon 
        :class="{ 'text-customRed': heart }" 
        :fill="heart" 
        :size="16"
        class="absolute left-1.5 top-1.5 z-10 cursor-pointer transition-all hover:text-customRed dark-white-text-hover"
        name="favorite" 
        rounded 
        @click.left.stop="favoriteProduct" 
      />
      <img :src="computedImageUrl" alt="Product Image" class="h-full w-full object-cover product-img" />
    </div>

    <!-- Right: Product Info -->
    <div class="flex flex-col flex-1 min-w-0 gap-2 h-[74px]">
      <!-- Top Section: Price and Rating -->
      <div class="flex items-start justify-between gap-2">
        <!-- Price (Left) -->
        <div class="flex items-baseline gap-1">
          <p class="text-base font-extrabold text-customRed whitespace-nowrap">
            {{ props.item.price }} ₾
          </p>
          <p class="text-[10px] font-medium text-customBlack/70 dark:text-white/70">
            / {{ $t('daily') }}
          </p>
        </div>

        <!-- Rating (Right Top) -->
        <div class="flex-shrink-0">
          <RatingStatusComponent :rating="props.item.rating" :ratings-amount="props.item.ratings_amount"
            :mobile-mode="true" />
        </div>
      </div>

      <!-- Middle: Title -->
      <p class="line-clamp-2 text-sm font-medium dark:text-white leading-snug overflow-hidden">
        {{ props.item.name }}
      </p>

      <!-- Bottom: Date and Location -->
      <div class="flex items-center justify-between gap-2 mt-auto">
        <div class="flex items-center gap-2">
          <p v-if="formattedRentalPeriod"
            class="text-[10px] font-medium text-customBlack/70 dark:text-white/70 whitespace-nowrap">
            {{ formattedRentalPeriod }}
          </p>
          <ViewsStatusComponent :views="props.item.views || 0" :mobile-mode="true" />
        </div>
        <LocationStatusComponent :location="props.item.location" class="ml-auto" />
      </div>
    </div>
  </div>

  <!-- Desktop/Tablet: Vertical Layout (Original) - Also show on mobile if forceVertical is true -->
  <div :class="[
    props.forceVertical ? 'flex w-[255px] h-[400px]' : 'hidden sm:flex',
    props.forceVertical ? 'border-customBlack/10 dark:border-white/10 pt-3 px-6 pb-6' : 'border-transparent hover:border-customBlack/10 dark:hover:border-white/10 pt-4 px-0 pb-0'
  ]" class="flex-col border rounded-2xl hover:cursor-pointer product-item" @click.left="navigateToProduct">
    <div :class="props.forceVertical ? 'h-[220px]' : 'h-52'" class="relative flex justify-center product-img-container">
      <BaseIcon :class="{ 'text-customRed': heart }" :fill="heart" :size="24"
        class="absolute left-2 top-2 z-10 cursor-pointer transition-all hover:text-customRed dark-white-text-hover"
        name="favorite" rounded @click.left.stop="favoriteProduct" />
      <img :src="computedImageUrl" alt="Product Image" class="h-full w-full object-contain product-img" />
    </div>
    <div :class="props.forceVertical ? 'pt-4 px-0' : 'p-4'" class="flex flex-col">
      <div class="flex flex-col gap-1.5">
        <LocationStatusComponent :location="props.item.location" />
        <p class="truncate text-sm font-semibold dark:text-white">
          {{ props.item.name }}
        </p>
        <div class="flex items-center gap-3">
          <CommentsStatusComponent :comments_amount="props.item.comments_amount || 0" />
          <ViewsStatusComponent :views="props.item.views || 0" />
        </div>
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
