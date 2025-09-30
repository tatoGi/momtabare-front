<script lang="ts" setup>
import * as BaseNoData from "@/components/base/BaseNoData.vue"
import * as CartDetailsComponent from "@/components/cart/CartDetailsComponent.vue"
import * as CartOwnerList from "@/components/cart/CartOwnerList.vue"
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

    <div v-else class="flex gap-7 pt-9 pb-16">
      <CartOwnerList v-if="cart?.items" :cart-items="cart.items" />
      <CartDetailsComponent :cart="cart" />
    </div>
  </main>
</template>
