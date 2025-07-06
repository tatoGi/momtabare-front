import cartRoutes from "./cart.routes.ts"
import productRoutes from "./product.routes.ts"
import retailerRoutes from "./retailer.routes.ts"
import userRoutes from "./user.routes.ts"
import { createRouter, createWebHistory } from "vue-router"

const router = createRouter({
  scrollBehavior() {
    return { top: 0 }
  },
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/home" },
    {
      path: "/home",
      name: "home",
      component: () => import("@/views/home/HomeView.vue"),
    },

    {
      path: "/faq",
      name: "faq",
      component: () => import("@/views/faq/FAQView.vue"),
    },
    {
      path: "/favorite",
      name: "favorite",
      component: () => import("../views/product/FavoriteProductsView.vue"),
    },
    ...userRoutes,
    ...retailerRoutes,
    ...productRoutes,
    ...cartRoutes,
  ],
})

export default router
