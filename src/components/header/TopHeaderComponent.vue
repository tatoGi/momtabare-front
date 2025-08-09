<script lang="ts" setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/pinia/app.pinia.ts";
import { ELanguages } from "@/ts/pinia/app.types.ts";
import momtabareLogoWithTextDark from "@/assets/svg/momtabare-logo-with-text-dark.svg";
import momtabareLogoWithTextLight from "@/assets/svg/momtabare-logo-with-text.svg";
import ukFlagIcon from '@/assets/img/uk-flag.svg';
import globeIcon from '@/assets/img/Vector.svg';
import { useNavigation } from '@/composables/useNavigation';
import { getOppositeSlug, isGeorgianSlug } from '@/services/slugs';

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

const isMenuOpen = ref(false)

const props = defineProps({
  isMobileNavOpen: Boolean
})

const emit = defineEmits(['toggleMobileNav'])

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  document.body.style.overflow = isMenuOpen.value ? 'hidden' : ''
}

// Watch for changes to isMobileNavOpen prop
watch(() => props.isMobileNavOpen, (newVal) => {
  isMenuOpen.value = newVal
  document.body.style.overflow = newVal ? 'hidden' : ''
})

// Use dynamic navigation from backend
const { rootNavigationItems } = useNavigation();

const languages = [
  { code: 'GEO', label: 'GEO', icon: globeIcon },
  { code: 'ENG', label: 'ENG', icon: ukFlagIcon },
]

// Initialize language from app store
const chosenLanguage = ref(appStore.language === ELanguages.KA ? 'GEO' : 'ENG')
const showLangDropdown = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

function toggleLangDropdown(event: MouseEvent) {
  event.stopPropagation();
  showLangDropdown.value = !showLangDropdown.value;
}

function selectLanguage(lang: string) {
  chosenLanguage.value = lang;
  showLangDropdown.value = false;
}

// Track if we're in the process of navigation
const isNavigating = ref(false);

// Get dynamic home path based on current language
function getHomePath(): string {
  return '/home' // Always use English path for routing
}

// Handle click outside to close dropdown
const handleClickOutside = (event: MouseEvent) => {
  if (showLangDropdown.value && dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showLangDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  
  // Initialize i18n locale from app store
  locale.value = appStore.language === ELanguages.KA ? 'ka' : 'en'
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

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

// Handle language route updates for pages
async function handleLanguageRouteUpdate(newLocale: string) {
  // Get current path without leading slash
  const currentPath = route.path
  const currentSlug = currentPath.startsWith('/') ? currentPath.slice(1) : currentPath
  
  // Skip if we're on root path or empty slug
  if (!currentSlug || currentSlug === '') {
    return
  }
  
  try {
    // For language switching, we always navigate to English paths
    // The router will handle Georgian URLs via the navigation guard
    let targetPath = currentPath
    
    // If current path is Georgian, convert to English
    if (isGeorgianSlug(currentSlug)) {
      const englishSlug = await getOppositeSlug(currentSlug)
      targetPath = `/${englishSlug}`
    }
    
    // Navigate to the English path (router aliases will handle display)
    if (targetPath !== currentPath) {
      console.log(`Language switch: ${currentPath} → ${targetPath}`)
      await router.push(targetPath)
    }
  } catch (error) {
    console.error('Error handling language route update:', error)
  }
}

// Watch for app store language changes to keep UI in sync
watch(() => appStore.language, (newLanguage) => {
  chosenLanguage.value = newLanguage === ELanguages.KA ? 'GEO' : 'ENG'
  locale.value = newLanguage === ELanguages.KA ? 'ka' : 'en'
})

watch(chosenLanguage, async () => {
  const newLocale = chosenLanguage.value === 'GEO' ? 'ka' : 'en'
  
  // Update app store and i18n locale
  if (chosenLanguage.value === 'GEO') {
    appStore.setLanguage(ELanguages.KA)
  } else {
    appStore.setLanguage(ELanguages.EN)
  }
  locale.value = newLocale
  
  // Handle route update for pages
  await handleLanguageRouteUpdate(newLocale)
})

</script>

<template>
  <header class="flex items-center justify-between  py-2 md:grid md:grid-cols-4 container">
    <img
        :src="
        appStore.darkMode
          ? momtabareLogoWithTextDark
          : momtabareLogoWithTextLight
      "
        alt="Momtabare"
        class="cursor-pointer h-8 md:h-auto"
        @click.left="moveToPage(getHomePath())"
    />

    <!-- Desktop Navigation -->
    <nav class="hidden md:flex justify-center md:justify-start md:col-span-2">
      <ul class="flex items-center gap-4 md:gap-10">
        <li
            v-for="navItem in rootNavigationItems"
            :key="navItem.id"
            :class="
            route.path === navItem.path || 
            (navItem.path === '/home' && route.path === '/')
              ? 'bg-customRed/10'
              : 'hover:bg-customGrey dark:hover:bg-white/10'
          "
            class="flex-center h-9 cursor-pointer rounded-3xl px-6 transition-all"
            @click="moveToPage(navItem.path)"
        >
          <p
              :class="
              route.path === navItem.path || 
              (navItem.path === '/home' && route.path === '/')
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
          @click.stop
        >
          <button
            v-for="lang in languages.filter(l => l.code !== chosenLanguage)"
            :key="lang.code"
            class="flex-center h-10 w-24 gap-1 rounded-3xl bg-[#F8F8F8] hover:bg-gray-100 transition-all"
            @click.stop="selectLanguage(lang.code)"
          >
            <img :src="lang.icon" alt="lang icon" class="w-5 h-5" />
            <span class="text-sm font-semibold">{{ lang.label }}</span>
          </button>
        </div>
      </div>
      <Switch
        :checked="appStore.darkMode"
        class="cursor-pointer modeswitch"
        @update:checked="appStore.toggleTheme"
      />
    </div>
  </header>
</template>
