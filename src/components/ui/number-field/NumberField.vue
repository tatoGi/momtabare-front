<script lang="ts" setup>
import { cn } from "@/lib/utils"
import { type HTMLAttributes, computed } from "vue"
import type { NumberFieldRootEmits, NumberFieldRootProps } from "radix-vue"
import { NumberFieldRoot, useForwardPropsEmits } from "radix-vue"

const props = defineProps<
  NumberFieldRootProps & { class?: HTMLAttributes["class"] }
>()
const emits = defineEmits<NumberFieldRootEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <NumberFieldRoot :class="cn('grid gap-1.5', props.class)" v-bind="forwarded">
    <slot />
  </NumberFieldRoot>
</template>
