import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: {
      key?: string;
      storage?: Storage;
      paths?: string[];
    };
  }
}

export const ELanguages = {
  KA: 'ka',
  EN: 'en',
} as const;

export type ELanguage = typeof ELanguages[keyof typeof ELanguages];

export const useAppStore = defineStore('app', () => {
  // State
  const language = ref<ELanguage>(ELanguages.KA);
  const isDarkMode = ref(false);
  const isMobileMenuOpen = ref(false);
  const isMobileAuthOpen = ref(false);
  const isMobileSearchOpen = ref(false);

  // Getters
  const isEnglish = computed(() => language.value === ELanguages.EN);
  const isGeorgian = computed(() => language.value === ELanguages.KA);

  // Actions
  function setLanguage(lang: ELanguage) {
    language.value = lang;
    document.documentElement.lang = lang;
    localStorage.setItem('language', lang);
  }

  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value;
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(isDarkMode.value));
  }

  function toggleMobileMenu(open?: boolean) {
    if (typeof open === 'boolean') {
      isMobileMenuOpen.value = open;
    } else {
      isMobileMenuOpen.value = !isMobileMenuOpen.value;
    }
    
    // Prevent body scroll when mobile menu is open
    if (isMobileMenuOpen.value) {
      document.body.classList.add('mobile-nav-open');
    } else {
      document.body.classList.remove('mobile-nav-open');
    }
  }

  function toggleMobileAuth(open?: boolean) {
    if (typeof open === 'boolean') {
      isMobileAuthOpen.value = open;
    } else {
      isMobileAuthOpen.value = !isMobileAuthOpen.value;
    }
  }

  function toggleMobileSearch(open?: boolean) {
    if (typeof open === 'boolean') {
      isMobileSearchOpen.value = open;
    } else {
      isMobileSearchOpen.value = !isMobileSearchOpen.value;
    }
  }

  // Initialize from localStorage
  function initialize() {
    // Initialize language
    const savedLanguage = localStorage.getItem('language') as ELanguage;
    if (savedLanguage && Object.values(ELanguages).includes(savedLanguage)) {
      language.value = savedLanguage;
    } else {
      // Default to browser language or Georgian
      const browserLang = navigator.language.split('-')[0];
      language.value = Object.values(ELanguages).includes(browserLang as ELanguage)
        ? (browserLang as ELanguage)
        : ELanguages.KA;
    }
    document.documentElement.lang = language.value;

    // Initialize dark mode
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      isDarkMode.value = savedDarkMode === 'true';
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      isDarkMode.value = true;
    }
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark');
    }
  }

  return {
    // State
    language,
    isDarkMode,
    isMobileMenuOpen,
    isMobileAuthOpen,
    isMobileSearchOpen,
    
    // Getters
    isEnglish,
    isGeorgian,
    
    // Actions
    setLanguage,
    toggleDarkMode,
    toggleMobileMenu,
    toggleMobileAuth,
    toggleMobileSearch,
    initialize,
  };
}, {
  persist: {
    key: 'app-store',
    storage: localStorage,
    paths: ['language', 'isDarkMode'],
  },
});

export default useAppStore;