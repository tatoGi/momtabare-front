// Simple guard to initialize auth without redirects
async function requireAuth(_to: any, _from: any, next: any) {
  const { useUserStore } = await import('@/pinia/user.pinia')
  const userStore = useUserStore()
  
  // Initialize auth without redirecting - let the header modal handle login
  if (!userStore.initialized) {
    await userStore.initializeAuth()
  }
  
  // Always allow access - the UI will handle showing login modal if needed
  next()
}

const userRoutes = [
  {
    path: "/user",
    name: "user",
    component: () => import("@/views/user/UserView.vue"),
    beforeEnter: requireAuth,
  },
  {
    path: "/user/orders",
    name: "user-orders",
    component: () => import("@/views/user/UserOrdersView.vue"),
    beforeEnter: requireAuth,
  },
  {
    path: "/user/info",
    name: "user-info",
    component: () => import("@/views/user/UserInfoView.vue"),
    beforeEnter: requireAuth,
  },
  {
    path: "/user/credit-cards",
    name: "user-credit-cards",
    component: () => import("@/views/user/UserCreditCardsView.vue"),
    beforeEnter: requireAuth,
  },
  {
    path: "/user/addresses",
    name: "user-addresses",
    component: () => import("@/views/user/UserAddressesView.vue"),
    beforeEnter: requireAuth,
  },
]

export default userRoutes
