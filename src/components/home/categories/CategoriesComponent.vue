<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue"
import CategoryItem from "@/components/home/categories/CategoryItem.vue"
import { ICategory } from "@/ts/models/category.types.ts"
import { getCategories } from "@/services/categories.ts"
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"

const categories = ref<ICategory[]>([])
const router = useRouter()

onMounted(async () => {
  const response = await getCategories()
  if (!categories) return

  categories.value = response
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h2
        class="font-uppercase text-3xl font-extrabold text-black dark:text-white"
      >
      {{$t('categories')}}
      </h2>
      <BaseButton
        :height="44"
        :width="111"
        class="bg-customRed"
        @click="router.push({ name: 'products' })"
      >
        <p class="font-uppercase text-xs font-extrabold text-white">{{$t('all')}}</p>
      </BaseButton>
    </div>
    <div
      class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    >
      <CategoryItem
        v-for="category in categories"
        :key="category.id"
        :category="category"
      />
    </div>
  </div>
</template>
