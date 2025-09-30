import { createApp } from 'vue';
import './index.css';
import './responsive.css';
import App from './App.vue';
import { Plugins } from './plugins';
import clickOutside from './directives/clickOutside';
import VueTopProgress from 'vue-top-progress';
import { createPinia } from 'pinia';
import router from './router';
import { useAppStore } from '@/store/app';
import Toast from '@/components/ui/toast/Toast.vue';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const app = createApp(App);

// Initialize Pinia
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

// Initialize app store
const appStore = useAppStore();

// Initialize app settings
appStore.initialize();

// Use router
app.use(router);

// Register plugins
Plugins.registerPlugins(app);

// Register global components
app.component('Toast', Toast);

// Register global directives
app.directive('click-outside', clickOutside);

// Use vue-top-progress
app.use(VueTopProgress, {
  color: '#3b82f6',
  height: '3px',
  duration: 0.2
});

// Initialize authentication before mounting the app
async function initializeApp() {
  try {
    const { useUserStore } = await import('@/pinia/user.pinia');
    const userStore = useUserStore();

    console.log('🚀 Starting app initialization...')

    // Initialize authentication state
    await userStore.initializeAuth();

    // Mount the app after auth is initialized
    app.mount("#app");

    // Log initialization status for debugging
    console.log('✅ App initialized successfully')
    console.log('🔐 Authentication state:', {
      isAuthenticated: userStore.authenticated,
      isInitialized: userStore.initialized,
      hasUser: !!userStore.user,
      userId: userStore.user?.id
    });

  } catch (error) {
    console.error('❌ Failed to initialize app:', error);

    // Still mount the app even if auth initialization fails
    // This prevents the app from being completely broken
    app.mount("#app");

    console.log('⚠️ App mounted despite authentication error - user will need to log in manually')
  }
}

// Start the app initialization
initializeApp();
