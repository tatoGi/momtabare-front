import { createApp } from "vue";
import "./index.css";
import "./responsive.css";
import App from "./App.vue";
import { Plugins } from "./plugins";
import clickOutside from "./directives/clickOutside";
import VueTopProgress from 'vue-top-progress'

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

app.mount("#app");
