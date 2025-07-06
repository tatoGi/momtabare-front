<script lang="ts" setup>
import type { WithClassAsProps } from "./interface";
import { useCarousel } from "./useCarousel";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseIcon from "@/components/base/BaseIcon.vue";

const props = defineProps<WithClassAsProps>();

const { orientation, canScrollPrev, scrollPrev } = useCarousel();
</script>

<template>
  <BaseButton
    :class="props.class"
    :disabled="!canScrollPrev"
    :height="52"
    :width="52"
    class="bg-white rounded-full"
    @click="scrollPrev"
  >
    <BaseIcon
      :rounded="true"
      :size="24"
      class="text-black"
      name="chevron_left"
    />
  </BaseButton>
</template>
