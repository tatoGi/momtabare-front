<script lang="ts" setup>
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { type HTMLAttributes, computed } from "vue"
import { AlertDialogCancel, type AlertDialogCancelProps } from "radix-vue"

const props = defineProps<
  AlertDialogCancelProps & { class?: HTMLAttributes["class"] }
>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <AlertDialogCancel
    :class="
      cn(
        buttonVariants({ variant: 'outline' }),
        'mt-2 sm:mt-0 px-6 rounded-full h-11 text-xs text-customBlack/70 font-bold font-uppercase',
        props.class,
      )
    "
    v-bind="delegatedProps"
  >
    <slot />
  </AlertDialogCancel>
</template>
