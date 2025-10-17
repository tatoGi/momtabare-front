<script lang="ts" setup>
import RetailerRatingsTab from "@/views/retailer/retailer-tabs/RetailerRatingsTab.vue"
import BaseBreadcrumbs from "@/components/base/BaseBreadcrumbs.vue"
import BaseButton from "@/components/base/BaseButton.vue"
import BaseCategoryFilterCard from "@/components/base/BaseCategoryFilterCard.vue"
import BaseIcon from "@/components/base/BaseIcon.vue"
import BaseNoData from "@/components/base/BaseNoData.vue"
import BasePagination from "@/components/base/BasePagination.vue"
import BaseSelect from "@/components/base/BaseSelect.vue"
import ProductList from "@/components/products/ProductList.vue"
import RetailerHeader from "@/components/retailer/RetailerHeader.vue"
import { Input } from "@/components/ui/input"
import type { ICategory } from "@/types/category"
import { IComment } from "@/ts/models/comment.types.ts"
import { IProductListItem } from "@/ts/models/product.types.ts"
import type { IUser } from "@/ts/models/user-types"
import { ELanguages } from "@/ts/pinia/app.types.ts"
import {
  IGetProductsQuery,
  IGetProductsResponse,
} from "@/ts/services/products.types.ts"
import { windowScrollToTop } from "@/utils/helpers/scroll.ts"
import { productSortingOptions } from "@/constants/productSortingOptions.ts"
import { getCommentsByRetailer } from "@/services/comments.ts"
import { getProducts } from "@/services/products.ts"
import { getRetailerUserById } from "@/services/user.ts"
import { useAppStore } from "@/pinia/app.pinia.ts"
import { useCategoryStore } from "@/pinia/category.pinia.ts"
import { computed, nextTick, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()

const appStore = useAppStore()
const categoryStore = useCategoryStore()

const retailer = ref<IUser | null>(null)

const products = ref<IProductListItem[] | null>([])
const productsLoading = ref<boolean>(false)

const currentPage = ref<number>(1)
const totalPages = ref<number | null>(null)
const productsTotal = ref<number>(0)

const chosenTab = ref<"ყველა პროდუქტი" | "შეფასება">("ყველა პროდუქტი")
const computedLanguage = computed<ELanguages>(() => appStore.getLanguage)

const sortBy = ref<string>("ბოლოს დამატებული")
const sortByIsOpen = ref<boolean>(false)
const searchValue = ref<string>("")

const minPrice = ref<number | null>(null)
const maxPrice = ref<number | null>(null)

// Additional filter states
const locationFilter = ref<string>("")
const startDateFilter = ref<string>("")
const endDateFilter = ref<string>("")
const selectedBrands = ref<string[]>([])
const selectedColors = ref<string[]>([])

// Available brands and colors
const availableBrands = ref<{name: string, count: number}[]>([])
const availableColors = ref<{name: string, class: string, key: string, translations: any}[]>([
  { name: "წითელი", class: "bg-red-500", key: "red", translations: { ka: "წითელი", en: "Red" } },
  { name: "თეთრი", class: "bg-white border-2 border-gray-300", key: "white", translations: { ka: "თეთრი", en: "White" } },
  { name: "მწვანე", class: "bg-green-500", key: "green", translations: { ka: "მწვანე", en: "Green" } },
  { name: "ლურჯი", class: "bg-blue-500", key: "blue", translations: { ka: "ლურჯი", en: "Blue" } },
  { name: "ღია ლურჯი", class: "bg-blue-300", key: "light-blue", translations: { ka: "ღია ლურჯი", en: "Light Blue" } },
  { name: "ვარდისფერი", class: "bg-pink-500", key: "magenta", translations: { ka: "ვარდისფერი", en: "Pink" } },
  { name: "იისფერი", class: "bg-purple-500", key: "purple", translations: { ka: "იისფერი", en: "Purple" } },
  { name: "შავი", class: "bg-black", key: "black", translations: { ka: "შავი", en: "Black" } },
  { name: "ნაცარი", class: "bg-gray-500", key: "gray", translations: { ka: "ნაცარი", en: "Gray" } }
])

const comments = ref<IComment[]>([])
const commentsLoaded = ref<boolean>(false)

// Mobile filters visibility
const showMobileFilters = ref<boolean>(false)

const computedRetailerId = computed<number | null>(
  () => Number(route.params?.retailerId) || null,
)

const computedRetailerFullName = computed(() => {
  if (!retailer.value) return "N/A"
  
  // Handle both name/surname and first_name/last_name formats
  const firstName = (retailer.value as any).name || retailer.value.first_name || ''
  const lastName = (retailer.value as any).surname || retailer.value.last_name || ''
  
  if (!firstName && !lastName) return "N/A"
  
  return `${firstName.toLowerCase()} ${lastName.toLowerCase()}`.trim()
})

const computedCurrentCategory = computed<ICategory | null>(() => {
  const categoryQuery = route?.query?.category as string

  if (!categoryQuery) return null

  return categoryStore.getCategoryBySlug(categoryQuery)
})

const computedSubCategories = computed<ICategory[]>(() => {
  if (!computedCurrentCategory.value) return categoryStore.getRootCategories
  return computedCurrentCategory.value.children
})

const computedCategoryName = computed<string | null>(() => {
  return computedCurrentCategory.value?.name[computedLanguage.value] || null
})

const computedQuery = computed<IGetProductsQuery>(() => {
  const getSortBy = productSortingOptions.find((val: any) => {
    return val.label === sortBy.value
  })?.value

  const query: IGetProductsQuery = {
    sort: getSortBy,
    page: currentPage.value,
    min_price: minPrice.value,
    max_price: maxPrice.value,
    retailer_id: computedRetailerId.value,
  }

  if (computedCurrentCategory.value) {
    query.category_slug = computedCurrentCategory.value.slug
  }

  if (searchValue.value) {
    query.search = searchValue.value
  }

  if (locationFilter.value) {
    query.location = locationFilter.value
  }

  if (startDateFilter.value) {
    query.start_date = startDateFilter.value
  }

  if (endDateFilter.value) {
    query.end_date = endDateFilter.value
  }

  return query
})

const computedPageTitle = computed<string>(() => {
  if (searchValue.value) return `საძიებო სიტხვა "${searchValue.value}"`
  if (computedCurrentCategory.value) {
    return computedCurrentCategory.value?.name[computedLanguage.value]
  }

  return "ყველა პროდუქტი"
})

const computedProductsAmountString = computed<string | null>(() => {
  return `${productsTotal.value} პროდუქცია`
})

async function fetchProducts(refreshPages?: boolean) {
  products.value = null
  productsLoading.value = true

  try {
    const allProducts: IGetProductsResponse | null = await getProducts(
      computedQuery.value,
    )

    if (!allProducts) return
    if (refreshPages) currentPage.value = 1

    totalPages.value = allProducts?.pagination?.last_page || 0
    productsTotal.value = allProducts?.pagination?.total || 0
    products.value = allProducts?.products || []
    
    // Extract brands after products are loaded
    await nextTick()
    extractBrandsFromProducts()
  } catch (error) {
    console.log(error)
  } finally {
    productsLoading.value = false
  }

  await nextTick()
  windowScrollToTop()
}

async function fetchUser(): Promise<void> {
  if (!computedRetailerId.value) {
    console.warn('⚠️ No retailer ID provided')
    return
  }

  try {
    console.log('📥 Fetching retailer data for ID:', computedRetailerId.value)
    const response = await getRetailerUserById(computedRetailerId.value)

    if (!response) {
      console.error('❌ No response from getUserById')
      return
    }

    console.log('✅ Retailer data fetched:', response.user)
    retailer.value = response.user
  } catch (error) {
    console.error("❌ Error fetching the user:", error)
  }
}

function triggerSearch(search: string): void {
  searchValue.value = search
  fetchProducts(true)
}

function handleGoBack() {
  if (computedCurrentCategory.value?.parent) {
    router.push({
      query: { category: computedCurrentCategory.value.parent.slug },
    })
    return
  }

  if (computedCurrentCategory.value) {
    router.push({
      path: route.path,
      query: {},
    })
    return
  }

  router.push({ name: "home" })
}

function goToSubCategory(subCategory: ICategory): void {
  router.push({
    path: route.path,
    query: { category: subCategory.slug },
  })
}

function resetFilters() {
  minPrice.value = null
  maxPrice.value = null
  locationFilter.value = ""
  startDateFilter.value = ""
  endDateFilter.value = ""
  selectedBrands.value = []
  selectedColors.value = []
  sortBy.value = "ბოლოს დამატებული"
  currentPage.value = 1
  router.push({
    path: route.path,
    query: {},
  })
}

// Toggle brand selection
function toggleBrand(brandName: string): void {
  const index = selectedBrands.value.indexOf(brandName)
  if (index > -1) {
    selectedBrands.value.splice(index, 1)
  } else {
    selectedBrands.value.push(brandName)
  }
  fetchProducts(true)
}

// Toggle color selection
function toggleColor(colorKey: string): void {
  const index = selectedColors.value.indexOf(colorKey)
  if (index > -1) {
    selectedColors.value.splice(index, 1)
  } else {
    selectedColors.value.push(colorKey)
  }
  fetchProducts(true)
}

// Extract brands from retailer products
async function extractBrandsFromProducts() {
  try {
    if (!products.value || products.value.length === 0) return
    
    const brandCounts: { [key: string]: number } = {}
    
    products.value.forEach(product => {
      const brand = (product as any).brand || 'სხვა'
      if (brandCounts[brand]) {
        brandCounts[brand] += 1
      } else {
        brandCounts[brand] = 1
      }
    })
    
    availableBrands.value = Object.entries(brandCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  } catch (error) {
    console.error('Error extracting brands:', error)
  }
}

async function fetchComments(): Promise<void> {
  if (!computedRetailerId.value) return

  try {
    commentsLoaded.value = false
    console.log('💬 Fetching comments for retailer ID:', computedRetailerId.value)

    const response = await getCommentsByRetailer({ id: computedRetailerId.value })
    if (!response) {
      console.warn('⚠️ No response from getCommentsByRetailer')
      return
    }

    console.log('✅ Comments fetched:', response.data?.length || 0)
    comments.value = response.data || []
  } catch (error) {
    console.error("❌ Error fetching comments:", error)
  } finally {
    commentsLoaded.value = true
  }
}

// Toggle mobile filters
function toggleMobileFilters() {
  showMobileFilters.value = !showMobileFilters.value
  // Prevent body scroll when filters are open
  if (showMobileFilters.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// Close mobile filters
function closeMobileFilters() {
  showMobileFilters.value = false
  document.body.style.overflow = ''
}

// Apply filters and close modal
function applyFilters() {
  fetchProducts(true)
  closeMobileFilters()
}

watch(
  () => computedRetailerId.value,
  async (value) => {
    console.log('👤 Retailer ID changed:', value)
    if (value) {
      await fetchProducts(true)
      await fetchComments()
      await fetchUser()
    }
  },
  { immediate: true },
)

watch([currentPage, computedCurrentCategory], async () => {
  await fetchProducts()
})

watch(sortBy, async () => {
  await fetchProducts(true)
})
</script>

<template>
  <div class="py-5">
    <BaseBreadcrumbs
      v-if="retailer"
      :disable-route="true"
      :path="[`${computedRetailerFullName}`]"
      prependPath="retailers"
    />

    <RetailerHeader
      v-if="retailer"
      v-model="chosenTab"
      v-model:search="searchValue"
      :retailer="retailer"
      @search-action="triggerSearch"
    />

    <div v-if="retailer && chosenTab === 'ყველა პროდუქტი'" class="pt-4 sm:pt-8 px-3 sm:px-0">
      <!-- Mobile Filters Modal -->
      <div 
        v-if="showMobileFilters"
        class="fixed inset-0 z-50 lg:hidden"
        @click="closeMobileFilters"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50"></div>
        
        <!-- Filter Panel -->
        <div 
          class="absolute inset-y-0 left-0 w-full sm:w-96 bg-white dark:bg-gray-900 overflow-y-auto"
          @click.stop
        >
          <!-- Header -->
          <div class="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-customBlack/10 dark:border-white/10 p-4 flex items-center justify-between">
            <h3 class="text-lg font-bold dark:text-white">ფილტრები</h3>
            <button 
              @click="closeMobileFilters"
              class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <BaseIcon name="close" :size="24" class="text-customBlack dark:text-white" />
            </button>
          </div>

          <!-- Filter Content - Mobile -->
          <div class="p-4 flex flex-col gap-4">
            <!-- Category Filter -->
            <BaseCategoryFilterCard
              :go-back="true"
              :title="computedCategoryName ?? 'ყველა პროდუქტი'"
              @go-back="handleGoBack"
            >
              <div
                v-if="computedSubCategories.length > 0"
                class="flex flex-col items-start gap-3"
              >
                <p
                  v-for="subCategory in computedSubCategories"
                  :key="subCategory"
                  class="text-sm font-medium text-black/70 dark:text-white/70 hover:cursor-pointer dark:hover:text-customRed hover:text-customRed hover:underline"
                  @click="goToSubCategory(subCategory); closeMobileFilters()"
                >
                  {{ subCategory.name[computedLanguage] }}
                </p>
              </div>
            </BaseCategoryFilterCard>

            <!-- Price Filter -->
            <BaseCategoryFilterCard title="ღირებულება (ლარი)">
              <div class="flex flex-col gap-3">
                <div class="flex items-start gap-3">
                  <Input v-model="minPrice" placeholder="20 - დან" type="number" />
                  <Input v-model="maxPrice" placeholder="400 - მდე" type="number" />
                </div>
              </div>
            </BaseCategoryFilterCard>

            <!-- Period Filter -->
            <BaseCategoryFilterCard title="პერიოდი">
              <div class="flex flex-col gap-3">
                <div class="relative">
                  <Input 
                    v-model="startDateFilter" 
                    placeholder="დაწყების თარიღი" 
                    type="date"
                    class="pr-10"
                  />
                  <BaseIcon 
                    name="calendar_today" 
                    :size="20" 
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-customBlack/50 dark:text-white/50 pointer-events-none"
                  />
                </div>
                <div class="relative">
                  <Input 
                    v-model="endDateFilter" 
                    placeholder="დასრულების თარიღი" 
                    type="date"
                    class="pr-10"
                  />
                  <BaseIcon 
                    name="calendar_today" 
                    :size="20" 
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-customBlack/50 dark:text-white/50 pointer-events-none"
                  />
                </div>
              </div>
            </BaseCategoryFilterCard>

            <!-- Location Filter -->
            <BaseCategoryFilterCard title="ლოკაცია">
              <div class="flex flex-col gap-3">
                <Input 
                  v-model="locationFilter" 
                  placeholder="შეიყვანეთ ლოკაცია" 
                  type="text"
                />
              </div>
            </BaseCategoryFilterCard>

            <!-- Brand Filter -->
            <BaseCategoryFilterCard v-if="availableBrands.length > 0" title="ბრენდი">
              <div class="flex flex-col gap-3">
                <div
                  v-for="brand in availableBrands"
                  :key="brand.name"
                  class="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
                  @click="toggleBrand(brand.name)"
                >
                  <div class="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      :checked="selectedBrands.includes(brand.name)"
                      class="w-4 h-4 text-customRed border-gray-300 rounded focus:ring-customRed"
                      @click.stop
                      @change="toggleBrand(brand.name)"
                    />
                    <span class="text-sm font-medium text-customBlack/70 dark:text-white">
                      {{ brand.name }}
                    </span>
                  </div>
                  <span class="text-xs text-customBlack/50 dark:text-white/50">
                    ({{ brand.count }})
                  </span>
                </div>
              </div>
            </BaseCategoryFilterCard>

            <!-- Color Filter -->
            <BaseCategoryFilterCard title="ფერი">
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="color in availableColors"
                  :key="color.key"
                  class="relative w-8 h-8 rounded-full border-2 cursor-pointer hover:scale-110 transition-transform"
                  :class="[
                    color.class,
                    selectedColors.includes(color.key) ? 'border-customRed' : 'border-gray-300 dark:border-gray-600'
                  ]"
                  @click="toggleColor(color.key)"
                  :title="color.name"
                >
                  <div 
                    v-if="selectedColors.includes(color.key)"
                    class="absolute inset-0 flex items-center justify-center"
                  >
                    <BaseIcon name="check" :size="16" class="text-white drop-shadow-md" />
                  </div>
                </div>
              </div>
            </BaseCategoryFilterCard>

            <!-- Action Buttons -->
            <div class="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-customBlack/10 dark:border-white/10 p-4 flex gap-3">
              <BaseButton
                :height="48"
                class="flex-1 bg-gray-200 dark:bg-gray-700 text-customBlack dark:text-white font-medium"
                @click="resetFilters(); closeMobileFilters()"
              >
                გასუფთავება
              </BaseButton>
              <BaseButton
                :height="48"
                class="flex-1 bg-customRed text-white font-medium"
                @click="applyFilters"
              >
                გაფილტვრა
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-6">
        <div class="hidden lg:flex w-80 flex-shrink-0 flex-col gap-4">
          <BaseCategoryFilterCard
            :go-back="true"
            :title="computedCategoryName ?? 'ყველა პროდუქტი'"
            @go-back="handleGoBack"
          >
            <div
              v-if="computedSubCategories.length > 0"
              class="flex flex-col items-start gap-3"
            >
              <p
                v-for="subCategory in computedSubCategories"
                :key="subCategory"
                class="text-sm font-medium text-black/70 dark:text-white/70 hover:cursor-pointer dark:hover:text-customRed hover:text-customRed hover:underline"
                @click="goToSubCategory(subCategory)"
              >
                {{ subCategory.name[computedLanguage] }}
              </p>
            </div>
          </BaseCategoryFilterCard>
          <BaseCategoryFilterCard title="ღირებულება (ლარი)">
            <div class="flex flex-col gap-3">
              <div class="flex items-start gap-3">
                <Input v-model="minPrice" placeholder="20 - დან" type="number" @input="fetchProducts(true)" />
                <Input v-model="maxPrice" placeholder="400 - მდე" type="number" @input="fetchProducts(true)" />
              </div>
            </div>
          </BaseCategoryFilterCard>

          <!-- Period Filter -->
          <BaseCategoryFilterCard title="პერიოდი">
            <div class="flex flex-col gap-3">
              <div class="relative">
                <Input 
                  v-model="startDateFilter" 
                  placeholder="დაწყების თარიღი" 
                  type="date"
                  @change="fetchProducts(true)"
                  class="pr-10"
                />
                <BaseIcon 
                  name="calendar_today" 
                  :size="20" 
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-customBlack/50 dark:text-white/50 pointer-events-none"
                />
              </div>
              <div class="relative">
                <Input 
                  v-model="endDateFilter" 
                  placeholder="დასრულების თარიღი" 
                  type="date"
                  @change="fetchProducts(true)"
                  class="pr-10"
                />
                <BaseIcon 
                  name="calendar_today" 
                  :size="20" 
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-customBlack/50 dark:text-white/50 pointer-events-none"
                />
              </div>
            </div>
          </BaseCategoryFilterCard>

          <!-- Location Filter -->
          <BaseCategoryFilterCard title="ლოკაცია">
            <div class="flex flex-col gap-3">
              <Input 
                v-model="locationFilter" 
                placeholder="შეიყვანეთ ლოკაცია" 
                type="text"
                @input="fetchProducts(true)"
              />
            </div>
          </BaseCategoryFilterCard>

          <!-- Brand Filter -->
          <BaseCategoryFilterCard v-if="availableBrands.length > 0" title="ბრენდი">
            <div class="flex flex-col gap-3">
              <div
                v-for="brand in availableBrands"
                :key="brand.name"
                class="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
                @click="toggleBrand(brand.name)"
              >
                <div class="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    :checked="selectedBrands.includes(brand.name)"
                    class="w-4 h-4 text-customRed border-gray-300 rounded focus:ring-customRed"
                    @click.stop
                    @change="toggleBrand(brand.name)"
                  />
                  <span class="text-sm font-medium text-customBlack/70 dark:text-white">
                    {{ brand.name }}
                  </span>
                </div>
                <span class="text-xs text-customBlack/50 dark:text-white/50">
                  ({{ brand.count }})
                </span>
              </div>
            </div>
          </BaseCategoryFilterCard>

          <!-- Color Filter -->
          <BaseCategoryFilterCard title="ფერი">
            <div class="flex flex-wrap gap-2">
              <div
                v-for="color in availableColors"
                :key="color.key"
                class="relative w-8 h-8 rounded-full border-2 cursor-pointer hover:scale-110 transition-transform"
                :class="[
                  color.class,
                  selectedColors.includes(color.key) ? 'border-customRed' : 'border-gray-300 dark:border-gray-600'
                ]"
                @click="toggleColor(color.key)"
                :title="color.name"
              >
                <div 
                  v-if="selectedColors.includes(color.key)"
                  class="absolute inset-0 flex items-center justify-center"
                >
                  <BaseIcon name="check" :size="16" class="text-white drop-shadow-md" />
                </div>
              </div>
            </div>
          </BaseCategoryFilterCard>
        </div>
        <div class="flex-grow">
          <div
            class="mb-3 sm:mb-5 flex flex-col border-b border-black/10 dark:border-white/10 pb-3 sm:pb-5"
          >
            <p class="text-xs sm:text-sm font-medium text-customRed mb-2">
              {{ computedProductsAmountString }}
            </p>

            <!-- Desktop Layout -->
            <div class="hidden lg:flex items-center justify-between">
              <h2 class="font-uppercase text-xl font-extrabold dark:text-white truncate">
                {{ computedPageTitle }}
              </h2>
              
              <div class="flex items-center gap-1">
                <p class="text-sm text-black/70 dark:text-white/70">
                  დალაგება:
                </p>
                <BaseSelect
                  v-model="sortBy"
                  v-model:isOpen="sortByIsOpen"
                  :options="productSortingOptions.map((val) => val.label)"
                >
                  <template #trigger>
                    <div class="flex cursor-pointer items-center gap-1">
                      <p class="text-sm font-medium text-black dark:text-white">
                        {{ sortBy }}
                      </p>
                      <BaseIcon
                        :class="{
                          '-rotate-180': sortByIsOpen,
                        }"
                        :size="22"
                        class="text-black/70 dark:text-white/70 transition"
                        name="keyboard_arrow_down"
                      />
                    </div>
                  </template>
                </BaseSelect>
              </div>
            </div>

            <!-- Mobile Layout -->
            <div class="flex lg:hidden flex-col gap-3">
              <!-- Title -->
              <h2 class="font-uppercase text-base sm:text-lg font-extrabold dark:text-white">
                {{ computedPageTitle }}
              </h2>
              
              <!-- Filter Button and Sort -->
              <div class="flex items-center justify-between gap-3">
                <!-- Filter Button -->
                <button 
                  @click="toggleMobileFilters"
                  class="flex items-center gap-1 px-3 py-2 bg-customRed text-white rounded-lg hover:bg-customRed/90 transition-colors"
                >
                  <BaseIcon name="filter_list" :size="20" />
                  <span class="text-sm font-medium">ფილტრი</span>
                </button>

                <!-- Sort Dropdown -->
                <BaseSelect
                  v-model="sortBy"
                  v-model:isOpen="sortByIsOpen"
                  :options="productSortingOptions.map((val) => val.label)"
                >
                  <template #trigger>
                    <div class="flex cursor-pointer items-center gap-1">
                      <p class="text-xs sm:text-sm font-medium text-black dark:text-white">
                        {{ sortBy }}
                      </p>
                      <BaseIcon
                        :class="{
                          '-rotate-180': sortByIsOpen,
                        }"
                        :size="20"
                        class="text-black/70 dark:text-white/70 transition"
                        name="keyboard_arrow_down"
                      />
                    </div>
                  </template>
                </BaseSelect>
              </div>
            </div>
          </div>

          <ProductList :loading="productsLoading" :products="products" />
          <BaseNoData
            v-if="
              (!productsLoading && products?.length === 0) ||
              (!productsLoading && !products)
            "
            action_title="მთელი პროდუქცია"
            class="py-36"
            description="სცადეთ ფილტრაციის შემსუბუება ან ყველა პროდუქტის დათვალიერება"
            title="პროდუქტები არ მოიძებნება ცარიელია"
            @action="resetFilters"
          />

          <div v-if="products?.length !== 0" class="flex-center py-5">
            <BasePagination v-model="currentPage" :total-pages="totalPages" />
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="retailer && chosenTab === 'შეფასება'" class="pt-5">
      <RetailerRatingsTab :comments="comments" :retailer="retailer" />
    </div>
  </div>
</template>

<style scoped></style>
