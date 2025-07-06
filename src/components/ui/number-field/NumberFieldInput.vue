<script lang="ts" setup>
import { cn } from "@/lib/utils"
import type { HTMLAttributes } from "vue"
import { NumberFieldInput } from "radix-vue"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <NumberFieldInput
    :class="
      cn(
        'flex dark:bg-customBlack h-10 w-full rounded-xl border border-customBlack/10 dark:border-white/10 dark:text-white bg-background py-2 text-sm text-center ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
    data-slot="input"
  />
</template>
