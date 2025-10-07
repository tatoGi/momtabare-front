import cartRoutes from "./cart.routes"
import productRoutes from "./product.routes"
import retailerRoutes from "./retailer.routes"
import userRoutes from "./user.routes"
import { paymentRoutes } from "./payment.routes"
import { createRouter, createWebHistory } from "vue-router"
import HomeView from '../views/home/HomeView.vue'
import FAQView from '../views/faq/FAQView.vue'
import FavoriteProductsView from '../views/product/FavoriteProductsView.vue'
import BlogView from '../views/blog/BlogView.vue'
import RoutesView from '../views/routes/RoutesView.vue'
import MyListingsView from '../views/user/MyListingsView.vue'
import ChatView from '../views/ChatView.vue'
import { getEnglishRoutePath, isGeorgianSlug } from '@/services/slugs'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import '@/assets/css/nprogress-custom.css'

// Configure NProgress
NProgress.configure({
  easing: 'ease',
  speed: 500,
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.3
})

// Import user store
import { useUserStore } from '@/pinia/user.pinia'

// Authentication guard

// Helper function to load page data before entering route
async function loadPageDataBeforeEnter(to: any, _from: any, next: any) {
  // Import loading store dynamically to avoid circular dependencies
  const { useLoadingStore } = await import('@/pinia/loading.pinia')
  const loadingStore = useLoadingStore()

  try {
    // Show loading state
    const routeName = to.name
    const pageNames: Record<string, string> = {
      'home': 'მთავარი გვერდი',
      'blog': 'ბლოგი',
      'routes': 'მარშუტები',
      'faq': 'ხშირად დასმული კითხვები'
    }
    loadingStore.showPageLoading(pageNames[routeName] || 'გვერდი')

    // Get the route name to determine which page to load

    // First, get all pages from backend to find the correct slug
    const { getAllPages } = await import('@/services/pages')
    const allPages = await getAllPages()

    if (!allPages || allPages.length === 0) {
      console.warn('⚠️ No pages data available from backend')
      next()
      return
    }

    // Find page by matching route name with page slug in any locale
    let targetPage = null

    // Define route name to expected slug mappings (flexible matching)
    const routeSlugMappings: Record<string, string[]> = {
      'home': ['home', 'მთავარი', 'main', 'index'],
      'blog': ['blog', 'ბლოგი', 'blogs'],
      'routes': ['routes', 'მარშუტები', 'tours', 'travel'],
      'faq': ['faq', 'ხშირად-დასმული-კითხვები', 'questions']
    }

    // Get possible slugs for this route
    const possibleSlugs = routeSlugMappings[routeName] || [routeName]

    // Search through all pages to find a match
    for (const page of allPages) {
      for (const translation of page.translations) {
        if (possibleSlugs.includes(translation.slug.toLowerCase())) {
          targetPage = page

          break
        }
      }
      if (targetPage) break
    }

    // If no exact match, try to find by route name similarity
    if (!targetPage) {
      for (const page of allPages) {
        for (const translation of page.translations) {
          if (translation.slug.toLowerCase().includes(routeName.toLowerCase()) ||
              routeName.toLowerCase().includes(translation.slug.toLowerCase())) {
            targetPage = page
            break
          }
        }
        if (targetPage) break
      }
    }

    if (targetPage) {
      to.meta.pageData = targetPage
    }

    // Hide loading state on success
    loadingStore.hidePageLoading()
  } catch (error) {
    console.error('❌ Error loading page data:', error)
    loadingStore.setError('გვერდის ჩატვირთვისას მოხდა შეცდომა')
  }

  next()
}

const router = createRouter({
  scrollBehavior() {
    return { top: 0 }
  },
  history: createWebHistory(),
  routes: [
    { 
      path: "/",
      name: "root",
      component: HomeView,
      beforeEnter: loadPageDataBeforeEnter
    },

    // Backend page routes - both Georgian and English slugs
    {
      path: "/home",
      name: "home",
      component: HomeView,
      alias: ["/მთავარი"], // Georgian alias
      beforeEnter: loadPageDataBeforeEnter
      // No requiresAuth - home page should be accessible to everyone
    },
    { 
      path: "/blog",
      name: "blog",
      component: BlogView,
      alias: ["/ბლოგი"], // Georgian alias
      beforeEnter: loadPageDataBeforeEnter,
      meta: {
        title: 'ბლოგი'
      }
    },
    {
      path: "/routes",
      name: "routes",
      component: RoutesView,
      alias: ["/მარშუტები"], // Georgian alias
      beforeEnter: loadPageDataBeforeEnter,
      meta: {
        title: 'მარშუტები'
      }
    },
    {
      path: "/faq",
      name: "faq",
      component: FAQView,
      beforeEnter: loadPageDataBeforeEnter
    },

    // Static routes
    {
      path: "/favorite",
      name: "favorite",
      component: FavoriteProductsView,
    },
    {
      path: "/blog/:slug",
      name: "blog-show",
      component: () => import('@/views/blog/BlogShow.vue'),
      beforeEnter: loadPageDataBeforeEnter,
      meta: {
        title: 'ბლოგის დეტალები'
      }
    },
    {
      path: '/my-listings',
      name: 'my-listings',
      component: MyListingsView,
      meta: {
        requiresAuth: true,
        title: 'ჩემი განცხადებები'
      }
    },

    // Chat routes
    {
      path: '/chat',
      name: 'chat',
      component: ChatView,
      meta: {
        title: 'ჩატი'
      }
    },
    {
      path: '/chat/:userId',
      name: 'chat-with-user',
      component: ChatView,
    },

    // Authentication is handled through header modal
    {
      path: '/payment/success',
      name: 'payment-success',
      component: () => import('@/views/PaymentStatusView.vue'),
      meta: {
        layout: 'default',
        title: 'Payment Successful'
      }
    },
    {
      path: '/payment/fail',
      name: 'payment-fail',
      component: () => import('@/views/PaymentStatusView.vue'),
      meta: {
        layout: 'default',
        title: 'Payment Failed'
      }
    },

    // User routes (authenticated)
    ...userRoutes,
    ...retailerRoutes,
    ...productRoutes,
    ...cartRoutes,
    ...paymentRoutes, // Add payment routes outside locale prefixes
  ],
})

// Navigation guard to handle authentication, Georgian URLs and loading progress
router.beforeEach(async (to, _from, next) => {
  // Start NProgress loading bar
  NProgress.start()

  // Initialize auth silently without redirects
  const userStore = useUserStore()
  if (!userStore.initialized) {
    try {
      await userStore.initializeAuth()
    } catch (error) {
      console.error('❌ Error initializing auth:', error)
    }
  }

  // Get the path without leading slash
  const slug = to.path.startsWith('/') ? to.path.slice(1) : to.path

  // If this is a Georgian slug, redirect to English equivalent
  if (slug && isGeorgianSlug(slug)) {
    try {
      const englishPath = await getEnglishRoutePath(to.path)

      // Only redirect if we got a different path (successful conversion)
      if (englishPath !== to.path) {
        console.log(`🔄 Redirecting Georgian URL: ${to.path} → ${englishPath}`)
        return next(englishPath)
      } else {
        console.warn(`⚠️ No mapping found for Georgian slug: ${slug}`)
      }
    } catch (error) {
      console.error('❌ Error converting Georgian slug:', error)
      // Continue with original path if conversion fails
    }
  }

  next()
})

// Finish loading progress after navigation
router.afterEach(() => {
  NProgress.done()
})

export default router
