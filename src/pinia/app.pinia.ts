import {ELanguages, IAppState} from "../ts/pinia/app.types.ts"
import {defineStore} from "pinia"

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
        setLanguage(language: ELanguages.KA) {
            this.language = language
        },
    },
    getters: {
        getLanguage(state: IAppState): IAppState["language"] {
            return state.language
        },
    },
})
