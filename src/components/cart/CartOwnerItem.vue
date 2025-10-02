<script lang="ts" setup>
import CartProductItem from "@/components/cart/CartProductItem.vue"
import {Checkbox} from "@/components/ui/checkbox"
import {ICartItem} from "@/ts/models/cart.types"
import type { IUser } from "@/ts/models/user-types"
import { getAssetUrl } from "@/utils/config/env"

defineProps<{
  ownerCart: ICartItem[]
  owner: IUser
  
}>()

function getAvatarUrl(avatar: string): string {
  if (!avatar) return ''
  
  // If avatar already has full URL, use it as is
  if (avatar.startsWith('http')) {
    return avatar
  }
  
  // Otherwise, construct URL using backend base URL
  return getAssetUrl(`/storage/${avatar}`)
}

function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0)?.toUpperCase() || ''
  const last = lastName?.charAt(0)?.toUpperCase() || ''
  return first + last
}
</script>

<template>
  <div
      class="border rounded-2xl border-customBlack/10 dark:border-white/10 w-full px-6 h-fit"
  >
    <section class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Checkbox default-checked/>

        <div class="flex items-center gap-2 py-4">
          <div
              class="border border-customBlack/10 dark:border-white/10 w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800"
          >
            <img 
              v-if="owner.avatar" 
              :src="getAvatarUrl(owner.avatar)" 
              :alt="owner.first_name"
              class="w-full h-full object-cover"
            />
            <div 
              v-else 
              class="w-full h-full flex items-center justify-center text-customRed font-bold text-sm"
            >
              {{ getInitials(owner.first_name, owner.surname || owner.last_name) }}
            </div>
          </div>
          <div class="flex flex-col gap-0.5">
            <h2 class="text-sm font-semibold dark:text-white">
              {{ owner.first_name }} {{ owner.surname || owner.last_name }}
            </h2>
            <p class="text-customBlack/70 dark:text-white/70 text-xs">
              შეფასება (9.1)
            </p>
          </div>
        </div>
      </div>
    </section>

    <div class="h-[1px] bg-customBlack/10 dark:bg-white/10"></div>

    <CartProductItem
        v-for="ownerCartItem in ownerCart"
        :id="ownerCartItem.id"
        v-model="ownerCartItem.quantity"
        :product="ownerCartItem.product"
        :rental_days="ownerCartItem.rental_days"
        :total_price="ownerCartItem.total_price"
    />
  </div>
</template>
