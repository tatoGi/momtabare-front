<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import momtabareLogoWithTextDark from "@/assets/svg/momtabare-logo-with-text-dark.svg"
import momtabareLogoWithTextLight from "@/assets/svg/momtabare-logo-with-text.svg"
import BaseButton from "@/components/base/BaseButton.vue"
import {footerItems, type IFooterItems} from "@/constants/footer.ts"
import {useAppStore} from "@/pinia/app.pinia.ts"

type FooterItemKey = keyof typeof footerItems

const appStore = useAppStore()
const isMobile = ref(false)
const activeDropdown = ref<FooterItemKey | null>(null)

const toggleDropdown = (key: FooterItemKey) => {
  if (!isMobile.value) return
  activeDropdown.value = activeDropdown.value === key ? null : key
}

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<template>
  <footer class="py-10 flex flex-col border-t container">
    <!-- Mobile Layout -->
    <div v-if="isMobile" class="flex flex-col gap-8">
      <!-- Logo and Description -->
      <div class="flex flex-col gap-4">
        <img
          :src="appStore.darkMode ? momtabareLogoWithTextDark : momtabareLogoWithTextLight"
          alt="Momtabare"
          class="cursor-pointer w-[163px] h-[36px]"
        />
        <p class="text-customBlack/70 dark:text-white/70 text-sm">
          მოემზადე მომდევნო თავგადასავლისთვის მომთაბარესთან ერთად.
        </p>
      </div>

      <!-- Social Media Icons -->
      <div class="flex items-center gap-3">
        <BaseButton
          :height="48"
          :width="48"
          class="bg-customGrey dark:bg-customDarkGrey rounded-full"
        >
          <img alt="Facebook" src="@/assets/svg/facebook.svg"/>
        </BaseButton>
        <BaseButton
          :height="48"
          :width="48"
          class="bg-customGrey dark:bg-customDarkGrey rounded-full"
        >
          <img alt="Instagram" src="@/assets/svg/instagram.svg"/>
        </BaseButton>
        <BaseButton
          :height="48"
          :width="48"
          class="bg-customGrey dark:bg-customDarkGrey rounded-full"
        >
          <img alt="Youtube" src="@/assets/svg/youtube.svg"/>
        </BaseButton>
      </div>

      <!-- About Us Section (Always Visible) -->
      <div class="flex flex-col gap-3 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-bold dark:text-white">
          {{ footerItems.aboutUs.title }}
        </h2>
        <div class="flex flex-col gap-2">
          <p
            v-for="(page, index) in footerItems.aboutUs.pages"
            :key="index"
            class="text-sm font-medium cursor-pointer text-customBlack/70 hover:underline dark:text-white/70"
          >
            {{ page }}
          </p>
        </div>
      </div>

      <!-- Collapsible Sections -->
      <div 
        v-for="[key, item] in (Object.entries(footerItems).filter(([k]) => k !== 'aboutUs') as [FooterItemKey, IFooterItems[FooterItemKey]][])"
        :key="key"
        class="w-full border-b border-gray-200 dark:border-gray-700 pb-4"
      >
        <div 
          @click="toggleDropdown(key)"
          class="w-full flex items-center justify-between cursor-pointer py-3"
        >
          <h2 class="text-lg font-bold dark:text-white">
            {{ item.title }}
          </h2>
          <svg 
            :class="{'rotate-180': activeDropdown === key}"
            class="w-5 h-5 transition-transform duration-200 text-customBlack dark:text-white"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        <div v-if="activeDropdown === key" class="w-full flex flex-col gap-2 pl-0">
          <p
            v-for="(page, index) in item.pages"
            :key="index"
            class="w-full text-sm font-medium cursor-pointer text-customBlack/70 hover:underline dark:text-white/70"
          >
            {{ page }}
          </p>
        </div>
      </div>

      <!-- Copyright and USAID -->
      <div class="flex flex-col gap-4 pt-6">
        <p class="text-customBlack/70 dark:text-white/70 text-xs">
          Momtabare © 2024 ყველა უფლება დაცულია.
        </p>
        <img alt="usaid" class="h-16 w-auto" src="../assets/img/USAID.png"/>
      </div>
    </div>

    <!-- Desktop Layout -->
    <div v-else class="flex flex-col justify-between gap-12 mb-16">
      <div class="flex items-center justify-between gap-4 footer-text-top">
        <div class="flex flex-col gap-2">
          <img
            :src="appStore.darkMode ? momtabareLogoWithTextDark : momtabareLogoWithTextLight"
            alt="Momtabare"
            class="cursor-pointer w-[163px] h-[36px]"
          />
          <p class="text-customBlack/70 dark:text-white/70 text-sm">
            მოემზადე მომდევნო თავგადასავლისთვის მომთაბარესთან ერთად.
          </p>
        </div>

        <div class="flex items-center gap-5 pt-4">
          <BaseButton
            :height="48"
            :width="48"
            class="bg-customGrey dark:bg-customDarkGrey rounded-full"
          >
            <img alt="Facebook" src="@/assets/svg/facebook.svg"/>
          </BaseButton>
          <BaseButton
            :height="48"
            :width="48"
            class="bg-customGrey dark:bg-customDarkGrey rounded-full"
          >
            <img alt="Instagram" src="@/assets/svg/instagram.svg"/>
          </BaseButton>
          <BaseButton
            :height="48"
            :width="48"
            class="bg-customGrey dark:bg-customDarkGrey rounded-full"
          >
            <img alt="Youtube" src="@/assets/svg/youtube.svg"/>
          </BaseButton>
        </div>
      </div>

      <div class="flex gap-44 footer-text-bottom">
        <div 
          v-for="[key, item] in (Object.entries(footerItems) as [FooterItemKey, IFooterItems[FooterItemKey]][])"
          :key="key"
          class="flex flex-col gap-3"
        >
          <h2 class="text-sm font-bold font-uppercase mb-1 dark:text-white">
            {{ item.title }}
          </h2>
          <div>
            <p
              v-for="(page, index) in item.pages"
              :key="index"
              class="text-sm font-medium cursor-pointer text-customBlack/70 hover:underline dark:text-white/70"
            >
              {{ page }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <!-- Desktop Copyright -->
    <div v-if="!isMobile" class="flex items-center justify-between">
      <p class="text-customBlack/70 dark:text-white/70 text-xs">
        Momtabare © 2024 ყველა უფლება დაცულია.
      </p>
      <img alt="usaid" class="h-16" src="../assets/img/USAID.png"/>
    </div>
  </footer>
</template>
