// Type definitions for pinia-plugin-persistedstate
// This helps TypeScript find the type definitions for pinia-plugin-persistedstate

declare module 'pinia-plugin-persistedstate' {
  import { PiniaPluginContext } from 'pinia';
  
  export interface PersistedStateOptions {
    /**
     * Storage key to use
     * @default $store.id
     */
    key?: string | ((id: string) => string);
    
    /**
     * Where to store persisted state
     * @default localStorage
     */
    storage?: Storage;
    
    /**
     * Dot-notation paths to partially save state
     * @default undefined
     */
    paths?: string[];
    
    /**
     * Function to filter which mutations trigger persistence
     * @default () => true
     */
    filter?: (mutation: any) => boolean;
    
    /**
     * Function to serialize state before saving
     * @default JSON.stringify
     */
    serialize?: (state: any) => string;
    
    /**
     * Function to deserialize state before rehydrating
     * @default JSON.parse
     */
    deserialize?: (state: string) => any;
    
    /**
     * Hook called before state is rehydrated
     * @default null
     */
    beforeRestore?: (context: PiniaPluginContext) => void;
    
    /**
     * Hook called after state is rehydrated
     * @default undefined
     */
    afterRestore?: (context: PiniaPluginContext) => void;
    
    /**
     * Whether to persist state
     * @default true
     */
    persist?: boolean;
  }

  const piniaPersistedState: (context: PiniaPluginContext) => void;
  
  export default piniaPersistedState;
}
