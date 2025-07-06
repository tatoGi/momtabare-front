<script lang="ts" setup>
import { cn } from "@/lib/utils"
import BaseButton from "@/components/base/BaseButton.vue"
import BaseIcon from "@/components/base/BaseIcon.vue"
import { type HTMLAttributes, computed } from "vue"
import {
  DialogClose,
  DialogContent,
  type DialogContentProps,
  DialogOverlay,
  DialogPortal,
  useForwardPropsEmits,
} from "radix-vue"

const props = defineProps<
  DialogContentProps & { class?: HTMLAttributes["class"] }
>()

const emits = defineEmits(["reset-steps"])

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <DialogPortal>
    <DialogOverlay
      class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      @click.left="emits('reset-steps')"
    />
    <DialogContent
      :class="
        cn(
          'fixed rounded-2xl left-1/2 top-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-customBlack shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          props.class,
        )
      "
      v-bind="forwarded"
    >
      <slot />

      <DialogClose
        class="absolute right-7 top-5 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
      >
        <BaseButton
          :height="48"
          :width="48"
          class="bg-customGrey dark:bg-customDarkGrey"
          @click.left="emits('reset-steps')"
        >
          <BaseIcon :size="24" class="dark:text-white" name="close" rounded />
        </BaseButton>
        <span class="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
