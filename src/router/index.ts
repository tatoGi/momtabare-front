import cartRoutes from "./cart.routes"
import productRoutes from "./product.routes"
import retailerRoutes from "./retailer.routes"
import userRoutes from "./user.routes"
import { createRouter, createWebHistory } from "vue-router"
import HomeView from '../views/home/HomeView.vue'
import FAQView from '../views/faq/FAQView.vue'
import FavoriteProductsView from '../views/product/FavoriteProductsView.vue'
import BlogView from '../views/blog/BlogView.vue'
import RoutesView from '../views/routes/RoutesView.vue'

const router = createRouter({
  scrollBehavior() {
    return { top: 0 }
  },
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/home" },
    
    // Backend page routes - both Georgian and English slugs
    {
      path: "/home",
      name: "home",
      component: HomeView,
      alias: ["/მთავარი"] // Georgian alias
    },
    {
      path: "/blog",
      name: "blog",
      component: BlogView,
      alias: ["/ბლოგი"], // Georgian alias
      meta: {
        title: 'ბლოგი'
      }
    },
    {
      path: "/routes",
      name: "routes",
      component: RoutesView,
      alias: ["/მარშუტები"], // Georgian alias
      meta: {
        title: 'მარშუტები'
      }
    },
    {
      path: "/faq",
      name: "faq",
      component: FAQView,
    },
    
    // Static routes
    {
      path: "/favorite",
      name: "favorite",
      component: FavoriteProductsView,
    },
    {
      path: "/blog/:id",
      name: "blog-show",
      component: () => import('@/views/blog/BlogShow.vue'),
      meta: {
        title: 'ბლოგის დეტალები'
      }
    },
    
    ...userRoutes,
    ...retailerRoutes,
    ...productRoutes,
    ...cartRoutes,
  ],
})

export default router
