<script lang="ts" setup>
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { IFAQItem } from "@/ts/components/faq.types.js"

defineProps<{
  FAQItems: IFAQItem[]
}>()
</script>

<template>
  <AccordionItem v-for="item in FAQItems" :key="item.value" :value="item.value">
    <AccordionTrigger
      :icon-name="item.icon"
      arrow-icon="south"
      class="justify-between text-sm font-bold dark:text-white"
    >
      {{ item.title }}
    </AccordionTrigger>
    <AccordionContent>
      {{ item.content }}
    </AccordionContent>
  </AccordionItem>
</template>
