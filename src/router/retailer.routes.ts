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
  },
  {
    path: "/add-retailer-product",
    name: "addRetailerProduct",
    component: () => import("../views/retailer/AddRetailerProductView.vue"),
  },
]

export default retailerRoutes
