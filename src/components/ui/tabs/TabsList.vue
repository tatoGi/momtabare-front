<script lang="ts" setup>
import { cn } from "@/lib/utils"
import { type HTMLAttributes, computed } from "vue"
import { TabsList, type TabsListProps } from "radix-vue"

const props = defineProps<TabsListProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
</script>

<template>
  <TabsList
    :class="
      cn(
        'border border-customBlack/10 dark:border-white/10 py-5 pr-6 rounded-2xl text-muted-foreground',
        props.class,
      )
    "
    v-bind="delegatedProps"
  >
    <slot />
  </TabsList>
</template>
