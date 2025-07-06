<script lang="ts" setup>
import BaseIcon from "@/components/base/BaseIcon.vue"

defineProps<{
  city: string
  address: string
}>()
</script>

<template>
  <div
    class="h-[140px] border border-customBlack/10 rounded-2xl flex flex-col justify-between px-6 py-6"
  >
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-bold font-uppercase">მისამართი 1</h2>
      <BaseIcon class="cursor-pointer" name="more_horiz" size="24" />
    </div>
    <div class="flex flex-col gap-4">
      <div class="flex justify-between">
        <p class="text-xs font-medium text-customBlack/70">ქალაქი</p>
        <p class="text-xs font-semibold">თბილისი</p>
      </div>
      <div class="flex justify-between">
        <p class="text-xs font-medium text-customBlack/70">მისამართი</p>
        <p class="text-xs font-semibold">წერეთლის გამზირი, 60</p>
      </div>
    </div>
  </div>
</template>
