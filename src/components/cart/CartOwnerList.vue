<script lang="ts" setup>
import CartOwnerItem from "@/components/cart/CartOwnerItem.vue"
import { ICartItem } from "@/ts/models/cart.types"
import { computed } from "vue"

const props = defineProps<{
  cartItems: ICartItem[]
}>()

const owners = computed(() => {
  const ownersMap = new Map()
  props.cartItems?.forEach((item) => {  
    const owner = item.product.product_owner
    if (!ownersMap.has(owner.id)) {
      ownersMap.set(owner.id, owner)
    }
  })
  return Array.from(ownersMap.values())
})

function getCartByOwner(ownerId: number): ICartItem[] {
  return props.cartItems.filter(
    (item) => item.product.product_owner.id === ownerId,
  )
}
</script>

<template>
  <div class="flex flex-col gap-5 w-full">
    <CartOwnerItem
      v-for="owner in owners"
      :owner="owner"
      :owner-cart="getCartByOwner(owner.id)"
    />
  </div>
</template>
