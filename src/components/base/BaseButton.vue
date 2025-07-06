<script lang="ts" setup>
import { cn } from "@/lib/utils.ts"
import BaseIcon from "@/components/base/BaseIcon.vue"
import type { HTMLAttributes } from "vue"
import { useRouter } from "vue-router"

const props = defineProps<{
  width?: number
  height: number
  icon?: boolean
  routeToName?: string
  routeToPath?: string
  class?: HTMLAttributes["class"]
  loader?: boolean
}>()

const router = useRouter()

function routeTo(): void {
  if (props.routeToName) {
    router.push({ name: props.routeToName })
    return
  }

  if (props.routeToPath) router.push({ path: props.routeToPath })
}
</script>

<template>
  <button
    :class="
      cn(
        'flex-center gap-2 rounded-3xl transition-all hover:bg-opacity-85 cursor-pointer',
        props.class,
      )
    "
    :style="`height: ${props.height}px; width:${props.width}px;`"
    @click="routeTo"
  >
    <slot v-if="!loader" />
    <BaseIcon
      v-if="loader"
      :size="24"
      class="text-white loader"
      name="progress_activity"
    />
  </button>
</template>

<style scoped>
@keyframes rotate360 {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loader {
  animation: rotate360 0.6s linear infinite;
}
</style>
