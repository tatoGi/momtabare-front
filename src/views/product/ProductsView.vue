<script lang="ts" setup>
import BaseBreadcrumbs from "@/components/base/BaseBreadcrumbs.vue"
import BaseButton from "@/components/base/BaseButton.vue"
import BaseCategoryFilterCard from "@/components/base/BaseCategoryFilterCard.vue"
import BaseIcon from "@/components/base/BaseIcon.vue"
import BaseNoData from "@/components/base/BaseNoData.vue"
import BasePagination from "@/components/base/BasePagination.vue"
import BaseSelect from "@/components/base/BaseSelect.vue"
import ProductList from "@/components/products/ProductList.vue"
import {Input} from "@/components/ui/input"
import {ICategory} from "@/types/category"
import {IProductListItem} from "@/ts/models/product.types.js"
import {ELanguages} from "@/ts/pinia/app.types.js"
import {IGetProductsQuery, IGetProductsResponse} from "@/ts/services/products.types"
import {windowScrollToTop} from "@/utils/helpers/scroll.js"
import {productSortingOptions} from "@/constants/productSortingOptions.js"
import {getProducts} from "@/services/products.js"
import {useAppStore} from "@/pinia/app.pinia.js"
import {useCategoryStore} from "@/pinia/category.pinia.js"
import {computed, nextTick, ref, watch} from "vue"
import {useRoute, useRouter} from "vue-router"

const route = useRoute()
const router = useRouter()

const appStore = useAppStore()
const categoryStore = useCategoryStore()

const products = ref<IProductListItem[] | null>(null)
const currentPage = ref<number>(1)
const totalPages = ref<number | null>(null)
const productsTotal = ref<number>(0)

const productsLoading = ref<boolean>(false)

const sortBy = ref<string>("ბოლოს დამატებული")
const sortByIsOpen = ref<boolean>(false)

const minPrice = ref<number | null>(null)
const maxPrice = ref<number | null>(null)

// Local filter state
const searchFilter = ref<string>("")
const locationFilter = ref<string>("")
const startDateFilter = ref<string>("")
const endDateFilter = ref<string>("")
const selectedBrands = ref<string[]>([])
const selectedColors = ref<string[]>([])

const computedLanguage = computed<ELanguages>(() => appStore.getLanguage)
const computedSearch = computed<string | null>(() => {
  return (route?.query?.search as string) || null
})

// Real data for brands and colors (extracted from products)
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

// Extract brands from products with proper localization
async function extractBrandsFromProducts() {
  try {
    // Fetch all products to extract unique brands
    const allProductsResponse = await getProducts({ page: 1 })
    const allProducts = allProductsResponse.products
    console.log('all products', allProducts);
    // Extract unique brands and count them
    const brandCounts: { [key: string]: { count: number, translations: any } } = {}
    
    allProducts.forEach(product => {
     
      // Extract brand from product name or other fields
      const brandData = extractBrandFromProduct(product)
      if (brandData) {
        const brandKey = brandData.key || brandData.name
        if (brandCounts[brandKey]) {
          brandCounts[brandKey].count += 1
        } else {
          brandCounts[brandKey] = {
            count: 1,
            translations: brandData.translations || { ka: brandData.name, en: brandData.name }
          }
        }
      }
    })
    
    // Convert to array format with localization
    availableBrands.value = Object.entries(brandCounts)
      .map(([key, data]) => ({ 
        name: data.translations[computedLanguage.value] || data.translations.ka || data.translations.en || key,
        count: data.count,
        key: key
      }))
      .sort((a, b) => b.count - a.count) // Sort by count descending
      
  } catch (error) {
    console.error('Error extracting brands:', error)
    // Fallback to some common brands if extraction fails
    availableBrands.value = [
      { name: "Generic Brand", count: 0, key: "generic" }
    ]
  }
}

// Helper function to extract brand from product with translations
function extractBrandFromProduct(product: any): { name: string, key: string, translations?: any } | null {
 
  
  // Check if product has a brand field with translations
  if (product.brand) {
    if (typeof product.brand === 'object' && product.brand.translations) {
      return {
        name: product.brand.translations[computedLanguage.value] || product.brand.translations.ka || product.brand.translations.en,
        key: product.brand.slug || product.brand.name,
        translations: product.brand.translations
      }
    }
    return {
      name: product.brand,
      key: product.brand.toLowerCase().replace(/\s+/g, '-'),
      translations: { ka: product.brand, en: product.brand }
    }
  }
  
  // Check if product has brand_id and brand data
  if (product.brand_id && product.brand_data) {
    return {
      name: product.brand_data.translations?.[computedLanguage.value] || product.brand_data.name || product.brand_data.title,
      key: product.brand_data.slug || product.brand_data.name,
      translations: product.brand_data.translations || { ka: product.brand_data.name, en: product.brand_data.name }
    }
  }
  
  if (product.name) {
    // Simple brand extraction from product name
    const brandKeywords = [
      { name: 'The North Face', ka: 'ნორთ ფეისი', en: 'The North Face' },
      { name: 'North Face', ka: 'ნორთ ფეისი', en: 'North Face' },
      { name: 'Salomon', ka: 'სალომონი', en: 'Salomon' },
      { name: 'Columbia', ka: 'კოლუმბია', en: 'Columbia' },
      { name: 'Outdoor Research', ka: 'აუტდორ რისერჩი', en: 'Outdoor Research' },
      { name: 'Helly Hansen', ka: 'ჰელი ჰანსენი', en: 'Helly Hansen' },
      { name: 'Patagonia', ka: 'პატაგონია', en: 'Patagonia' },
      { name: 'Nike', ka: 'ნაიკი', en: 'Nike' },
      { name: 'Adidas', ka: 'ადიდასი', en: 'Adidas' }
    ]
    
    for (const brand of brandKeywords) {
      if (product.name.toLowerCase().includes(brand.name.toLowerCase())) {
        return {
          name: brand[computedLanguage.value] || brand.ka || brand.en,
          key: brand.name.toLowerCase().replace(/\s+/g, '-'),
          translations: { ka: brand.ka, en: brand.en }
        }
      }
    }
  }
  
  return null
}

// Extract colors from products with proper localization
async function extractColorsFromProducts() {
  try {
    // Fetch all products to extract unique colors
    const allProductsResponse = await getProducts({ page: 1 })
    const allProducts = allProductsResponse.products
    
    // Extract unique colors and count them
    const colorCounts: { [key: string]: { count: number, translations: any } } = {}
    
    allProducts.forEach(product => {
      const colorData = extractColorFromProduct(product)
      if (colorData) {
        const colorKey = colorData.key
        if (colorCounts[colorKey]) {
          colorCounts[colorKey].count += 1
        } else {
          colorCounts[colorKey] = {
            count: 1,
            translations: colorData.translations
          }
        }
      }
    })
    
    // Merge with existing colors and update counts
    availableColors.value = availableColors.value.map(color => {
      const foundColor = colorCounts[color.key]
      if (foundColor) {
        return {
          ...color,
          name: foundColor.translations[computedLanguage.value] || color.name,
          count: foundColor.count
        }
      }
      return color
    })
    
    // Add any new colors found in products
    Object.entries(colorCounts).forEach(([key, data]) => {
      const existingColor = availableColors.value.find(c => c.key === key)
      if (!existingColor) {
        availableColors.value.push({
          name: data.translations[computedLanguage.value] || data.translations.ka || data.translations.en || key,
          class: getColorClass(key),
          key: key,
          translations: data.translations,
          count: data.count
        })
      }
    })
      
  } catch (error) {
    console.error('Error extracting colors:', error)
  }
}

// Helper function to extract color from product
function extractColorFromProduct(product: any): { key: string, translations: any } | null {
  // Check if product has a color field with translations
  if (product.color) {
    if (typeof product.color === 'object' && product.color.translations) {
      return {
        key: product.color.slug || product.color.name,
        translations: product.color.translations
      }
    }
    return {
      key: product.color.toLowerCase().replace(/\s+/g, '-'),
      translations: { ka: product.color, en: product.color }
    }
  }
  
  // Check if product has color_id and color data
  if (product.color_id && product.color_data) {
    return {
      key: product.color_data.slug || product.color_data.name,
      translations: product.color_data.translations || { ka: product.color_data.name, en: product.color_data.name }
    }
  }
  
  return null
}

// Helper function to get color class for new colors
function getColorClass(colorKey: string): string {
  const colorClassMap: { [key: string]: string } = {
    'red': 'bg-red-500',
    'white': 'bg-white border-2 border-gray-300',
    'green': 'bg-green-500',
    'blue': 'bg-blue-500',
    'light-blue': 'bg-blue-300',
    'yellow': 'bg-yellow-500',
    'orange': 'bg-orange-500',
    'pink': 'bg-pink-500',
    'purple': 'bg-purple-500',
    'black': 'bg-black',
    'gray': 'bg-gray-500',
    'brown': 'bg-yellow-800'
  }
  
  return colorClassMap[colorKey] || 'bg-gray-400'
}

// Category icons mapping
function getCategoryIcon(slug: string): string {
  const iconMap: { [key: string]: string } = {
    'boating': 'directions_boat',
    'winter-sport': 'ac_unit',
    'hiking-camping': 'hiking',
    'cycling': 'pedal_bike',
    'urban-sport': 'directions_run',
    'fishing': 'fishing',
    'essential-items': 'camping'
  }
  return iconMap[slug] || 'category'
}

// Get category display name with proper localization
function getCategoryDisplayName(category: any): string {
  // Try different possible name structures
  if (category.name && typeof category.name === 'object') {
    return category.name[computedLanguage.value] || category.name.ka || category.name.en || category.title || 'Unnamed Category'
  }
  
  // Fallback to title or name string
  return category.title || category.name || 'Unnamed Category'
}

// Initialize local filters from route
function initializeFiltersFromRoute() {
  searchFilter.value = (route?.query?.search as string) || ""
  locationFilter.value = (route?.query?.location as string) || ""
  startDateFilter.value = (route?.query?.start_date as string) || ""
  endDateFilter.value = (route?.query?.end_date as string) || ""
  minPrice.value = Number(route?.query?.min_price) || null
  maxPrice.value = Number(route?.query?.max_price) || null
  selectedBrands.value = (route?.query?.brands as string)?.split(',') || []
  selectedColors.value = (route?.query?.colors as string)?.split(',') || []
}

// Toggle brand selection
function toggleBrand(brandName: string): void {
  const index = selectedBrands.value.indexOf(brandName)
  if (index > -1) {
    selectedBrands.value.splice(index, 1)
  } else {
    selectedBrands.value.push(brandName)
  }
  updateRouteWithFilters()
}

// Toggle color selection
function toggleColor(colorName: string): void {
  const index = selectedColors.value.indexOf(colorName)
  if (index > -1) {
    selectedColors.value.splice(index, 1)
  } else {
    selectedColors.value.push(colorName)
  }
  updateRouteWithFilters()
}

const computedCurrentRetailerId = computed<number | null>(() => {
  const retailerId = Number(route?.query?.retailerId as string)
  if (!retailerId) return null

  return retailerId
})

const computedCurrentCategory = computed<ICategory | null>(() => {
  const categoryQuery = route?.query?.category as string

  if (!categoryQuery) return null

  return categoryStore.getCategoryBySlug(categoryQuery)
})

const computedCategoriesPath = computed<string[] | null>(() => {
  if (!computedCurrentCategory.value) return []

  return categoryStore.getPathBySlug(computedCurrentCategory.value.slug)
})

const computedQuery = computed<IGetProductsQuery>(() => {
  const getSortBy = productSortingOptions.find(
      (val: { label: string; value: string }) => {
        return val.label === sortBy.value
      },
  )?.value

  const query: IGetProductsQuery = {
    sort: getSortBy,
    page: currentPage.value,
    min_price: minPrice.value,
    max_price: maxPrice.value,
  }

  if (computedCurrentCategory.value) {
    query.category_slug = computedCurrentCategory.value.slug
  }
  if (computedCurrentRetailerId.value) {
    query.retailer_id = computedCurrentRetailerId.value
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
  if (searchFilter.value) {
    query.search = searchFilter.value
  }

  return query
})

// Functions to update route with filter changes
function updateRouteWithFilters() {
  const query: any = {}
  
  if (searchFilter.value) query.search = searchFilter.value
  if (locationFilter.value) query.location = locationFilter.value
  if (startDateFilter.value) query.start_date = startDateFilter.value
  if (endDateFilter.value) query.end_date = endDateFilter.value
  if (minPrice.value) query.min_price = minPrice.value
  if (maxPrice.value) query.max_price = maxPrice.value
  if (selectedBrands.value.length > 0) query.brands = selectedBrands.value.join(',')
  if (selectedColors.value.length > 0) query.colors = selectedColors.value.join(',')
  if (computedCurrentCategory.value) query.category = computedCurrentCategory.value.slug
  if (computedCurrentRetailerId.value) query.retailerId = computedCurrentRetailerId.value

  // Keep current page when updating other filters
  query.page = currentPage.value

  router.push({
    path: route.path,
    query
  })
}

const computedProductsAmountString = computed<string | null>(() => {
  return `${productsTotal.value} პროდუქტი`
})

// Initialize filters and data on mount
async function initializeComponent() {
  // Initialize filters from route
  initializeFiltersFromRoute()
  
  // Fetch categories if not already loaded
  if (!categoryStore.getCategories || categoryStore.getCategories.length === 0) {
    try {
      await categoryStore.fetchCategories()
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }
  
  // Extract brands from products
  await extractBrandsFromProducts()
  
  // Extract colors from products
  await extractColorsFromProducts()
}

// Initialize component
initializeComponent()

watch(
    [currentPage, computedCurrentCategory, computedSearch],
    async () => {
      await nextTick()
      await fetchProducts()
    },
    {immediate: true, deep: true},
)

watch(sortBy, async () => {
  await fetchProducts(true)
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

  } catch (error) {
    console.log(error)
  } finally {
    productsLoading.value = false
  }

  await nextTick()
  windowScrollToTop()
}

const computedPageTitle = computed<string>(() => {
  if (computedSearch.value) return `საძიებო სიტხვა "${computedSearch.value}"`
  if (computedCurrentCategory.value) {
    return computedCurrentCategory.value?.name[computedLanguage.value]
  }

  return "ყველა პროდუქტი"
})

// Get all available categories for the sidebar
const availableCategories = computed<ICategory[]>(() => {
  return categoryStore.getRootCategories || []
})


// New function to select a category and filter products
function selectCategory(category: ICategory | null): void {
  const query: any = {}
  
  // Keep existing filters
  if (searchFilter.value) query.search = searchFilter.value
  if (locationFilter.value) query.location = locationFilter.value
  if (startDateFilter.value) query.start_date = startDateFilter.value
  if (endDateFilter.value) query.end_date = endDateFilter.value
  if (minPrice.value) query.min_price = minPrice.value
  if (maxPrice.value) query.max_price = maxPrice.value
  if (selectedBrands.value.length > 0) query.brands = selectedBrands.value.join(',')
  if (selectedColors.value.length > 0) query.colors = selectedColors.value.join(',')
  if (computedCurrentRetailerId.value) query.retailerId = computedCurrentRetailerId.value
  
  // Set category filter
  if (category) {
    query.category = category.slug
  }
  
  // Reset to first page when changing category
  query.page = 1
  
  router.push({
    path: route.path,
    query
  })
}

function resetFilters() {
  minPrice.value = null
  maxPrice.value = null
  searchFilter.value = ""
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

</script>

<template>
  <div class="flex flex-col gap-2 py-5">
    <BaseBreadcrumbs
        v-if="computedCategoriesPath"
        :path="computedCategoriesPath"
        prependPath="products"
        route-as-query="category"
    />

    <div class="flex gap-6">
      <div class="flex w-80 flex-shrink-0 flex-col gap-4">
        <!-- Categories Section -->
        <BaseCategoryFilterCard title="კატეგორიები">
          <div class="flex flex-col gap-3">
            <!-- Show "All Categories" option -->
            <!-- Loading state for categories -->
            <div v-if="availableCategories.length === 0" class="text-center py-4">
              <div class="animate-pulse">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
            
            <!-- Show all available categories -->
            <div
                v-for="category in availableCategories"
                :key="category.id"
                class="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
                :class="computedCurrentCategory?.id === category.id ? 'bg-gray-100 dark:bg-gray-800' : ''"
                @click="selectCategory(category)"
            >
              <BaseIcon 
                :name="getCategoryIcon(category.slug)" 
                :size="20" 
                class="text-customBlack/70 dark:text-white/70"
              />
              <span class="text-sm font-medium text-customBlack/70 dark:text-white hover:text-customRed dark:hover:text-customRed">
                {{ getCategoryDisplayName(category) }}
              </span>
            </div>
            
            <!-- Empty state for categories -->
            <div v-if="availableCategories.length === 0 && categoryStore.getCategories" class="text-center py-4 text-sm text-customBlack/50 dark:text-white/50">
              კატეგორიები არ მოიძებნა
            </div>
          </div>
        </BaseCategoryFilterCard>

        <!-- Price Section -->
        <BaseCategoryFilterCard title="ღირებულება (ლარი)">
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <Input 
                v-model="minPrice" 
                placeholder="20 - დან" 
                type="number" 
                @input="updateRouteWithFilters"
                class="flex-1"
              />
              <span class="text-sm text-customBlack/70 dark:text-white/70">-</span>
              <Input 
                v-model="maxPrice" 
                placeholder="400 - მდე" 
                type="number" 
                @input="updateRouteWithFilters"
                class="flex-1"
              />
            </div>
            <!-- Price Range Slider Placeholder -->
            <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full relative">
              <div class="absolute left-0 right-0 h-full bg-customRed rounded-full" style="width: 30%"></div>
              <div class="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-customRed rounded-full shadow-md" style="left: 30%"></div>
              <div class="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-customRed rounded-full shadow-md" style="right: 20%"></div>
            </div>
          </div>
        </BaseCategoryFilterCard>

        <!-- Period Section -->
        <BaseCategoryFilterCard title="პერიოდი">
          <div class="flex flex-col gap-3">
            <div class="relative">
              <Input 
                v-model="startDateFilter" 
                placeholder="აირჩიე პერიოდი" 
                type="date"
                @change="updateRouteWithFilters"
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

        <!-- Brand Section -->
        <BaseCategoryFilterCard title="ბრენდი">
          <div class="flex flex-col gap-3">
            <!-- Loading state -->
            <div v-if="availableBrands.length === 0" class="text-center py-4">
              <div class="animate-pulse">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
            
            <!-- Brands list -->
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
            
            <!-- Empty state -->
            <div v-if="availableBrands.length === 0 && !availableBrands.some(b => b.name === 'Generic Brand')" class="text-center py-4 text-sm text-customBlack/50 dark:text-white/50">
              ბრენდები არ მოიძებნა
            </div>
          </div>
        </BaseCategoryFilterCard>

        <!-- Color Section -->
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
                class="absolute -top-1 -right-1 w-4 h-4 bg-customRed rounded-full flex items-center justify-center"
              >
                <BaseIcon name="check" :size="12" class="text-white" />
              </div>
            </div>
          </div>
        </BaseCategoryFilterCard>
      </div>

      <div class="flex-grow">
        <div
            class="mb-5 flex flex-col border-b border-customBlack/10 dark:border-white/10 pb-5"
        >
          <p class="text-sm font-medium text-customRed">
            {{ computedProductsAmountString }}
          </p>
          <div class="flex items-center justify-between">
            <h2 class="font-uppercase text-xl font-extrabold dark:text-white">
              {{ computedPageTitle }}
            </h2>

            <div class="flex items-center gap-1">
              <p class="text-sm text-customBlack/70 dark:text-white/70">
                დალაგება:
              </p>
              <BaseSelect
                  v-model="sortBy"
                  v-model:isOpen="sortByIsOpen"
                  :options="productSortingOptions.map((val: any) => val.label)"
              >
                <template #trigger>
                  <div class="flex cursor-pointer items-center gap-1">
                    <p class="text-sm font-medium dark:text-white">
                      {{ sortBy }}
                    </p>
                    <BaseIcon
                        :class="{
                        '-rotate-180': sortByIsOpen,
                      }"
                        :size="22"
                        class="text-customBlack/70 dark:text-white/70 transition"
                        name="keyboard_arrow_down"
                    />
                  </div>
                </template>
              </BaseSelect>
            </div>
          </div>
        </div>

        <ProductList :loading="productsLoading" :products="products"/>

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
          <BasePagination v-model="currentPage" :total-pages="totalPages"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
