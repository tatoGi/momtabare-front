<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import ProductList from '../../components/products/ProductList.vue';
import BaseNoData from '../../components/base/BaseNoData.vue';
import { useRouter } from 'vue-router';
import { getFavoriteProducts } from '../../services/products';
import BasePagination from '../../components/base/BasePagination.vue';
import BaseBreadcrumbs from '../../components/base/BaseBreadcrumbs.vue';


const router = useRouter()

const favoriteProducts = ref()
const totalPages = ref<number>(1)
const productsTotal = ref<number>(1)
const currentPage = ref<number>(1)
const productsLoading = ref<boolean>(false);
const checkedForEmpty = ref<boolean>(false)

async function fetchProducts(): Promise<void>{
    productsLoading.value = true
    try{
        const response = await getFavoriteProducts({page:currentPage.value});
        if(!response) return

        totalPages.value = response.pagination?.last_page 
        productsTotal.value = response.pagination?.total 
        favoriteProducts.value = response.products
    }catch(error){
        console.log(error)
    }finally{
        productsLoading.value = false
    }
}


watch(currentPage,async ()=>{
    await fetchProducts()

},{immediate:true})

watch(favoriteProducts,async (newVal)=>{
    if(newVal.length === 0 && !checkedForEmpty.value){
        await fetchProducts()
        checkedForEmpty.value = true;
    }
})

</script>


<template>
    <div class="py-5">
        <BaseBreadcrumbs class="pb-5" :path="['რჩეულები']"  prepend-path="ჩემი პროფილი"/>
        <ProductList :loading="productsLoading"  :products="favoriteProducts"/>
        <BaseNoData
            v-if="
            (!productsLoading && favoriteProducts?.length === 0) ||
            (!productsLoading && !favoriteProducts)
          "
            action_title="იხილეთ მთელი პროდუქცია"
            class="py-36"
            description="ამისთვის საჭიროა, დაამატოთ პროდუქტები სიაში"
            title="თქვენ არ გაქვთ ფავორიტი პროდუქტები"
            @action="()=>router.push({name:'products'})"
        />
        <div class="flex-center py-5">
          <BasePagination v-if="totalPages && totalPages > 1" :totalPages="totalPages" v-model="currentPage"/>
        </div>
    </div>
       
</template>


<style scoped>
</style>