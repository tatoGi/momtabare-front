<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue"
import BaseIcon from "@/components/base/BaseIcon.vue"
import AuthDialog from "@/components/dialogs/AuthDialog.vue"
import HeaderProductMenu from "@/components/header/HeaderProductMenu.vue"
import HeaderSearchComponent from "@/components/header/HeaderSearchComponent.vue"
import {IUser} from "@/ts/models/user.types.js"
import {useUserStore} from "@/pinia/user.pinia.ts"
import {computed} from "vue"
import {useRoute, useRouter} from "vue-router"
import {useCartStore} from "@/pinia/cart.pinia.ts";

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const cartStore = useCartStore()

const user = computed<IUser>(() => userStore.user as IUser)
const cartItems = computed<number>(() => cartStore.getCartLength)

function routeToCart(): void {
  if (!userStore.getUser) {
    userStore.setAuthDialogState(true)
    return
  }
  router.push({name: "cart"})
}

function routeToFavorites(): void {
  if (!userStore.getUser) {
    userStore.setAuthDialogState(true)
    return
  }
  router.push({name: "favorite"})
}
</script>

<template>
  <header class="flex items-center justify-between">
    <HeaderProductMenu/>

    <HeaderSearchComponent/>

    <div class="flex items-center justify-end gap-8">
      <BaseIcon
          :size="24"
          class="cursor-pointer transition-all hover:text-customRed dark-white-text-hover"
          name="favorite"
          rounded
          @click.left="routeToFavorites"
      />
      <div class="relative">
        <BaseIcon
            :class="{
          'text-customRed': route.name === 'cart',
        }"
            :size="24"
            class="cursor-pointer transition-all hover:text-customRed dark-white-text-hover"
            name="shopping_bag"
            @click.left="routeToCart"
        />
        <div
            v-if="cartItems"
            class="absolute bg-customRed rounded-full w-5 h-5 items-center text-customGrey flex-center text-sm font-bold -top-2 -right-2">
          {{ cartItems }}
        </div>
      </div>

      <BaseButton
          v-if="user"
          :height="52"
          :width="52"
          class="rounded-full bg-customRed"
          @click.left="router.push('/user')"
      >
        <BaseIcon :size="24" class="text-white" name="account_circle"/>
      </BaseButton>

      <AuthDialog v-else>
        <BaseButton :height="48" :width="171" class="rounded-3xl bg-customRed">
          <p class="font-uppercase text-sm font-bold text-white">პროფილი</p>
          <BaseIcon :size="24" class="text-white" name="account_circle"/>
        </BaseButton>
      </AuthDialog>
    </div>
  </header>
</template>
