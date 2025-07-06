<script lang="ts" setup>
import { cn } from "@/lib/utils"
import { type HTMLAttributes, computed } from "vue"
import {
  AccordionItem,
  type AccordionItemProps,
  useForwardProps,
} from "radix-vue"

const props = defineProps<
  AccordionItemProps & { class?: HTMLAttributes["class"] }
>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <AccordionItem
    :class="
      cn(
        'border border-customBlack/10 dark:border-white/10 rounded-2xl px-8 py-2',
        props.class,
      )
    "
    v-bind="forwardedProps"
  >
    <slot />
  </AccordionItem>
</template>
