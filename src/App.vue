<script lang="ts" setup>
import TheFooter from "@/layouts/TheFooter.vue"
import TheHeader from "@/layouts/TheHeader.vue"
import { useAppStore } from "@/pinia/app.pinia.ts"
import { useCartStore } from "@/pinia/cart.pinia.ts"
import { useCategoryStore } from "@/pinia/category.pinia"
import { useOrderStore } from "@/pinia/order.pinia"
import { useUserStore } from "@/pinia/user.pinia"
import { onMounted, watch } from "vue"

const appStore = useAppStore()
const userStore = useUserStore()
const categoryStore = useCategoryStore()
const cartStore = useCartStore()
const orderStore = useOrderStore()

onMounted(async () => {
  const theme = localStorage.getItem("theme")

  if (theme) {
    appStore.darkMode = true
  }

  await categoryStore.fetchCategories()
  await userStore.fetchUser()
  await cartStore.fetchCart()
  await orderStore.fetchOrders()
})

watch(
  () => appStore.darkMode,
  (isDarkMode) => {
    const html = document.documentElement
    if (isDarkMode) {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="py-6">
    <main class="max-w-[1360px] mx-auto flex-col">
      <TheHeader />
      
      <RouterView :key="$route.fullPath" />
      
      <TheFooter />
    </main>
  </div>
</template>
