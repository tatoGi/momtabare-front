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
import { getUserById } from "@/services/user.js"
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

const comments = ref<IComment[]>([])
const commentsLoaded = ref<boolean>(false)

const computedRetailerId = computed<number | null>(
  () => Number(route.params?.retailerId) || null,
)

const computedRetailerFullName = computed(() => {
  return (
    `${retailer.value?.first_name.toLowerCase()} ${retailer.value?.last_name.toLowerCase()}` ||
    "N/A"
  )
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
  } catch (error) {
    console.log(error)
  } finally {
    productsLoading.value = false
  }

  await nextTick()
  windowScrollToTop()
}

async function fetchUser(): Promise<void> {
  if (!computedRetailerId.value) return

  try {
    const response = await getUserById(computedRetailerId.value)

    if (!response) return

    retailer.value = response.user
  } catch (error) {
    console.error("Error fetching the user:", error)
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
  sortBy.value = "ბოლოს დამატებული"
  currentPage.value = 1
  router.push({
    path: route.path,
    query: {},
  })
}

async function fetchComments(): Promise<void> {
  if (!computedRetailerId.value) return

  try {
    commentsLoaded.value = false

    const response = await getCommentsByRetailer(computedRetailerId.value)
    if (!response) return

    comments.value = response.comments
  } catch (error) {
    console.error("Error fetching the comments:", error)
  } finally {
    commentsLoaded.value = true
  }
}

watch(
  () => computedRetailerId,
  async (value) => {
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

    <div v-if="retailer && chosenTab === 'ყველა პროდუქტი'" class="pt-8">
      <div class="flex gap-6">
        <div class="flex w-80 flex-shrink-0 flex-col gap-4">
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
          <BaseCategoryFilterCard title="ღირებულება">
            <div class="flex flex-col gap-3">
              <div class="flex items-start gap-3">
                <Input v-model="minPrice" placeholder="0 - დან" type="number" />
                <Input v-model="maxPrice" placeholder="0 - მდე" type="number" />
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
            class="mb-5 flex flex-col border-b border-black/10 dark:border-white/10 pb-5"
          >
            <p class="text-sm font-medium text-customRed">
              {{ computedProductsAmountString }}
            </p>
            <div class="flex items-center justify-between">
              <h2 class="font-uppercase text-xl font-extrabold dark:text-white">
                {{ computedPageTitle }}
              </h2>

              <div class="flex items-center gap-1">
                <p class="text-sm text-black/70 dark:text-white/70">
                  დალაგება:
                </p>
                <BaseSelect
                  v-model="sortBy"
                  v-model:isOpen="sortByIsOpen"
                  :options="productSortingOptions.map((val: any) => val.label)"
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
