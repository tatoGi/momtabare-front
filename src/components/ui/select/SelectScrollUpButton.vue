<script lang="ts" setup>
import { cn } from "@/lib/utils"
import { type HTMLAttributes, computed } from "vue"
import { ChevronUp } from "lucide-vue-next"
import {
  SelectScrollUpButton,
  type SelectScrollUpButtonProps,
  useForwardProps,
} from "radix-vue"

const props = defineProps<
  SelectScrollUpButtonProps & { class?: HTMLAttributes["class"] }
>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <SelectScrollUpButton
    :class="
      cn('flex cursor-default items-center justify-center py-1', props.class)
    "
    v-bind="forwardedProps"
  >
    <slot>
      <ChevronUp class="h-4 w-4" />
    </slot>
  </SelectScrollUpButton>
</template>
