<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/pinia/app.pinia.ts";

import TopHeaderComponent from "@/components/header/TopHeaderComponent.vue";
import BottomHeaderComponent from "@/components/header/BottomHeaderComponent.vue";
import ukFlagIcon from '@/assets/img/uk-flag.svg';
import globeIcon from '@/assets/img/Vector.svg';
import type { INavItem } from "@/ts/layout.types.ts";
import type { ICategory } from "@/types/category";
import categoriesData from "@/data/categories";

const isMobileNavOpen = ref(false);
const route = useRoute();
const router = useRouter();
const appStore = useAppStore();


const categories = ref<ICategory[]>(categoriesData);
const computedLanguage = computed(() => appStore.getLanguage);
const expandedCategories = ref<Set<number>>(new Set());

const navItems: INavItem[] = [
  { title: "მთავარი", route: "/home" },
  { title: "ბლოგი", route: "/blog" },
  { title: "მარშუტები", route: "/routes" },
  { title: "FAQ", route: "/faq" },
];

const languages = [
  { code: 'GEO', label: 'GEO', icon: globeIcon },
  { code: 'ENG', label: 'ENG', icon: ukFlagIcon },
];
const chosenLanguage = ref('GEO');
const showLangDropdown = ref(false);

const toggleMobileNav = () => {
  isMobileNavOpen.value = !isMobileNavOpen.value;
  // Prevent body scroll when mobile nav is open
  if (typeof document !== 'undefined') {
    document.body.style.overflow = isMobileNavOpen.value ? 'hidden' : '';
  }
};

function toggleLangDropdown(event: MouseEvent) {
  event.stopPropagation();
  showLangDropdown.value = !showLangDropdown.value;
}

function selectLanguage(lang: string) {
  chosenLanguage.value = lang;
  showLangDropdown.value = false;
}

async function moveToPage(routePath: string): Promise<void> {
  let targetPath = routePath.startsWith('/') ? routePath : `/${routePath}`;
  
  try {
    showLangDropdown.value = false;
    
    const currentPath = route.path.endsWith('/') ? route.path.slice(0, -1) : route.path;
    const normalizedTargetPath = targetPath.endsWith('/') ? targetPath.slice(0, -1) : targetPath;
    
    if (currentPath === normalizedTargetPath) {
      return;
    }
    
    await router.push(targetPath);
  } catch (error) {
    console.error('Navigation error:', error);
  }
}

function moveToCategory(category: ICategory): void {
  if (category.children?.length) return; // Don't navigate if category has children
  router.push(`/products?category=${category.slug}`);
  toggleMobileNav();
}

function toggleCategoryExpansion(categoryId: number): void {
  if (expandedCategories.value.has(categoryId)) {
    expandedCategories.value.delete(categoryId);
  } else {
    expandedCategories.value.add(categoryId);
  }
}
</script>

<template>
  <div class="flex flex-col gap-7">
    <TopHeaderComponent 
      :is-mobile-nav-open="isMobileNavOpen"
      @toggle-mobile-nav="toggleMobileNav"
    />
    <BottomHeaderComponent @toggle-mobile-nav="toggleMobileNav" />
    
    <!-- Mobile Navigation Overlay -->
    <div 
      v-if="isMobileNavOpen" 
      class="fixed inset-0 bg-black bg-opacity-0 z-40 md:hidden"
      @click="toggleMobileNav"
    >
      <div 
        class="fixed top-[150px] left-0 right-0 bottom-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg z-50 overflow-y-auto"
        @click.stop
      >
      <!-- Mobile Navigation Items -->
      <nav class="container py-4">
        <h2 class="text-lg font-semibold mb-3 text-gray-900 dark:text-white">navigation</h2>
        <ul class="grid grid-cols-1 gap-3">
          <li
            v-for="navItem in navItems"
            :key="navItem.title"
            class="w-full"
          >
            <button
              :class="[
                'w-full text-center p-4 rounded-xl transition-all font-medium',
                route.path === navItem.route || (navItem.route === '/home' && route.path === '/')
                  ? 'mobile-nav-active text-white shadow-md'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
              @click="moveToPage(navItem.route); toggleMobileNav()"
            >
              {{ navItem.title }}
            </button>
          </li>
        </ul>
      </nav>

      <!-- Mobile Categories Section -->
      <div class="border-t border-gray-200 dark:border-gray-700">
        <nav class="container py-4">
          <h3 class="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Categories</h3>
          <div class="grid grid-cols-1 gap-2">
            <div v-for="category in categories" :key="category.id" class="category-group">
              <button
                :class="[
                  'w-full flex items-center justify-between p-3 rounded-lg transition-all font-medium',
                  'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                ]"
                @click="category.children?.length ? toggleCategoryExpansion(category.id) : moveToCategory(category)"
              >
                <span class="text-left">{{ category.name[computedLanguage] }}</span>
                
                <!-- Dropdown Arrow for categories with children -->
                <svg
                  v-if="category.children?.length"
                  :class="[
                    'w-4 h-4 transition-transform ml-2',
                    expandedCategories.has(category.id) ? 'rotate-180' : ''
                  ]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- Subcategories -->
              <div v-if="category.children?.length && expandedCategories.has(category.id)" class="ml-4 mt-2 space-y-1">
                <button
                  v-for="subcategory in category.children"
                  :key="subcategory.id"
                  :class="[
                    'w-full text-left p-2 rounded-md transition-all text-sm',
                    'bg-gray-25 dark:bg-gray-750 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  ]"
                  @click="moveToCategory(subcategory)"
                >
                  {{ subcategory.name[computedLanguage] }}
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      </div>
    </div>
  </div>
</template>
