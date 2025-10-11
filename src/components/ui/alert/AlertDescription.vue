<script lang="ts" setup>
import { cn } from "@/lib/utils"

defineProps<{
  class?: string
}>()
</script>

<template>
  <div :class="cn('[&_p]:leading-relaxed', $props.class)">
    <slot />
  </div>
</template>
