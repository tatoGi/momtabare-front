<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue"
import BaseIcon from "@/components/base/BaseIcon.vue"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { ICategoryDisplay } from "@/ts/models/category.types"
import { useAppStore } from "@/pinia/app.pinia"
import { useCategoryStore } from "@/pinia/category.pinia"
import { computed, ref, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import { getCategoriesForLocale } from "@/services/categories"
import { ELanguages } from "@/ts/pinia/app.types"

const router = useRouter()
const appStore = useAppStore()
const categoryStore = useCategoryStore()

const isDropdownOpen = ref<boolean>(false)
const categories = ref<ICategoryDisplay[]>([])
const hoveredCategory = ref<ICategoryDisplay | null>(null)
const hoveredSubcategory = ref<ICategoryDisplay | null>(null)
const computedLanguage = computed(() => appStore.getLanguage)



// Function to fetch categories
async function fetchCategories() {
  const currentLocale = appStore.language === ELanguages.KA ? 'ka' : 'en'
  try {
    const backendCategories = await getCategoriesForLocale(currentLocale)
    if (backendCategories.length > 0) {
      categories.value = backendCategories
     
    } else {
      // Fallback to store or local data if backend fails
      if (categoryStore.getCategories?.length) {
        categories.value = categoryStore.getCategories
      }
    }
  } catch (error) {
    // Fallback to store or local data
    if (categoryStore.getCategories?.length) {
      categories.value = categoryStore.getCategories
    }
  }
}

onMounted(async () => {
  await fetchCategories()
})

// Watch for language changes and re-fetch categories
watch(
  () => appStore.language,
  async () => {
    await fetchCategories()
  }
)

function moveToCategory(category: ICategoryDisplay): void {
  if (category.children?.length) return // Don't navigate if category has children
  router.push(`/products?category=${category.slug}`)
  isDropdownOpen.value = false
}

function closeDropdown(): void {
  isDropdownOpen.value = false
  setTimeout(() => {
    hoveredCategory.value = null
    hoveredSubcategory.value = null
  }, 200)
}

</script>

<template>
  <DropdownMenu v-model:open="isDropdownOpen">
    <DropdownMenuTrigger as-child>
      <BaseButton
        :height="48"
        :width="184"
        class="bg-customBlack dark:bg-customDarkGrey"
        @click="isDropdownOpen = true"
      >
        <BaseIcon
          :name="isDropdownOpen ? 'close' : 'menu'"
          :size="24"
          class="text-white"
          rounded
        />
        <p class="font-uppercase text-sm font-bold text-white">
          {{ $t("categories") }}
        </p>
      </BaseButton>
    </DropdownMenuTrigger>

    <DropdownMenuContent
      align="start"
      class="rounded-2xl bg-white shadow-xl dark:bg-customBlack p-0 overflow-hidden"
      :class="{ 'w-[800px]': hoveredCategory }"
    >
      <div class="flex" @mouseleave="hoveredCategory = null; hoveredSubcategory = null">
        <!-- Categories Column -->
        <div class="w-64 h-[315px] overflow-y-auto custom-scrollbar">
          <h2 class="p-4 sticky top-0 bg-white dark:bg-gray-900 z-10 dark:text-white cateogries-title"
             >
            {{ $t("categories") }}
          </h2>
          <div class="py-2">
            <div 
              v-for="category in categories" 
              :key="category.id"
              class="flex items-center px-4 py-3 cursor-pointer transition-colors"
              :class="{
                'bg-orange-50 dark:bg-gray-800 text-orange-500': hoveredCategory?.id === category.id,
                'hover:bg-gray-50 dark:hover:bg-gray-800': hoveredCategory?.id !== category.id
              }"
              @mouseenter="hoveredCategory = category; hoveredSubcategory = null"
              @click="moveToCategory(category)"
            >
              <span class="font-medium">{{ category.title }}</span>
             
            </div>
          </div>
        </div>

        <!-- Subcategories Column -->
        <div 
          v-if="hoveredCategory?.children?.length" 
          class="w-64 h-[315px] overflow-y-auto custom-scrollbar"
        >
          <h2 class="font-bold text-lg p-4 sticky top-0 bg-white dark:bg-gray-900 z-10 dark:text-white cateogries-title">
            {{ hoveredCategory?.title }}
          </h2>
          <div class="py-2">
            <div 
              v-for="subcategory in hoveredCategory.children" 
              :key="subcategory.id"
              class="flex items-center px-4 py-3 cursor-pointer transition-colors"
              :class="{
                'bg-orange-50 dark:bg-gray-800 text-orange-500': hoveredSubcategory?.id === subcategory.id,
                'hover:bg-gray-50 dark:hover:bg-gray-800': hoveredSubcategory?.id !== subcategory.id
              }"
              @mouseenter="hoveredSubcategory = subcategory"
              @click="moveToCategory(subcategory)"
            >
              <span class="font-medium">{{ subcategory.title }}</span>
            </div>
          </div>
        </div>

        <!-- Products Column -->
        <div 
          v-if="hoveredSubcategory?.children?.length" 
          class="w-64 h-[315px] overflow-y-auto custom-scrollbar"
        >
          <h2 class="font-bold text-lg p-4 sticky top-0 bg-white dark:bg-gray-900 z-10 cateogries-title">
            {{ hoveredSubcategory?.title }}
          </h2>
          <div class="py-2">
            <div 
              v-for="product in hoveredSubcategory.children" 
              :key="product.id"
              class="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              @click="moveToCategory(product)"
            >
              <div class="font-medium">{{ product.title }}</div>
            </div>
          </div>
        </div>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<style scoped>
/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.dark ::-webkit-scrollbar-track {
  background: #2d3748;
}

.dark ::-webkit-scrollbar-thumb {
  background: #4a5568;
}
</style>


