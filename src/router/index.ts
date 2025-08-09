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
import { getEnglishRoutePath, isGeorgianSlug } from '@/services/slugs'

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
            console.log(`✅ Found similar page for route '${routeName}' with slug '${translation.slug}'`)
            break
          }
        }
        if (targetPage) break
      }
    }
    
    if (targetPage) {
      to.meta.pageData = targetPage
      console.log('✅ Page data loaded for route:', routeName, targetPage)
    } else {
      console.warn('⚠️ No page data found for route:', routeName)
      console.log('📋 Available pages:', allPages.map(p => p.translations.map(t => t.slug)).flat())
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
    { path: "/", redirect: "/home" },
    
    // Backend page routes - both Georgian and English slugs
    {
      path: "/home",
      name: "home",
      component: HomeView,
      alias: ["/მთავარი"], // Georgian alias
      beforeEnter: loadPageDataBeforeEnter
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
    
    ...userRoutes,
    ...retailerRoutes,
    ...productRoutes,
    ...cartRoutes,
  ],
})

// Navigation guard to handle Georgian URLs
router.beforeEach(async (to, _from, next) => {
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

export default router
