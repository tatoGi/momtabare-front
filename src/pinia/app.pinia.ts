import type { IAppState } from "../ts/pinia/app.types"
import { ELanguages } from "../ts/pinia/app.types"
import { defineStore } from "pinia"
import { ref, watch } from 'vue';
import { syncLocale } from '@/services/languages'

// Apply theme class to document
const applyThemeClass = (isDark: boolean) => {
  if (typeof document === 'undefined') return;
  
  if (isDark) {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
  }
};

export const useAppStore = defineStore("app", () => {
  // State
  const language = ref(ELanguages.KA);
  const darkMode = ref(false);

  // Initialize theme from localStorage or system preference
  const initTheme = () => {
    if (typeof window === 'undefined') return;
    
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      darkMode.value = true;
      localStorage.setItem('theme', 'dark');
    } else {
      darkMode.value = false;
      localStorage.setItem('theme', 'light');
    }
    
    applyThemeClass(darkMode.value);
  };

  // Initialize theme on store creation
  initTheme();

  // Watch for system theme changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        darkMode.value = e.matches;
        applyThemeClass(e.matches);
      }
    });
  }

  // Actions
  const toggleTheme = () => {
    darkMode.value = !darkMode.value;
    const theme = darkMode.value ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    applyThemeClass(darkMode.value);
    
    // Dispatch event for other components to listen to
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme } }));
  };

  const setLanguage = (newLanguage: ELanguages) => {
    language.value = newLanguage;
    // Fire-and-forget backend locale sync to keep session/app locale aligned
    try {
      const locale = newLanguage === ELanguages.KA ? 'ka' : 'en';
      // do not await to keep UI responsive
      void syncLocale(locale);
    } catch (e) {
      console.error('Error syncing locale:', e);
    }
  };

  return {
    // State
    language,
    darkMode,
    
    // Getters
    getLanguage: () => language.value,
    
    // Actions
    toggleTheme,
    setLanguage,
  };
});