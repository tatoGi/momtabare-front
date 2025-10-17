<script lang="ts" setup>
import BaseNoData from "@/components/base/BaseNoData.vue"
import CartDetailsComponent from "@/components/cart/CartDetailsComponent.vue"
import CartOwnerList from "@/components/cart/CartOwnerList.vue"
import { ICart } from "@/ts/models/cart.types"
import { useCartStore } from "@/pinia/cart.pinia"
import { computed, onMounted } from "vue"
import { useUserStore } from "@/pinia/user.pinia"
import { useRouter } from "vue-router"

const cartStore = useCartStore()
const userStore = useUserStore()
const router = useRouter()

const cart = computed<ICart | null>(() => {
  return cartStore.getCart
})

const isAuthenticated = computed(() => userStore.authenticated)

onMounted(async () => {
  // Only fetch cart if authenticated
  if (isAuthenticated.value) {
    await cartStore.fetchCart()
  } else {
    cartStore.clearCart()
  }
})
</script>

<template>
  <main>
    <div v-if="!isAuthenticated || !cart || cart?.items.length < 1" class="flex-center py-44">
      <BaseNoData
        action_title="დაამატე პროდუქცია"
        description="ამ ეტაპზე თქვენი ზურგჩანთა ცარიელია"
        title="ზურგჩანთა ცარიელია"
        @action="router.push({ name: 'products' })"
      />
    </div>

    <div v-else class="flex flex-col lg:flex-row gap-4 lg:gap-7 pt-4 sm:pt-9 pb-8 sm:pb-16 px-3 sm:px-0">
      <CartOwnerList v-if="cart?.items" :cart-items="cart.items" />
      <CartDetailsComponent :cart="cart" />
    </div>
  </main>
</template>
