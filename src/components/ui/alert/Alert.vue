<script lang="ts" setup>
import { cn } from "@/lib/utils"
import { computed } from "vue"

const props = defineProps<{
  variant?: "default" | "destructive" | "success" | "warning"
  class?: string
}>()

const variantClasses = {
  default: "bg-background text-foreground border",
  destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
  success: "border-green-500/50 text-green-600 dark:text-green-400 [&>svg]:text-green-500",
  warning: "border-amber-500/50 text-amber-600 dark:text-amber-400 [&>svg]:text-amber-500"
}

const computedClasses = computed(() => {
  const variant = props.variant || "default"
  return cn(
    "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
    variantClasses[variant as keyof typeof variantClasses],
    props.class
  )
})
</script>

<template>
  <div :class="computedClasses">
    <slot />
  </div>
</template>
