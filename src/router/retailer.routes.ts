// Authentication guard for retailer routes
async function requireAuth(_to: any, _from: any, next: any) {
  const { useUserStore } = await import('@/pinia/user.pinia')
  const userStore = useUserStore()
      
  // Ensure authentication is initialized
  if (!userStore.initialized) {
    await userStore.initializeAuth()
  }
  
  // Check authentication status after initialization
  const isAuthenticated = userStore.authenticated
  const hasUser = userStore.user !== null
  
  // If not authenticated or no user data, redirect to home
  if (!isAuthenticated || !hasUser) {
    
    // Clear any invalid tokens
    userStore.clearAuth()
    
    // Redirect to home page
    next('/')
    return
  }
  next()
}

const retailerRoutes = [
  {
    path: "/retailer/:retailerId",
    name: "retailer",
    component: () => import("../views/retailer/RetailerView.vue"),
  },
  {
    path: "/retailers",
    name: "retailers",
    component: () => import("../views/retailer/RetailerListView.vue"),
  },
  {
    path: "/retailer-info",
    name: "retailerInfo",
    component: () => import("../views/retailer/RetailerInfoView.vue"),
    beforeEnter: requireAuth,
  },
  {
    path: "/add-retailer-product",
    name: "addRetailerProduct",
    component: () => import("../views/retailer/AddRetailerProductView.vue"),
  },
]

export default retailerRoutes
   