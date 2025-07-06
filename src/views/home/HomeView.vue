<script lang="ts" setup>
import FAQComponent from "@/components/faq/FAQComponent.vue"
import JoinUsComponent from "@/components/home/JoinUsComponent.vue"
import RentalStepsComponent from "@/components/home/RentalStepsComponent.vue"
import CategoriesComponent from "@/components/home/categories/CategoriesComponent.vue"
import SliderComponent from "@/components/home/slider/SliderComponent.vue"
import ProductList from "@/components/products/ProductList.vue"
import {IProductListItem} from "@/ts/models/product.types.js"
import {IGetProductsResponse} from "@/ts/services/products.types.ts"
import {getProducts} from "@/services/products.js"
import {onMounted, ref} from "vue"

const products = ref<IProductListItem[] | null>(null)

onMounted(async () => {
  const allProducts: IGetProductsResponse | null = await getProducts()
  products.value = allProducts?.products.slice(0, 8) ?? []
})
</script>

<template>
  <div class="flex flex-col gap-24 py-11 dark:bg-customBlack">
    <SliderComponent/>
    <CategoriesComponent/>
    <JoinUsComponent/>
    <ProductList
        :products="products"
        :title="$t('popularProduction')"
        class="w-full"
        route-to-name="products"
    />
    <RentalStepsComponent/>
    <!--    <BlogList />-->
    <FAQComponent/>
  </div>
</template>
