<script lang="ts" setup>
import { ref } from 'vue';
import TopHeaderComponent from "@/components/header/TopHeaderComponent.vue";
import BottomHeaderComponent from "@/components/header/BottomHeaderComponent.vue";

const isMobileNavOpen = ref(false);

const toggleMobileNav = () => {
  isMobileNavOpen.value = !isMobileNavOpen.value;
};
</script>

<template>
  <div class="flex flex-col gap-7">
    <TopHeaderComponent 
      :is-mobile-nav-open="isMobileNavOpen"
      @toggle-mobile-nav="toggleMobileNav"
    />
    <BottomHeaderComponent @toggle-mobile-nav="toggleMobileNav" />
  </div>
</template>
