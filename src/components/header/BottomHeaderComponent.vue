<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import BaseButton from "@/components/base/BaseButton.vue";
import BaseIcon from "@/components/base/BaseIcon.vue";
import AuthDialog from "@/components/dialogs/AuthDialog.vue";
import HeaderProductMenu from "@/components/header/HeaderProductMenu.vue";
import HeaderSearchComponent from "@/components/header/HeaderSearchComponent.vue";
import { useUserStore } from "@/pinia/user.pinia";
import { useCartStore } from "@/pinia/cart.pinia";
import cartsvg from "@/assets/svg/cart.svg";
import heartsvg from "@/assets/svg/heart.svg";

interface INavItem {
  title: string;
  route: string;
}

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const cartStore = useCartStore();

const navItems: INavItem[] = [
  { title: "მთავარი", route: "/home" },
  { title: "ბლოგი", route: "/blog" },
  { title: "მარშუტები", route: "/routes" },
  { title: "FAQ", route: "/faq" },
];

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
  <header class="bg-white container">
    <!-- Desktop Header -->
    <div class="hidden md:flex flex-row items-center justify-between max-w-7xl  py-2">
      <!-- Categories Dropdown -->
      <div class="dropdown-category">
        <HeaderProductMenu />
      </div>
      
      <!-- Search Bar -->
      <div class="flex-1" :style="{marginLeft: '53px' }">
        <div class="search-header" style="width: 804px; height: 68px; border-radius: 100px; padding-right: 8px;">
          <HeaderSearchComponent />
        </div>
      </div>
      
      <!-- Desktop Icons -->
      <div class="flex items-center gap-6">
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
        
        <div>
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
    </div>
    
    <!-- Mobile Header -->
    <div class="md:hidden flex">
      <!-- Burger Menu -->
      <button @click="$emit('toggleMobileNav')" class="burger-menu">
        <BaseIcon name="menu" :size="24" />
      </button>
      <!-- Icons -->
      <div class="flex items-center">
        <button @click="showMobileSearch = !showMobileSearch" class="p-2  search-button">
          <BaseIcon :name="showMobileSearch ? 'close' : 'search'" :size="20" />
        </button>
        
        <button class="relative p-2 favorite-button" @click="routeToFavorites">
          <img :src="heartsvg" alt="favorites" class="w-5 h-5" />
        </button>
        
        <button class="relative p-2 cart-button" @click="routeToCart">
          <img :src="cartsvg" alt="cart" class="w-5 h-5" />
          <span 
            v-if="cartItems"
            class="absolute -top-1 right-8 bg-customRed text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center"
          >
            {{ cartItems }}
          </span>
        </button>
        <div class="flex items-center user-button">
          <BaseButton
            v-if="user"
            :height="40"
            :width="40"
            class="rounded-full bg-customRed"
            @click.left="router.push('/user')"
          >
            <BaseIcon :size="20" class="text-black" name="account_circle"/>
          </BaseButton>
          
          <AuthDialog v-else>
            <BaseButton :height="40" :width="40" class="rounded-full bg-customRed">
              <BaseIcon :size="20" class="text-black" name="account_circle"/>
            </BaseButton>
          </AuthDialog>
        </div>
      </div>
      
      <!-- Mobile Search Overlay -->
      <div v-if="showMobileSearch" class="fixed inset-0 bg-white z-50 p-4 flex flex-col">
        <div class="flex items-center gap-2 mb-4">
          <HeaderSearchComponent class="flex-1" />
          <button @click="showMobileSearch = false" class="p-2">
            <BaseIcon name="close" :size="24" />
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
