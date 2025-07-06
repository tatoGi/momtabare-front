import type {App} from "vue"
import router from "../router"
import {createPinia} from "pinia"
import {Calendar, DatePicker, setupCalendar} from 'v-calendar';
import 'v-calendar/style.css';
import i18n from "../i18n/i18n";

export class Plugins {
    static app: App

    static registerPlugins = (app: App): void => {
        this.app = app
        app.use(router)
        app.use(createPinia())
        app.use(setupCalendar, {})
        app.use(i18n)

        app.component('VCalendar', Calendar)
        app.component('VDatePicker', DatePicker)
    }
}
