<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue"

const props = defineProps<{
  title: string
  description: string
  action_title: string
}>()

const emits = defineEmits(["action"])
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <h3 v-if="title" class="font-uppercase text-xl font-extrabold text-black dark:text-white">
      {{ props.title }}
    </h3>
    <p v-if="description" class="font-normal text-black dark:text-white">
      {{ props.description }}
    </p>

    <BaseButton
        v-if="action_title"
        :height="48"
        class="font-uppercase mt-10 flex-shrink border border-black/10 bg-white px-6 text-sm font-bold text-black/70 hover:border-customRed hover:text-customRed"
        @click="emits('action')"
    >
      {{ props.action_title }}
    </BaseButton>
  </div>
</template>

<style scoped></style>
