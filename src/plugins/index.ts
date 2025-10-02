import { App as VueApp } from 'vue'
import { Calendar, DatePicker, setupCalendar } from 'v-calendar'
import 'v-calendar/style.css'
import i18n from "../i18n/i18n"

export class Plugins {
  static app: VueApp

  static registerPlugins = (app: VueApp): void => {
    this.app = app
    // Router is applied in main.ts to avoid double registration
    // Removed createPinia() - already initialized in main.ts with plugins
    app.use(setupCalendar, {})
    app.use(i18n)

    app.component('VCalendar', Calendar)
    app.component('VDatePicker', DatePicker)
  }
}
