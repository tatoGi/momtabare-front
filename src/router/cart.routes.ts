const cartRoutes = [
  {
    path: "/cart",
    name: "cart",
    component: () => import("@/views/cart/CartView.vue"),
  },
  {
    path: "/checkout",
    name: "checkout",
    component: () => import("@/views/cart/CheckoutView.vue"),
  },
]

export default cartRoutes
