import { createApp } from "vue";
import "./index.css";

import App from "./App.vue";
import { Plugins } from "./plugins";

const app = createApp(App);

Plugins.registerPlugins(app);

app.mount("#app");
