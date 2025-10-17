<script lang="ts" setup>
import ProductItem from "@/components/products/ProductItem.vue"
import ProductItemSkeleton from "@/components/products/ProductItemSkeleton.vue"
import {IProductListItem} from "@/ts/models/product.types.js"

const props = defineProps<{
  title?: string
  routeToName?: string
  routeToPath?: string
  loading?: boolean
  products: IProductListItem[] | null
}>()
</script>

<template>
  <div>
    <div v-if="title" class="flex items-center justify-between pb-4">
      <h2 class="text-3xl font-extrabold font-uppercase dark:text-white product-list-title">
        {{ props.title }}
      </h2>
      <RouterLink 
          v-if="props.routeToName || props.routeToPath"
          :to="props.routeToName ? { name: props.routeToName } : { path: props.routeToPath }"
          class="text-customRed text-sm font-medium underline underline-offset-4 hover:opacity-80 transition-opacity product-list-count"
      >
        {{ $t('allProduct') }}
      </RouterLink>
    </div>
    <transition name="fade">
      <div
          v-if="!props.loading"
          :class="{ 'sm:grid-cols-2 lg:grid-cols-4': props.title, 'sm:grid-cols-2 lg:grid-cols-3': !props.title }"
          class="grid grid-cols-1 gap-3 sm:gap-5"
      >
        <ProductItem
            v-for="product in props.products"
            :key="product.id"
            :item="product"
            :routeToPath="props.routeToPath"
        />
      </div>
      <div
          v-else
          :class="{ 'sm:grid-cols-2 lg:grid-cols-4': props.title, 'sm:grid-cols-2 lg:grid-cols-3': !props.title }"
          class="grid grid-cols-1 gap-3 sm:gap-5"
      >
        <ProductItemSkeleton v-for="i in 8" :key="i"/>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>