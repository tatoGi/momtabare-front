<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue"
import BaseIcon from "@/components/base/BaseIcon.vue"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IGetProductsQuery } from "@/ts/services/products.types"
import { cities } from "@/constants/cities"
import { computed, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { searchProducts, type ISearchQuery, type ISearchResponse } from "@/services/search"

const router = useRouter()
const searchQuery = ref<string>("")

const selectedDate = ref<Date | null>(new Date())
const startDate = ref<Date | null>(new Date())
const endDate = ref<Date | null>(null)
const datePickerOpen = ref<boolean>(false)
const selectedCity = ref<string>()

// Search state
const searchResults = ref<ISearchResponse | null>(null)
const isSearching = ref<boolean>(false)
const searchError = ref<string | null>(null)

const attributes = computed(() => {
  if (!startDate.value || !endDate.value) return []
  return [
    {
      highlight: "red",
      dates: [{ start: startDate.value, end: endDate.value }],
    },
  ]
})

async function findProducts() {
  try {
    isSearching.value = true
    searchError.value = null
    
    const searchParams: ISearchQuery = {}

    if (searchQuery.value) searchParams.search = searchQuery.value
    if (startDate.value)
      searchParams.start_date = startDate.value.toISOString().slice(0, 10)
    if (endDate.value) searchParams.end_date = endDate.value.toISOString().slice(0, 10)
    if (selectedCity.value) searchParams.location = selectedCity.value

    // Perform search using the new API endpoint
    const response = await searchProducts(searchParams)
    searchResults.value = response
    
    if (response.success) {
      // Navigate to products page with search results
      const query: IGetProductsQuery = {}
      if (searchQuery.value) query.search = searchQuery.value
      if (startDate.value) query.start_date = searchParams.start_date
      if (endDate.value) query.end_date = searchParams.end_date
      if (selectedCity.value) query.location = searchParams.location

      router.push({ name: "products", query: query as any })
    } else {
      searchError.value = "Search failed. Please try again."
    }
  } catch (error) {
    console.error('Search error:', error)
    searchError.value = "An error occurred during search. Please try again."
  } finally {
    isSearching.value = false
  }
}


watch(selectedDate, (newDate: Date | null) => {
  if (!newDate) return

  if (startDate.value && endDate.value) {
    startDate.value = newDate
    endDate.value = null
    return
  }

  if (!startDate.value) {
    startDate.value = newDate
    return
  }

  if (!endDate.value) {
    const potentialEndDate = newDate

    const [rangeStart, rangeEnd] =
      startDate.value <= potentialEndDate
        ? [startDate.value, potentialEndDate]
        : [potentialEndDate, startDate.value]

    startDate.value = rangeStart
    endDate.value = rangeEnd
  }
})
</script>

<template>
  <div
    class="relative h-[68px] rounded-full bg-customGrey px-11 dark:bg-customDarkGrey"
  >
    <div class="flex h-full items-center justify-between gap-7 py-3">
      <div class="flex flex-col justify-center gap-1">
        <p class="text-xs text-customBlack/70 dark:text-white/70">
          {{ $t("gear") }}
        </p>
        <input
          v-model="searchQuery"
          :placeholder="$t('chooseName')"
          class="w-44 bg-customGrey text-sm font-medium placeholder-customBlack dark:bg-customDarkGrey dark:text-white dark:placeholder-white"
        />
      </div>
      <div class="h-[35px] w-[1px] rounded-full bg-customBlack/10"></div>
      <div class="flex flex-col justify-center gap-1">
        <p class="text-xs text-customBlack/70 dark:text-white/70">
          {{ $t("location") }}
        </p>
        <Select v-model="selectedCity">
          <SelectTrigger
            class="h-fit min-w-44 border-none bg-customGrey px-0 py-0 text-sm font-medium placeholder-customBlack dark:bg-customDarkGrey"
          >
            <SelectValue
              :placeholder="$t('chooseLocation')"
              class="dark:text-white"
            />
          </SelectTrigger>
          <SelectContent class="rounded-2xl">
            <SelectGroup>
              <SelectItem
                v-for="(city, index) in cities"
                :key="city + index"
                :class="{
                  'border-b border-b-customBlack/10':
                    index !== cities.length - 1,
                }"
                :value="city"
                class="py-3"
                >{{ city }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div class="h-[35px] w-[1px] rounded-full bg-customBlack/10"></div>
      <div class="flex w-52 flex-col justify-center gap-1">
        <div class="relative">
          <p class="text-xs text-customBlack/70 dark:text-white/70">
            {{ $t("period") }}
          </p>
          <div
            class="flex w-full items-center gap-2 rounded-2xl"
            @click.stop="() => (datePickerOpen = !datePickerOpen)"
          >
            <p
              v-if="startDate && endDate"
              class="text-sm font-medium text-customBlack"
            >
              {{ startDate.toISOString().slice(5, 10) }} -
              {{ endDate.toISOString().slice(5, 10) }}
            </p>
            <h1 v-else class="dark:text-white">{{ $t("choosePeriod") }}</h1>
          </div>
          <div
            v-if="datePickerOpen"
            v-click-outside="() => (datePickerOpen = false)"
            class="absolute -left-12 top-20 z-50 w-full"
          >
            <VDatePicker
              v-model="selectedDate"
              :attributes="attributes"
              :min-date="new Date()"
              color="red"
              style="width: 300px"
            />
          </div>
        </div>
      </div>
    </div>
    <BaseButton
      :height="52"
      :width="52"
      :disabled="isSearching"
      class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-customRed disabled:opacity-50"
      @click="findProducts"
    >
      <BaseIcon 
        v-if="!isSearching"
        :size="24" 
        class="text-white" 
        name="search" 
      />
      <BaseIcon 
        v-else
        :size="24" 
        class="text-white animate-spin" 
        name="loader" 
      />
    </BaseButton>
    
    <!-- Error message display -->
    <div 
      v-if="searchError"
      class="absolute top-full left-0 right-0 mt-2 rounded-lg bg-red-100 border border-red-300 p-3 text-red-700 text-sm"
    >
      {{ searchError }}
    </div>
  </div>
</template>
