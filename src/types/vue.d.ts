import { ComponentPublicInstance, FunctionalComponent } from 'vue'

declare module 'vue' {
  export * from '@vue/runtime-dom'
  
  // Add any missing types that your project needs
  export interface ComponentCustomProperties {}
  
  // Add any global components that should be available in all components
  export interface GlobalComponents {}
  
  // Add any custom types for template refs
  export interface ComponentCustomProps {}
  
  // Add any custom types for v-model
  export interface ComponentCustomOptions {}
  
  // Add any custom types for provide/inject
  export interface InjectionKey<T> extends Symbol {}
  
  // Add any custom types for app-level configurations
  export interface AppConfig {
    globalProperties: Record<string, any>
  }
}

// This allows TypeScript to understand .vue files
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
