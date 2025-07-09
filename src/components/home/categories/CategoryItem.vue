<script lang="ts" setup>
import type { ICategory } from '@/ts/models/category.types'
import { computed } from 'vue'
import { useAppStore } from '@/pinia/app.pinia'
import type { ELanguages } from '@/ts/pinia/app.types'
import { useRouter } from 'vue-router'

const props = defineProps<{
  category: ICategory
}>()

const appStore = useAppStore()
const router = useRouter()

const computedLanguage = computed<ELanguages>(() => appStore.getLanguage)

const computedImage = computed<string | null>(() => {
  if (!props?.category) return null
  return props.category.image
})
const computedCategoryName = computed<string>(() => {
  if (!props?.category && computedLanguage.value) return null
  return props.category.name[computedLanguage.value]
})

function routeToCategory() {
  if (!props?.category) return null
  router.push(`/products?category=${props.category.slug}`)
}
</script>

<template>
  <div
    class="group relative cursor-pointer overflow-hidden rounded-lg "
    @click="routeToCategory"
  >
   
    <img
      v-if="computedImage"
      :alt="category.name"
      :src="computedImage"
      class="duration-250 w-full"
    />
    <h4
      class="font-uppercase absolute bottom-3 left-3 z-10 text-sm font-extrabold text-white"
      :data-count="category.product_count || '70' + ' პროდუქტი'"
    >
      {{ computedCategoryName }}
    </h4>
  </div>
</template>
