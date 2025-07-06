<script lang="ts" setup>
import { Skeleton } from "@/components/ui/skeleton"
</script>

<template>
  <div class="flex flex-col space-y-3">
    <Skeleton class="animate-pulse h-[200px] rounded-xl" />
    <div class="space-y-2">
      <Skeleton class="h-4 w-full" />
      <Skeleton class="h-4 w-[200px]" />
      <Skeleton class="h-4 w-[200px]" />
      <Skeleton class="h-4 w-[200px]" />
    </div>
  </div>
</template>

<style scoped></style>
