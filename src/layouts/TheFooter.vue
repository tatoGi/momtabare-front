<script lang="ts" setup>
import momtabareLogoWithTextDark from "@/assets/svg/momtabare-logo-with-text-dark.svg"
import momtabareLogoWithTextLight from "@/assets/svg/momtabare-logo-with-text.svg"
import BaseButton from "@/components/base/BaseButton.vue"
import {footerItems} from "@/constants/footer.ts"
import {useAppStore} from "@/pinia/app.pinia.ts"

const appStore = useAppStore()
</script>

<template>
  <footer class="py-10 flex flex-col border-t">
    <div class="flex flex-col justify-between gap-12 mb-16">
      <div class="flex items-center justify-between gap-4">
        <div class="flex flex-col gap-2">
          <img
              :src="
              appStore.darkMode
                ? momtabareLogoWithTextDark
                : momtabareLogoWithTextLight
            "
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

      <div class="flex gap-44">
        <div v-for="footerItem in footerItems" class="flex flex-col gap-3">
          <h2 class="text-sm font-bold font-uppercase mb-1 dark:text-white">
            {{ footerItem.title }}
          </h2>
          <p
              v-for="page in footerItem.pages"
              class="text-sm font-medium cursor-pointer text-customBlack/70 hover:underline dark:text-white/70"
          >
            {{ page }}
          </p>
        </div>
      </div>
    </div>
    <div class="flex items-center justify-between">
      <p class="text-customBlack/70 dark:text-white/70 text-xs">
        Momtabare © 2024 ყველა უფლება დაცულია.
      </p>
      <img alt="usaid" class="h-16" src="../assets/img/USAID.png"/>
    </div>
  </footer>
</template>
