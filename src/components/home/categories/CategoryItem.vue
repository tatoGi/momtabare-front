<script lang="ts" setup>
import type { ICategory } from "@/types/category"
import type { ICategoryDisplay } from "@/ts/models/category.types"
import { computed } from 'vue'
import { useAppStore } from '@/pinia/app.pinia'
import type { ELanguages } from '@/ts/pinia/app.types'
import { useRouter } from 'vue-router'

const props = defineProps<{
  category: ICategory | ICategoryDisplay
}>()

const appStore = useAppStore()
const router = useRouter()

const computedLanguage = computed<ELanguages>(() => appStore.getLanguage)

const computedImage = computed<string | null>(() => {
  if (!props?.category) return null
  // Handle both ICategory and ICategoryDisplay interfaces
  return (props.category as any).image || null
})

const computedCategoryName = computed<string>(() => {
  if (!props?.category) return ''
  
  // Handle ICategoryDisplay interface (has title property)
  if ('title' in props.category) {
    return (props.category as ICategoryDisplay).title
  }
  
  // Handle ICategory interface (has name property with locales)
  if ('name' in props.category && computedLanguage.value) {
    return (props.category as ICategory).name[computedLanguage.value]
  }
  
  return ''
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
      :alt="computedCategoryName"
      :src="computedImage"
      class="duration-250 w-full"
    />
    <h4
      class="font-uppercase absolute bottom-3 left-3 z-10 text-sm font-extrabold text-white"
      :data-count="(category as any).product_count || '70' + ' პროდუქტი'"
    >
      {{ computedCategoryName }}
    </h4>
  </div>
</template>
