const userRoutes = [
  {
    path: "/user",
    name: "user",
    component: () => import("@/views/user/UserView.vue"),
  },
  {
    path: "/user/orders",
    name: "user-orders",
    component: () => import("@/views/user/UserOrdersView.vue"),
  },
  {
    path: "/user/info",
    name: "user-info",
    component: () => import("@/views/user/UserInfoView.vue"),
  },
  {
    path: "/user/credit-cards",
    name: "user-credit-cards",
    component: () => import("@/views/user/UserCreditCardsView.vue"),
  },
  {
    path: "/user/addresses",
    name: "user-addresses",
    component: () => import("@/views/user/UserAddressesView.vue"),
  },
]

export default userRoutes
