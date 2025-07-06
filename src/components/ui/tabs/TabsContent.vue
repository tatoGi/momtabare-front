<script lang="ts" setup>
import { cn } from "@/lib/utils"
import { type HTMLAttributes, computed } from "vue"
import { TabsContent, type TabsContentProps } from "radix-vue"

const props = defineProps<
  TabsContentProps & { class?: HTMLAttributes["class"] }
>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <TabsContent
    :class="
      cn(
        'p-7 min-h-[220px] text-sm w-full rounded-2xl border border-customBlack/10 dark:border-white/10 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        props.class,
      )
    "
    v-bind="delegatedProps"
  >
    <slot />
  </TabsContent>
</template>
