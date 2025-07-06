<script lang="ts" setup>
import BaseIcon from "@/components/base/BaseIcon.vue"
import { ICategory } from "@/ts/models/category.types.ts"
import { computed } from "vue"
import { useAppStore } from "@/pinia/app.pinia.ts"
import { ELanguages } from "@/ts/pinia/app.types.ts"
import { useRouter } from "vue-router"

const props = defineProps<{
  category: ICategory
}>()

const appStore = useAppStore()
const router = useRouter()

const backendUrl = import.meta.env.VITE_BACKEND_URL
const computedLanguage = computed<ELanguages>(() => appStore.getLanguage)

const computedImage = computed<string | null>(() => {
  if (!props?.category) return null
  return `${backendUrl}/${props.category.image}`
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
    class="group relative cursor-pointer overflow-hidden rounded-lg transition-all ease-in-out hover:scale-105"
    @click="routeToCategory"
  >
    <div
      class="flex-center frosted-glass absolute left-4 top-4 z-10 h-12 w-12 overflow-hidden rounded-full bg-white/10 transition-all ease-in-out group-hover:opacity-0"
    >
      <BaseIcon
        :name="category.icon"
        :rounded="true"
        :size="20"
        class="text-white"
      />
    </div>
    <img
      v-if="computedImage"
      :alt="category.name"
      :src="computedImage"
      class="duration-250 w-full transition-all ease-in-out group-hover:scale-110"
    />
    <h4
      class="font-uppercase absolute bottom-3 left-3 z-10 text-sm font-extrabold text-white"
    >
      {{ computedCategoryName }}
    </h4>
  </div>
</template>
