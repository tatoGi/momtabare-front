import { createApp } from "vue";
import "./index.css";
import "./responsive.css";
import App from "./App.vue";
import { Plugins } from "./plugins";
import router from "./router";
import clickOutside from "./directives/clickOutside";

const app = createApp(App);

// Register plugins
Plugins.registerPlugins(app);

// Register global directives
app.directive('click-outside', clickOutside);

// Use router
app.use(router);

app.mount("#app");
