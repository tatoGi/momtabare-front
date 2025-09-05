import { createApp } from "vue";
import "./index.css";
import "./responsive.css";
import App from "./App.vue";
import { Plugins } from "./plugins";
import clickOutside from "./directives/clickOutside";
import VueTopProgress from 'vue-top-progress'
import { useUserStore } from './pinia/user.pinia'
import AxiosJSON from './utils/helpers/axios'

const app = createApp(App);

// Register plugins
Plugins.registerPlugins(app);

// Register global directives
app.directive('click-outside', clickOutside);

// Use vue-top-progress
app.use(VueTopProgress, {
  color: '#3b82f6', // Blue color to match your theme
  height: '3px',
  duration: 0.2
});

// Get user store
const userStore = useUserStore();

// Function to check auth status
const checkAuth = async () => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('user_auth_token');
  if (token) {
    // Set the token in axios defaults before making requests
    AxiosJSON.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    try {
      await userStore.fetchUser();
      console.log('User authenticated successfully');
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid tokens and auth headers
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_auth_token');
      delete AxiosJSON.defaults.headers.common['Authorization'];
      userStore.clearUser();
    }
  } else {
    console.log('No auth token found, user not authenticated');
  }
};

// Mount the app immediately for better perceived performance
app.mount("#app");

// Check auth status after initial render
setTimeout(checkAuth, 100);
