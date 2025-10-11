import type { IAppState } from "../ts/pinia/app.types"
import { ELanguages } from "../ts/pinia/app.types"
import {defineStore} from "pinia"
import { syncLocale } from '@/services/languages'

// Apply theme class to document
const applyThemeClass = (isDark: boolean) => {
  if (typeof document === 'undefined') return;
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const useAppStore = defineStore("app", {
    state: (): IAppState => {
        // Get theme from localStorage or system preference
        const prefersDark = typeof window !== 'undefined' && 
                          window.matchMedia && 
                          window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Check localStorage first, then system preference
        const savedTheme = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null;
        let darkMode = false;
        
        if (savedTheme === 'dark') {
            darkMode = true;
        } else if (savedTheme === 'light') {
            darkMode = false;
        } else {
            // If no saved preference, use system preference
            darkMode = prefersDark;
        }
        
        // Apply the theme to the document
        applyThemeClass(darkMode);
        
        return {
            language: ELanguages.KA,
            darkMode,
        };
    },
    actions: {
        toggleTheme() {
            // Toggle the dark mode state
            this.darkMode = !this.darkMode;
            
            // Save to localStorage
            if (this.darkMode) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
            
            // Apply the theme to the document
            applyThemeClass(this.darkMode);
            
            // Force a re-render of the component tree
            if (typeof window !== 'undefined') {
                // This ensures all components update with the new theme
                window.dispatchEvent(new Event('storage'));
            }
        },
        setLanguage(language: ELanguages) {
            this.language = language
            // Fire-and-forget backend locale sync to keep session/app locale aligned
            try {
                const locale = language === ELanguages.KA ? 'ka' : 'en'
                // do not await to keep UI responsive
                void syncLocale(locale)
            } catch {}
        },
    },
    getters: {
        getLanguage(state: IAppState): IAppState["language"] {
            return state.language
        },
    },
})
