declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue' {
  export * from '@vue/runtime-dom'
  
  // Composition API
  export const ref: typeof import('@vue/reactivity').ref
  export const computed: typeof import('@vue/reactivity').computed
  export const reactive: typeof import('@vue/reactivity').reactive
  export const watch: typeof import('@vue/runtime-core').watch
  export const watchEffect: typeof import('@vue/runtime-core').watchEffect
  export const onMounted: typeof import('@vue/runtime-core').onMounted
  export const onUnmounted: typeof import('@vue/runtime-core').onUnmounted
  export const onUpdated: typeof import('@vue/runtime-core').onUpdated
  export const onBeforeMount: typeof import('@vue/runtime-core').onBeforeMount
  export const onBeforeUnmount: typeof import('@vue/runtime-core').onBeforeUnmount
  export const onBeforeUpdate: typeof import('@vue/runtime-core').onBeforeUpdate
  export const defineComponent: typeof import('@vue/runtime-core').defineComponent
  
  // Types
  export type Ref<T = any> = import('@vue/reactivity').Ref<T>
  export type ComputedRef<T = any> = import('@vue/reactivity').ComputedRef<T>
  export type UnwrapRef<T> = import('@vue/reactivity').UnwrapRef<T>
  export type MaybeRef<T> = import('@vue/reactivity').MaybeRef<T>
  
  // Additional exports from @vue/runtime-dom
  export * from '@vue/runtime-dom'
}
