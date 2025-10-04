<script lang="ts" setup>
import { ref, onMounted, watch } from "vue"
import TheFooter from "@/layouts/TheFooter.vue"
import TheHeader from "@/layouts/TheHeader.vue"
import AppSkeleton from "@/components/skeletons/AppSkeleton.vue"
import { useAppStore } from "@/pinia/app.pinia.ts"
import { useCartStore } from "@/pinia/cart.pinia.ts"
import { useCategoryStore } from "@/pinia/category.pinia"
import { useOrderStore } from "@/pinia/order.pinia"

const appStore = useAppStore()
const categoryStore = useCategoryStore()
const cartStore = useCartStore()
const orderStore = useOrderStore()

const isLoading = ref(true)

onMounted(async () => {
  const theme = localStorage.getItem("theme")

  if (theme) {
    appStore.darkMode = true
  }
  
  try {
    // Run all initial data fetching in parallel
    await Promise.all([
      categoryStore.fetchCategories(),
      cartStore.fetchCart(),
      orderStore.fetchOrders()
    ])
  } catch (error) {
    console.error("Error initializing app:", error)
  } finally {
    // Always set loading to false when done
    isLoading.value = false
  }
})

watch(
  () => appStore.darkMode,
  (isDarkMode: boolean) => {
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
      <template v-if="isLoading">
        <AppSkeleton />
      </template>
      <template v-else>
        <TheHeader />
        <RouterView v-slot="{ Component }">
          <Suspense>
            <component :is="Component" :key="$route.fullPath" />
            <template #fallback>
              <AppSkeleton />
            </template>
          </Suspense>
        </RouterView>
        <TheFooter />
      </template>
    </main>
  </div>
</template>
