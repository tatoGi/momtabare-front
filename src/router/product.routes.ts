const productRoutes = [
  {
    path: "/products",
    name: "products",
    component: () => import("@/views/product/ProductsView.vue"),
  },
  {
    path: "/product/:productSku",
    name: "product",
    component: () => import("../views/product/ProductView.vue"),
  },
]

export default productRoutes
