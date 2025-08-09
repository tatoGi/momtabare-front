declare module 'vue-top-progress' {
  import { App } from 'vue'
  
  interface VueTopProgressOptions {
    color?: string
    height?: string
    duration?: number
  }
  
  const VueTopProgress: {
    install(app: App, options?: VueTopProgressOptions): void
  }
  
  export default VueTopProgress
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $topProgress: {
      start(): void
      finish(): void
      fail(): void
    }
  }
}
