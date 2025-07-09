<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Switch } from "@/components/ui/switch";
import { INavItem } from "@/ts/layout.types.ts";
import { useAppStore } from "@/pinia/app.pinia.ts";
import { ELanguages } from "@/ts/pinia/app.types.ts";
import momtabareLogoWithTextDark from "@/assets/svg/momtabare-logo-with-text-dark.svg";
import momtabareLogoWithTextLight from "@/assets/svg/momtabare-logo-with-text.svg";
import ukFlagIcon from '@/assets/img/uk-flag.svg';
import globeIcon from '@/assets/img/vector.svg';
// Simple confirmation dialog using browser's native confirm
async function showConfirmationDialog(options: {
  title: string;
  message: string;
}): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.confirm(`${options.title}\n\n${options.message}`);
}

const router = useRouter();
const route = useRoute();
const { locale } = useI18n();

const appStore = useAppStore()

const navItems: INavItem[] = [
  { title: "მთავარი", route: "/home" },
  { title: "ბლოგი", route: "/blog" },
  { title: "მარშუტები", route: "/routes" },
  { title: "FAQ", route: "/faq" },
]

const languages = [
  { code: 'GEO', label: 'GEO', icon: globeIcon },
  { code: 'ENG', label: 'ENG', icon: ukFlagIcon },
]
const chosenLanguage = ref('GEO')
const showLangDropdown = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

function toggleLangDropdown() {
  showLangDropdown.value = !showLangDropdown.value;
}

function selectLanguage(lang: string) {
  chosenLanguage.value = lang;
  showLangDropdown.value = false;
}

// Track if we're in the process of navigation
const isNavigating = ref(false);

async function moveToPage(routePath: string): Promise<void> {
  // Prevent multiple rapid clicks
  if (isNavigating.value) return;
  
  // Define targetPath in the function scope
  let targetPath = routePath.startsWith('/') ? routePath : `/${routePath}`;
  
  try {
    isNavigating.value = true;
    showLangDropdown.value = false;
    
    // Normalize paths for comparison
    const currentPath = route.path.endsWith('/') ? route.path.slice(0, -1) : route.path;
    const normalizedTargetPath = targetPath.endsWith('/') ? targetPath.slice(0, -1) : targetPath;
    
    // Don't navigate if we're already on the target path
    if (currentPath === normalizedTargetPath) {
      return;
    }
    
    // Show a confirmation dialog for certain routes if needed
    // You can add a meta field to your routes to require confirmation
    const shouldConfirm = route.meta?.requiresConfirmation;
    
    if (shouldConfirm) {
      try {
        const confirmed = await showConfirmationDialog({
          title: 'Confirm Navigation',
          message: 'Are you sure you want to leave this page?',
        });
        
        if (!confirmed) {
          return;
        }
      } catch (error) {
        console.error('Confirmation dialog error:', error);
        // Continue with navigation if there's an error with the dialog
      }
    }
    
    // Use router.push for SPA navigation
    await router.push(targetPath);
    
    // Scroll to top after navigation
    window.scrollTo(0, 0);
    
  } catch (error) {
    console.error('Navigation error:', error);
    // Fallback to full page navigation if SPA navigation fails
    if (typeof window !== 'undefined') {
      window.location.href = targetPath;
    }
  } finally {
    isNavigating.value = false;
  }
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
  <header class="grid grid-cols-3 items-center justify-between md:grid-cols-4">
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

    <nav class="flex justify-center md:justify-start md:col-span-2">
      <ul class="align-center flex gap-7 text-sm md:gap-10">
        <li
            v-for="navItem in navItems"
            :key="navItem.title + 1"
            :class="
            route.path === navItem.route || 
            (navItem.route === '/home' && route.path === '/')
              ? 'bg-customRed/10'
              : 'hover:bg-customGrey dark:hover:bg-white/10'
          "
            class="flex-center h-9 cursor-pointer rounded-3xl px-6 transition-all"
            @click="moveToPage(navItem.route)"
        >
          <p
              :class="
              route.path === navItem.route || 
              (navItem.route === '/home' && route.path === '/')
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
      <div class="relative">
        <button
          class="flex-center h-10 w-24 cursor-pointer gap-1 rounded-3xl bg-[#F8F8F8] border border-gray-200 shadow-sm transition-all"
          @click="toggleLangDropdown"
        >
          <img
            :src="languages.find(l => l.code === chosenLanguage)?.icon"
            alt="lang icon"
            class="w-5 h-5"
          />
          <span class="text-sm font-semibold">{{ chosenLanguage }}</span>
        </button>
        <div
          v-if="showLangDropdown"
          ref="dropdownRef"
          class="absolute left-0 top-12 z-10 w-24 bg-white border border-gray-200 rounded-3xl shadow-lg"
          v-click-outside="() => showLangDropdown = false"
        >
          <button
            v-for="lang in languages.filter(l => l.code !== chosenLanguage)"
            :key="lang.code"
            class="flex-center h-10 w-24 gap-1 rounded-3xl bg-[#F8F8F8] hover:bg-gray-100 transition-all"
            @click="selectLanguage(lang.code)"
          >
            <img :src="lang.icon" alt="lang icon" class="w-5 h-5" />
            <span class="text-sm font-semibold">{{ lang.label }}</span>
          </button>
        </div>
      </div>
      <Switch
        :checked="appStore.darkMode"
        class="cursor-pointer"
        @update:checked="appStore.toggleTheme"
      />
    </div>
  </header>
</template>
