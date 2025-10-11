<script lang="ts" setup>
import { ref, onMounted, watch } from "vue"
import TheFooter from "@/layouts/TheFooter.vue"
import TheHeader from "@/layouts/TheHeader.vue"
import AppSkeleton from "@/components/skeletons/AppSkeleton.vue"
import { Alert } from '@/components/ui/alert/'
import { CheckCircle } from "lucide-vue-next"
import { useAppStore } from "@/pinia/app.pinia.ts"
import { useCartStore } from "@/pinia/cart.pinia.ts"
import { useCategoryStore } from "@/pinia/category.pinia"
import { useOrderStore } from "@/pinia/order.pinia"

const appStore = useAppStore()
const categoryStore = useCategoryStore()
const cartStore = useCartStore()
const orderStore = useOrderStore()

const isLoading = ref(true)
const showSuccessAlert = ref(false)
const successMessage = ref("")

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

  // Listen for registration success events
  window.addEventListener('registration-success', (event: any) => {
    console.log("✅ Registration completed successfully!")
    
    successMessage.value = event.detail.message
    showSuccessAlert.value = true
    
    // Auto-hide the alert after 5 seconds
    setTimeout(() => {
      showSuccessAlert.value = false
      successMessage.value = ""
    }, 5000)
  })

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

    <!-- Global Success Alert -->
    <div v-if="showSuccessAlert" class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md mx-4">
      <Alert variant="success" class="animate-in fade-in-0 slide-in-from-top-2 duration-300">
        <div class="flex items-start gap-3">
          <CheckCircle class="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p class="font-medium">{{ successMessage }}</p>
            <p class="text-sm mt-1">თქვენ ახლა გადახვალთ მთავარ გვერდზე...</p>
          </div>
        </div>
      </Alert>
    </div>

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
