<script lang="ts" setup>
import BaseIcon from "@/components/base/BaseIcon.vue"
import { IProduct } from "@/ts/models/product.types.ts"
import { useAppStore } from "@/pinia/app.pinia.ts"
import { computed, ref, watch } from "vue"
import { toggleFavoriteProduct } from "../../services/products";
import { useUserStore } from "../../pinia/user.pinia";

const props = defineProps<{
  product: IProduct | null
}>()

const userStore = useUserStore()
const appStore = useAppStore()
const computedLanguage = computed(() => appStore.getLanguage)

// Reactive reference for favorite status
const heart = ref(false)

// Watch for product changes and update heart status
watch(() => props.product?.is_favorite, (newFavoriteStatus: boolean | undefined) => {
  if (newFavoriteStatus !== undefined) {
    heart.value = newFavoriteStatus
  }
}, { immediate: true })

async function favoriteProduct(): Promise<void> {
  if (!props.product) {
    console.warn('No product available to favorite')
    return;
  }
  
  const currentFavoriteStatus = heart.value
  
  try {
    const result = await toggleFavoriteProduct(props.product.id, currentFavoriteStatus)
    
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
  <div class="flex flex-col items-start gap-8 p-3">
    <div class="flex w-full items-center justify-between">
      <div class="flex items-center gap-3">
        <BaseIcon
          :size="24"
          class="text-customBlack/70 dark:text-white/70"
          name="visibility"
        />
        <h2 class="text-xs text-center font-medium dark:text-white pb-1">
          {{ props.product?.views }}
        </h2>
      </div>
      <div class="flex items-center gap-3">
        <BaseIcon
          :class="
            heart ? 'text-customRed' : 'text-customBlack/70 dark:text-white/70'
          "
          :fill="heart"
          :size="24"
          class="cursor-pointer transition-all dark:hover:text-customRed hover:text-customRed"
          name="favorite"
          rounded
          @click="favoriteProduct"
        />
        <BaseIcon
          :rounded="true"
          :size="24"
          class="cursor-pointer text-customBlack/70 dark:text-white/70 hover:text-customRed dark:hover:text-customRed"
          name="share"
        />
      </div>
    </div>

    <h2 class="text-lg font-bold dark:text-white">
      {{ props.product?.name }}
    </h2>

    <div class="flex w-full flex-col items-start gap-4">
      <h2 class="text-sm font-bold font-uppercase dark:text-white">დეტალები</h2>
      <div class="flex w-full items-center justify-between">
        <p class="text-sm text-customBlack/70 dark:text-white/70">
          პროდუქციის ID
        </p>
        <p class="text-sm font-semibold dark:text-white">
          {{ props.product?.sku }}
        </p>
      </div>
      <div class="flex w-full items-center justify-between">
        <p class="text-sm text-customBlack/70 dark:text-white/70">ლოკაცია</p>
        <p class="text-sm font-semibold dark:text-white">
          {{ props.product?.location }}
        </p>
      </div>
      <div class="flex w-full items-center justify-between">
        <p class="text-sm text-customBlack/70 dark:text-white/70">კატეგორია</p>
        <p class="text-sm font-semibold dark:text-white">
          {{ props.product?.categories[0].name[computedLanguage] }}
        </p>
      </div>
    </div>

    <div class="flex w-full flex-col items-start gap-4">
      <h2 class="text-sm font-bold font-uppercase dark:text-white">
        მახასიათებლები
      </h2>
      <div class="flex w-full items-center justify-between">
        <p class="text-sm text-customBlack/70 dark:text-white/70">
          გამქირავებელი
        </p>
        <p class="text-sm font-semibold dark:text-white">
          {{ props.product?.product_owner.first_name }}
        </p>
      </div>
      <div class="flex w-full items-center justify-between">
        <p class="text-sm text-customBlack/70 dark:text-white/70">ზომა</p>
        <p class="text-sm font-semibold dark:text-white">
          {{ props.product?.size }}
        </p>
      </div>
    </div>
  </div>
</template>
