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
import {IGetProductsQuery, IGetProductsResponse,} from "@/ts/services/products.types.ts"
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

const computedLanguage = computed<ELanguages>(() => appStore.getLanguage)
const computedSearch = computed<string | null>(() => {
  return (route?.query?.search as string) || null
})

const computedCurrentQuery = computed<string | null>(() => {
  const currentQuery = route?.query
  if (!currentQuery) return null

  return currentQuery
})

const computedCurrentRetailerId = computed<number | null>(() => {
  const retailerId = Number(route?.query?.retailerId as string)
  if (!retailerId) return null

  return retailerId
})

const computedCurrentStartDate = computed<string | null>(() => {
  const startDate = route?.query?.start_date as string
  if (!startDate) return null

  return startDate
})

const computedCurrentEndDate = computed<string | null>(() => {
  const endDate = route?.query?.end_date as string
  if (!endDate) return null

  return endDate
})

const computedCurrentLocation = computed<string | null>(() => {
  const location = route?.query?.location as string
  if (!location) return null

  return location
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
  if (computedCurrentLocation.value) {
    query.location = computedCurrentLocation.value
  }
  if (computedCurrentStartDate.value) {
    query.start_date = computedCurrentStartDate.value
  }
  if (computedCurrentEndDate.value) {
    query.end_date = computedCurrentEndDate.value
  }
  if (computedSearch.value) {
    query.search = computedSearch.value
  }

  return query
})

const computedProductsAmountString = computed<string | null>(() => {
  return `${productsTotal.value} პროდუქტი`
})

watch(
    [currentPage, computedCurrentCategory, computedSearch, computedCurrentQuery],
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

const computedCategoryName = computed<string>(() => {
  if (computedCurrentCategory.value) {
    return computedCurrentCategory.value?.name[computedLanguage.value]
  }

  return "ყველა პროდუქტი"
})

const computedSubCategories = computed<ICategory[]>(() => {
  if (!computedCurrentCategory.value) return categoryStore.getRootCategories
  return computedCurrentCategory.value.children
})

function goToSubCategory(subCategory: ICategory): void {
  router.push({
    path: route.path,
    query: {
      category: subCategory.slug,
      search: computedSearch.value,
    },
  })
}

function resetFilters() {
  minPrice.value = null
  maxPrice.value = null
  sortBy.value = "ბოლოს დამატებული"
  currentPage.value = 1
  router.push({
    path: route.path,
    query: {},
  })
}

function handleGoBack(): void {
  if (computedCurrentCategory.value?.parent) {
    router.push({
      query: {
        category: computedCurrentCategory.value.parent.slug,
        search: computedSearch.value,
      },
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

  router.push({name: "home"})
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
        <BaseCategoryFilterCard
            :go-back="true"
            :title="computedCategoryName"
            @go-back="handleGoBack"
        >
          <div
              v-if="computedSubCategories.length > 0"
              class="flex flex-col items-start gap-3"
          >
            <p
                v-for="subCategory in computedSubCategories"
                :key="subCategory"
                class="text-sm font-medium text-customBlack/70 dark:text-white cursor-pointer hover:text-customRed dark:hover:text-customRed hover:underline"
                @click="goToSubCategory(subCategory)"
            >
              {{ subCategory.name[computedLanguage] }}
            </p>
          </div>
        </BaseCategoryFilterCard>

        <BaseCategoryFilterCard title="ღირებულება">
          <div class="flex flex-col gap-3">
            <div class="flex items-start gap-3">
              <Input v-model="minPrice" placeholder="0 - დან" type="number"/>
              <Input v-model="maxPrice" placeholder="0 - მდე" type="number"/>
            </div>
            <BaseButton
                :height="52"
                class="rounded-xl bg-customRed"
                @click="fetchProducts(true)"
            >
              <p class="font-uppercase text-sm font-bold text-white">ძებნა</p>
            </BaseButton>
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
