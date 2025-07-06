<script lang="ts" setup>
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  RangeCalendarCellTrigger,
  type RangeCalendarCellTriggerProps,
  useForwardProps,
} from "radix-vue"
import { computed, type HTMLAttributes } from "vue"

const props = defineProps<
  RangeCalendarCellTriggerProps & { class?: HTMLAttributes["class"] }
>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <RangeCalendarCellTrigger
    :class="
      cn(
        buttonVariants({ variant: 'ghost' }),
        'h-9 w-9 p-0 font-normal data-[selected]:opacity-100',
        '[&[data-today]:not([data-selected])]:bg-customRed/10 [&[data-today]:not([data-selected])]:text-accent-foreground',
        // Selection Start
        'data-[selection-start]:bg-customRed data-[selection-start]:text-primary-foreground data-[selection-start]:hover:bg-customRed data-[selection-start]:hover:text-primary-foreground data-[selection-start]:focus:bg-customRed data-[selection-start]:focus:text-primary-foreground',
        // Selection End
        'data-[selection-end]:bg-customRed data-[selection-end]:text-primary-foreground data-[selection-end]:hover:bg-customRed data-[selection-end]:hover:text-primary-foreground data-[selection-end]:focus:bg-customRed data-[selection-end]:focus:text-primary-foreground',
        // Outside months
        'data-[outside-view]:text-muted-foreground data-[outside-view]:opacity-50 [&[data-outside-view][data-selected]]:bg-customRed/10 [&[data-outside-view][data-selected]]:text-muted-foreground [&[data-outside-view][data-selected]]:opacity-30',
        // Disabled
        'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50',
        // Unavailable
        'data-[unavailable]:text-destructive-foreground data-[unavailable]:line-through',
        props.class,
      )
    "
    v-bind="forwardedProps"
  >
    <slot />
  </RangeCalendarCellTrigger>
</template>
