<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue"
import BaseIcon from "@/components/base/BaseIcon.vue"
import type { WithClassAsProps } from "./interface"
import { useCarousel } from "./useCarousel"

const props = defineProps<WithClassAsProps>()

const { orientation, canScrollNext, scrollNext } = useCarousel()

setInterval(() => {
  scrollNext()
}, 4000)
</script>

<template>
  <BaseButton
    :class="props.class"
    :disabled="!canScrollNext"
    :height="52"
    :width="52"
    class="bg-white rounded-full"
    @click="scrollNext"
  >
    <BaseIcon
      :rounded="true"
      :size="24"
      class="text-black"
      name="chevron_right"
    />
  </BaseButton>
</template>
