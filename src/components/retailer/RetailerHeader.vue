<script lang="ts" setup>
import ownerTemp from "@/assets/img/OwnerTemp1.png"
import BaseIcon from "@/components/base/BaseIcon.vue"
import {ERetailerTab} from "@/ts/components/retailer.types.ts"
import type { IUser } from "@/ts/models/user-types"
import {computed, type Ref, ref} from "vue"
import { ENV } from "@/utils/config/env"

const props = defineProps<{
  retailer: IUser
}>()

const emits = defineEmits<{
  (e: "searchAction", searchQuery: string): void
}>()

const searchContent = ref<string>("")
const tabs: ERetailerTab[] = [ERetailerTab.ALL_PRODUCTS, ERetailerTab.REVIEW]

const selectedTab = defineModel<ERetailerTab>({
  default: ERetailerTab.ALL_PRODUCTS,
}) as Ref<ERetailerTab>

const backendUrl = 'https://admin.momtabare.com'

const computedUserInitials = computed(() => {
  const firstInitial = props.retailer.first_name?.[0] ?? '';
  const lastInitial = props.retailer.last_name?.[0] ?? '';
  return (firstInitial + lastInitial).toUpperCase();
});


const computedProfilePicture = computed<string | null>(() => {
  if (!props.retailer?.profile_picture) return null
  return `${backendUrl}/${props.retailer.profile_picture}`
})

const computedFullName = computed(() => {
  return `${props.retailer?.first_name} ${props.retailer?.last_name}` || "N/A"
})

function tabStyle(tab: string) {
  return selectedTab.value === tab
      ? "border-customRed dark:border-customRed text-customRed"
      : "border-transparent"
}

function triggerTabClick(tab: ERetailerTab) {
  selectedTab.value = tab
}

console.log(props.retailer, "RETAILER")
</script>

<template>
  <div class="flex items-center gap-2 rounded-lg pt-3">
    <img v-if="ownerTemp"
         :src="ownerTemp"
         alt=""
         class="relative h-40 max-h-40 w-full rounded-t-2xl object-cover"
    />
    <div v-else class="relative h-40 w-full bg-customRed rounded-t-2xl object-cover">

    </div>
    <div class="absolute flex items-center gap-3 p-5">
      <img
          v-if="computedProfilePicture"
          :src="computedProfilePicture"
          alt="retailer_profile_picture"
          class="h-20 w-20 rounded-full object-cover"
      />
      <div v-else class="bg-customRed rounded-full w-16 h-16 flex-center flex-shrink-0">
        <h2 class="text-customGrey font-bold font-uppercase pb-1">{{ computedUserInitials }}</h2>
      </div>
      <div>
        <div class="flex items-center gap-1">
          <h2 class="font-uppercase font-bold text-white">
            {{ computedFullName }}
          </h2>
          <BaseIcon :size="20" class="text-white" name="verified"/>
        </div>
        <h2
            v-if="props.retailer?.rating_stats"
            class="flex-center mt-1 w-10 rounded-full bg-customRed text-center text-sm text-white"
        >
          {{ props.retailer.rating_stats.average ?? 0 }}
        </h2>
      </div>
    </div>
  </div>
  <div
      class="flex flex-col sm:flex-row items-start sm:items-center w-full justify-between bg-customGrey dark:bg-customDarkGrey rounded-b-2xl px-4 sm:px-8 gap-3 sm:gap-0 py-3 sm:py-0"
  >
    <div class="flex items-center gap-4 sm:gap-8 rounded-b-2xl overflow-x-auto w-full sm:w-auto">
      <h2
          v-for="tab in tabs"
          :key="tab"
          :class="tabStyle(tab)"
          class="flex h-12 sm:h-16 cursor-pointer items-center border-b-2 text-xs sm:text-sm font-medium transition-all text-customBlack/70 dark:text-white/70 hover:text-customRed dark:hover:text-customRed whitespace-nowrap"
          @click="triggerTabClick(tab)"
      >
        {{ tab }}
      </h2>
    </div>
    <div
        class="bg-white dark:bg-customBlack px-3 sm:px-5 py-2 flex items-center gap-3 sm:gap-5 rounded-xl w-full sm:w-auto"
    >
      <input
          v-model="searchContent"
          class="outline-none text-xs sm:text-sm dark:bg-customBlack dark:text-white placeholder:text-customBlack/70 dark:placeholder:text-white/70 w-full sm:w-56 min-w-0"
          placeholder="პროდუქტის დასახელება"
          type="text"
          @keydown.enter="emits('searchAction', searchContent)"
      />
      <BaseIcon
          :size="20"
          :weight="300"
          class="text-customBlack/70 dark:text-white/70 cursor-pointer flex-shrink-0"
          name="search"
          @click="emits('searchAction', searchContent)"
      />
    </div>
  </div>
</template>
