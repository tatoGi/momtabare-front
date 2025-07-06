<script lang="ts" setup>
import { cn } from "@/lib/utils"
import BaseIcon from "@/components/base/BaseIcon.vue"
import { type HTMLAttributes, computed } from "vue"
import {
  SwitchRoot,
  type SwitchRootEmits,
  type SwitchRootProps,
  SwitchThumb,
  useForwardPropsEmits,
} from "radix-vue"

const props = defineProps<
  SwitchRootProps & { class?: HTMLAttributes["class"] }
>()

const emits = defineEmits<SwitchRootEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <SwitchRoot
    :class="
      cn(
        'peer pl-0.5 inline-flex h-10 w-[72px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-customRed data-[state=unchecked]:bg-customGrey',
        props.class,
      )
    "
    v-bind="forwarded"
  >
    <SwitchThumb
      :class="
        cn(
          'flex justify-center items-center pointer-events-none  h-8 w-8 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-8 data-[state=unchecked]:translate-x-0',
        )
      "
      class="dark:bg-customBlack"
    >
      <BaseIcon :size="18" class="dark:text-white" name="dark_mode" />
    </SwitchThumb>
  </SwitchRoot>
</template>
