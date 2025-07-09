<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import BaseButton from "@/components/base/BaseButton.vue";
import BaseIcon from "@/components/base/BaseIcon.vue";
import AuthDialog from "@/components/dialogs/AuthDialog.vue";
import HeaderProductMenu from "@/components/header/HeaderProductMenu.vue";
import HeaderSearchComponent from "@/components/header/HeaderSearchComponent.vue";
import { useUserStore } from "@/pinia/user.pinia";
import { useCartStore } from "@/pinia/cart.pinia";
import cartsvg from "@/assets/svg/cart.svg";
import heartsvg from "@/assets/svg/heart.svg";

const router = useRouter();
const userStore = useUserStore();
const cartStore = useCartStore();

const showMobileSearch = ref(false);
const user = userStore.user;
const cartItems = ref(cartStore.getCartLength);

function routeToCart(): void {
  if (!userStore.getUser) {
    userStore.setAuthDialogState(true);
    return;
  }
  router.push({ name: "cart" });}

function routeToFavorites(): void {
  if (!userStore.getUser) {
    userStore.setAuthDialogState(true);
    return;
  }
  router.push({ name: "favorite" });
}

// Update cart items when the store changes
cartStore.$subscribe(() => {
  cartItems.value = cartStore.getCartLength;
});
</script>

<template>
  <header class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-0">
    <!-- Categories and Search Section -->
    <div class="w-full flex flex-col md:flex-row items-stretch md:items-center">
      <!-- Categories Dropdown (Desktop) -->
      <div class="hidden md:block ml-[53px]">
        <HeaderProductMenu />
      </div>
      
      <!-- Search Bar -->
      <div class="flex-1" :style="{marginLeft: '53px' }">
        <div class="search-header" style="width: 804px; height: 68px; border-radius: 100px; padding-right: 8px;">
          <HeaderSearchComponent />
        </div>
      </div>
    </div>
    
    <!-- Mobile menu button -->
    <div class="md:hidden flex items-center justify-between">
      <HeaderProductMenu />
      <button @click="showMobileSearch = !showMobileSearch" class="p-2">
        <BaseIcon :name="showMobileSearch ? 'close' : 'search'" :size="24" />
      </button>
    </div>

    <div class="flex items-center justify-between md:justify-end gap-4">
      <!-- Mobile search overlay -->
      <div v-if="showMobileSearch" class="fixed inset-0 bg-white z-50 p-4 flex flex-col">
        <div class="flex items-center gap-2 mb-4">
          <HeaderSearchComponent class="flex-1" />
          <button @click="showMobileSearch = false" class="p-2">
            <BaseIcon name="close" :size="24" />
          </button>
        </div>
        <!-- Categories in mobile search overlay -->
        <div class="mt-4">
          <h3 class="text-lg font-semibold mb-2">Categories</h3>
          <HeaderProductMenu />
        </div>
      </div>

      <button class="relative p-2" @click="routeToFavorites">
        <img :src="heartsvg" alt="favorites" class="w-6 h-6" />
      </button>
      
      <button class="relative p-2" @click="routeToCart">
        <img :src="cartsvg" alt="cart" class="w-6 h-6" />
        <span 
          v-if="cartItems"
          class="absolute -top-1 -right-1 bg-customRed text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
        >
          {{ cartItems }}
        </span>
      </button>

      <div class="hidden md:block">
        <BaseButton
          v-if="user"
          :height="40"
          :width="40"
          class="rounded-full bg-customRed"
          @click.left="router.push('/user')"
        >
          <BaseIcon :size="20" class="text-white" name="account_circle"/>
        </BaseButton>

        <AuthDialog v-else>
          <BaseButton :height="40" :width="40" class="rounded-full bg-customRed">
            <BaseIcon :size="20" class="text-white" name="account_circle"/>
          </BaseButton>
        </AuthDialog>
      </div>
      
      <!-- Mobile profile button -->
      <div class="md:hidden">
        <BaseButton
          v-if="user"
          :height="40"
          :width="40"
          class="rounded-full bg-customRed"
          @click.left="router.push('/user')"
        >
          <BaseIcon :size="20" class="text-white" name="account_circle"/>
        </BaseButton>

        <AuthDialog v-else>
          <BaseButton :height="40" :width="40" class="rounded-full bg-customRed">
            <BaseIcon :size="20" class="text-white" name="account_circle"/>
          </BaseButton>
        </AuthDialog>
      </div>
    </div>
  </header>
</template>
