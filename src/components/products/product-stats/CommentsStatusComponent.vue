<script lang="ts" setup>
import BaseIcon from "@/components/base/BaseIcon.vue"

const props = defineProps<{
  comments_amount: number
}>()
</script>

<template>
  <div class="flex items-center gap-1">
    <BaseIcon
      :size="16"
      class="transition-all text-customBlack/70 dark:text-white/70"
      name="chat_bubble"
      rounded
    />
    <p class="text-xs font-medium text-customBlack/70 dark:text-white/70 pb-1">
      {{ `${$t('comment')} (${comments_amount})` }}
    </p>
  </div>
</template>

<style scoped></style>
