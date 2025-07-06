<script lang="ts" setup>
import { cn } from "@/lib/utils"
import BaseIcon from "@/components/base/BaseIcon.vue"
import { type HTMLAttributes, computed } from "vue"
import type { CheckboxRootEmits, CheckboxRootProps } from "radix-vue"
import {
  CheckboxIndicator,
  CheckboxRoot,
  useForwardPropsEmits,
} from "radix-vue"

const props = defineProps<
  CheckboxRootProps & { class?: HTMLAttributes["class"] }
>()
const emits = defineEmits<CheckboxRootEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <CheckboxRoot
    :class="
      cn(
        'peer h-5 w-5 shrink-0 rounded-md bg-customGrey dark:bg-customDarkGrey border border-customBlack/10 dark:border-white/10 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-customRed dark:data-[state=checked]:bg-customRed data-[state=checked]:text-primary-foreground',
        props.class,
      )
    "
    v-bind="forwarded"
  >
    <CheckboxIndicator
      class="flex h-full w-full items-center justify-center text-current"
    >
      <slot>
        <BaseIcon :size="20" class="text-white" name="check"></BaseIcon>
      </slot>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
