<script lang="ts" setup>
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { type HTMLAttributes, computed } from "vue"
import { AlertDialogAction, type AlertDialogActionProps } from "radix-vue"

const props = defineProps<
  AlertDialogActionProps & { class?: HTMLAttributes["class"] }
>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <AlertDialogAction
    :class="
      cn(
        buttonVariants(),
        'bg-customRed px-6 rounded-full h-11 text-xs text-white font-bold font-uppercase',
        props.class,
      )
    "
    v-bind="delegatedProps"
  >
    <slot />
  </AlertDialogAction>
</template>
