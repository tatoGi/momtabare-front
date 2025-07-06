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
import { IGetProductsQuery } from "@/ts/services/products.types.ts"
import { cities } from "@/constants/cities.ts"
import { Directive, computed, ref, watch } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()
const searchQuery = ref<string>("")

const selectedDate = ref<Date | null>(new Date())
const startDate = ref<Date | null>(new Date())
const endDate = ref<Date | null>(null)
const datePickerOpen = ref<boolean>(false)
const selectedCity = ref<string>()

const attributes = computed(() => {
  if (!startDate.value || !endDate.value) return []
  return [
    {
      highlight: "red",
      dates: [{ start: startDate.value, end: endDate.value }],
    },
  ]
})

function findProducts() {
  const query: IGetProductsQuery = {}

  if (searchQuery.value) query.search = searchQuery.value
  if (startDate.value)
    query.start_date = startDate.value.toISOString().slice(0, 10)
  if (endDate.value) query.end_date = endDate.value.toISOString().slice(0, 10)
  if (selectedCity.value) query.location = selectedCity.value

  router.push({ name: "products", query })
}

const vClickOutside: Directive = {
  mounted(el: HTMLElement, binding: { value: () => void }) {
    const handler = (event: MouseEvent) => {
      const clickedElement = event.target as Node

      // Check if the clicked element is inside the element or its children
      if (!el.contains(clickedElement)) {
        // Additional check to prevent closing if clicked on the trigger
        const triggerElement = el.previousElementSibling
        if (!triggerElement?.contains(clickedElement)) {
          binding.value()
        }
      }
    }

    document.addEventListener("mousedown", handler)

    el.clickOutsideHandler = handler
  },
  unmounted(el: HTMLElement) {
    if (el.clickOutsideHandler) {
      document.removeEventListener("mousedown", el.clickOutsideHandler)
    }
  },
}

watch(selectedDate, (newDate) => {
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
      class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-customRed"
      @click="findProducts"
    >
      <BaseIcon :size="24" class="text-white" name="search" />
    </BaseButton>
  </div>
</template>
