import type { IAppState } from "../ts/pinia/app.types"
import { ELanguages } from "../ts/pinia/app.types"
import {defineStore} from "pinia"
import { syncLocale } from '@/services/languages'

export const useAppStore = defineStore("app", {
    state: (): IAppState => ({
        language: ELanguages.KA,
        darkMode: false,
    }),
    actions: {
        toggleTheme() {
            this.darkMode = !this.darkMode

            if (this.darkMode) {
                localStorage.setItem("theme", "dark")
                return
            }

            localStorage.removeItem("theme")
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
