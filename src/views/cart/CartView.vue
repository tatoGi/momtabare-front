<script lang="ts" setup>
import BaseNoData from "@/components/base/BaseNoData.vue"
import CartDetailsComponent from "@/components/cart/CartDetailsComponent.vue"
import CartOwnerList from "@/components/cart/CartOwnerList.vue"
import { ICart } from "@/ts/models/cart.types.ts"
import { useCartStore } from "@/pinia/cart.pinia.ts"
import { computed, onMounted } from "vue"
import { useRouter } from "vue-router"

const cartStore = useCartStore()
const router = useRouter()

const cart = computed<ICart | null>(() => {
  return cartStore.getCart
})

onMounted(async () => {
  if (!cart.value || cart.value.length === 0) return
  await cartStore.fetchCart()
})
</script>

<template>
  <main>
    <div v-if="!cart || cart?.items.length < 1" class="flex-center py-44">
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
