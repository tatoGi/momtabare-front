<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue"
import BaseIcon from "@/components/base/BaseIcon.vue"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { ICategory, IProduct } from "@/ts/models/category.types"
import { useAppStore } from "@/pinia/app.pinia"
import { useCategoryStore } from "@/pinia/category.pinia"
import { computed, ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import categoriesData from "@/data/categories";

const router = useRouter()
const appStore = useAppStore()
const categoryStore = useCategoryStore()

const isDropdownOpen = ref<boolean>(false)
const categories = ref<ICategory[]>(categoriesData);
const hoveredCategory = ref<ICategory | null>(null);
const hoveredSubcategory = ref<ICategory | null>(null);
const computedLanguage = computed(() => appStore.getLanguage)

// Mock products for demonstration
const getMockProducts = (subcategoryId: number): IProduct[] => {
  const products: Record<number, IProduct[]> = {
    1001: [
      { id: 1, name: { en: 'Osprey Talon 22', ka: 'Osprey Talon 22' }, price: 120, slug: 'osprey-talon-22' },
      { id: 2, name: { en: 'Deuter Speed Lite 24', ka: 'Deuter Speed Lite 24' }, price: 110, slug: 'deuter-speed-lite-24' }
    ],
    1002: [
      { id: 3, name: { en: 'Osprey Atmos AG 65', ka: 'Osprey Atmos AG 65' }, price: 270, slug: 'osprey-atmos-ag-65' },
      { id: 4, name: { en: 'Gregory Baltoro 75', ka: 'Gregory Baltoro 75' }, price: 350, slug: 'gregory-baltoro-75' }
    ],
    5001: [
      { id: 5, name: { en: 'Rossignol Experience 80', ka: 'Rossignol Experience 80' }, price: 450, slug: 'rossignol-experience-80' },
      { id: 6, name: { en: 'Atomic Vantage 90', ka: 'Atomic Vantage 90' }, price: 600, slug: 'atomic-vantage-90' }
    ],
    5004: [
      { id: 7, name: { en: 'Burton Custom Flying V', ka: 'Burton Custom Flying V' }, price: 700, slug: 'burton-custom-flying-v' },
      { id: 8, name: { en: 'Lib Tech Orca', ka: 'Lib Tech Orca' }, price: 750, slug: 'lib-tech-orca' }
    ]
  }
  return products[subcategoryId] || []
}

onMounted(() => {
  // Use store categories if available, otherwise use the imported categoriesData
  if (categoryStore.getCategories?.length) {
    categories.value = categoryStore.getCategories;
  } else {
    // Fallback to local categories data if store is empty
    categories.value = categoriesData;
  }
})

function moveToCategory(category: ICategory): void {
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

const getProducts = (subcategoryId: number) => {
  return getMockProducts(subcategoryId)
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
        <div class="w-64 border-r border-gray-200 dark:border-gray-700 h-[500px] overflow-y-auto custom-scrollbar">
          <h2 class="font-bold text-lg p-4 sticky top-0 bg-white dark:bg-gray-900 z-10 border-b border-gray-200 dark:border-gray-700 dark:text-white">
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
              <span class="font-medium">{{ category.name[computedLanguage] }}</span>
             
            </div>
          </div>
        </div>

        <!-- Subcategories Column -->
        <div 
          v-if="hoveredCategory?.children?.length" 
          class="w-64 border-r border-gray-200 dark:border-gray-700 h-[500px] overflow-y-auto custom-scrollbar"
        >
          <h2 class="font-bold text-lg p-4 sticky top-0 bg-white dark:bg-gray-900 z-10 border-b border-gray-200 dark:border-gray-700 dark:text-white">
            {{ hoveredCategory?.name[computedLanguage] }}
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
              <span class="font-medium">{{ subcategory.name[computedLanguage] }}</span>
            </div>
          </div>
        </div>

        <!-- Products Column -->
        <div 
          v-if="hoveredSubcategory?.children?.length" 
          class="w-64 h-[500px] overflow-y-auto custom-scrollbar"
        >
          <h2 class="font-bold text-lg p-4 sticky top-0 bg-white dark:bg-gray-900 z-10 border-b border-gray-200 dark:border-gray-700 dark:text-white">
            {{ hoveredSubcategory?.name[computedLanguage] }}
          </h2>
          <div class="py-2">
            <div 
              v-for="product in hoveredSubcategory.children" 
              :key="product.id"
              class="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              @click="moveToCategory(product)"
            >
              <div class="font-medium">{{ product.name[computedLanguage] }}</div>
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


