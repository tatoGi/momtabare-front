<script lang="ts" setup>
import momtabareLogoWithTextDark from "@/assets/svg/momtabare-logo-with-text-dark.svg"
import momtabareLogoWithTextLight from "@/assets/svg/momtabare-logo-with-text.svg"
import {Switch} from "@/components/ui/switch"
import {INavItem} from "@/ts/layout.types.ts"
import {useAppStore} from "@/pinia/app.pinia.ts"
import {useRoute, useRouter} from "vue-router"
import {ref, watch} from "vue"
import {useI18n} from "vue-i18n"
import {ELanguages} from "@/ts/pinia/app.types.ts";


const router = useRouter()
const route = useRoute()
const {locale} = useI18n()

const appStore = useAppStore()

const navItems: INavItem[] = [
  {title: "მთავარი", route: "/home"},
  {title: "იქირავე", route: "/retailers"},
  {title: "FAQ", route: "/faq"},
]

const languages = ref<string[]>(["GEO", "ENG"])
const chosenLanguage = ref<string>("GEO")

function moveToPage(route: string): void {
  router.push(route)
}

watch(chosenLanguage, () => {
  if (chosenLanguage.value == 'GEO') {
    locale.value = 'ge'
    appStore.setLanguage(ELanguages.KA)
    return
  }

  appStore.setLanguage(ELanguages.EN)
  locale.value = 'en';
})

</script>

<template>
  <header class="grid grid-cols-3 items-center justify-between">
    <img
        :src="
        appStore.darkMode
          ? momtabareLogoWithTextDark
          : momtabareLogoWithTextLight
      "
        alt="Momtabare"
        class="cursor-pointer"
        @click.left="moveToPage('/home')"
    />

    <nav class="flex justify-center">
      <ul class="align-center flex gap-7 text-sm">
        <li
            v-for="navItem in navItems"
            :key="navItem.title + 1"
            :class="
            route.path === navItem.route
              ? 'bg-customRed/10'
              : 'hover:bg-customGrey dark:hover:bg-white/10'
          "
            class="flex-center h-9 cursor-pointer rounded-3xl px-6 transition-all"
            @click="moveToPage(navItem.route)"
        >
          <p
              :class="
              route.path === navItem.route
                ? 'text-customRed dark:text-customRed'
                : 'dark:text-white'
            "
              class="text-sm font-semibold transition-all"
          >
            {{ navItem.title }}
          </p>
        </li>
      </ul>
    </nav>

    <div class="flex items-center justify-end gap-6">
      <!--      <div-->
      <!--          v-for="language in languages"-->
      <!--          :class="chosenLanguage == language ? 'bg-customRed text-white' : 'bg-customGrey'"-->
      <!--          class="flex-center h-10 w-24 cursor-pointer gap-1 rounded-3xl dark:bg-customDarkGrey"-->
      <!--          @click="() => chosenLanguage = language"-->
      <!--      >-->
      <!--        <BaseIcon-->
      <!--            :class="chosenLanguage == language ? ' text-white' : 'text-customBlack/70'"-->
      <!--            :size="24"-->
      <!--            :weight="300"-->
      <!--            class="font-light  dark:text-white/70"-->
      <!--            name="language"-->
      <!--        />-->
      <!--        <p :class="chosenLanguage == language ? ' text-white' : 'text-customBlack/70'"-->
      <!--           class="text-sm font-semibold  dark:text-white/70">-->
      <!--          {{ language }}-->
      <!--        </p>-->
      <!--      </div>-->

      <Switch
          :checked="appStore.darkMode"
          class="cursor-pointer"
          @update:checked="appStore.toggleTheme"
      />
    </div>
  </header>
</template>
