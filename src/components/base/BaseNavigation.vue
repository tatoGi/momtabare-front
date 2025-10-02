<script lang="ts" setup>
import type { INavigationItem } from '@/ts/models/page.types'
import { useRouter } from 'vue-router'

defineOptions({
  name: 'BaseNavigation'
})

const router = useRouter()

defineProps<{
  items: INavigationItem[]
}>()
</script>

<template>
  <nav class="flex gap-6">
    <div 
      v-for="item in items" 
      :key="item.id"
      class="cursor-pointer py-2 hover:text-customRed transition-colors font-medium"
      :class="{ 'text-customRed': router.currentRoute.value.path === item.path }"
      @click="router.push(item.path)"
    >
      {{ item.title }}
    </div>
  </nav>
</template>