<script lang="ts" setup>
import { cn } from "@/lib/utils"
import { type HTMLAttributes, computed } from "vue"
import { Minus } from "lucide-vue-next"
import type { NumberFieldDecrementProps } from "radix-vue"
import { NumberFieldDecrement, useForwardProps } from "radix-vue"

const props = defineProps<
  NumberFieldDecrementProps & { class?: HTMLAttributes["class"] }
>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <NumberFieldDecrement
    :class="
      cn(
        'absolute top-1/2 -translate-y-1/2 left-0 p-3 disabled:cursor-not-allowed disabled:opacity-20',
        props.class,
      )
    "
    data-slot="decrement"
    v-bind="forwarded"
  >
    <slot>
      <Minus class="h-4 w-4" />
    </slot>
  </NumberFieldDecrement>
</template>
