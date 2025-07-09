<script lang="ts" setup>
import BaseIcon from "@/components/base/BaseIcon.vue"
import CommentsStatusComponent from "@/components/products/product-stats/CommentsStatusComponent.vue"
import LocationStatusComponent from "@/components/products/product-stats/LocationStatusComponent.vue"
import RatingStatusComponent from "@/components/products/product-stats/RatingStatusComponent.vue"
import { IProductListItem } from "../../ts/models/product.types"
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { toggleFavoriteProduct } from "../../services/products"
import { useUserStore } from "../../pinia/user.pinia"

const props = defineProps<{
  item: IProductListItem
  routeToPath?: string
}>()


const userStore = useUserStore()
const heart = ref<boolean>(props.item.is_favorited)
console.log(props.item)
const computedImageUrl = computed<string>(() => {
  const imageUrl = props.item.images[0]?.url || ''
  // If the URL already starts with http or /, use it as is
  if (imageUrl.startsWith('http') || imageUrl.startsWith('/')) {
    return imageUrl
  }
  // Otherwise, prepend the backend URL
  return `${import.meta.env.VITE_BACKEND_URL}/${imageUrl}`
})
const router = useRouter()

function navigateToProduct() {
  router.push({ path: `/product/${props.item.sku}` })
}

async function favoriteProduct(): Promise<void> {
  if(!userStore.getUser){
    userStore.setAuthDialogState(true);
    return;
  }
  heart.value = !heart.value
  await toggleFavoriteProduct(props.item.id)
}
</script>

<template>
  <div
    class="flex flex-col border rounded-2xl border-transparent hover:cursor-pointer hover:border-customBlack/10 dark:hover:border-white/10"
    @click.left="navigateToProduct"
  >
    <div class="relative flex h-52 justify-center pt-4">
      <BaseIcon
        ref="favoriteButtonRef"
        :class="{ 'text-customRed': heart }"
        :fill="heart"
        :size="24"
        class="absolute left-6 top-6 z-10 cursor-pointer transition-all hover:text-customRed dark-white-text-hover"
        name="favorite"
        rounded
        @click.left.stop="favoriteProduct"
      />
      <img
        :src="computedImageUrl"
        alt="Product Image"
        class="h-full w-52 object-contain"
      />
    </div>
    <div class="flex flex-col p-4">
      <div class="flex flex-col gap-1.5">
        <LocationStatusComponent :location="props.item.location" />
        <p class="truncate text-sm font-semibold dark:text-white">
          {{ props.item.name }}
        </p>
        <CommentsStatusComponent
          :comments_amount="props.item.comments_amount || 0"
        />
      </div>

      <div class="flex flex-col gap-1.5 pt-3">
        <RatingStatusComponent
          :rating="props.item.rating"
          :ratings-amount="props.item.ratings_amount"
        />
        <p class="text-xs font-medium text-customBlack/70 dark:text-white/70">
          15 თებ - 24 თებ
        </p>
      </div>

      <div class="flex items-end gap-1 pt-3">
        <p class="text-lg font-extrabold text-customRed">
          {{ props.item.price }} ₾
        </p>
        <p
          class="pb-1 text-xs font-medium text-customBlack/70 dark:text-white/70"
        >
          /
        </p>
        <p
          class="pb-1 text-xs font-medium text-customBlack/70 dark:text-white/70"
        >
          {{$t('daily')}}
        </p>
      </div>
    </div>
  </div>
</template>
