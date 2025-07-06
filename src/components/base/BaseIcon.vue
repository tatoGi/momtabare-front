<script lang="ts" setup>
import { useRouter } from "vue-router"

const props = defineProps<{
  name: string
  size: number
  fill?: boolean
  rounded?: boolean
  weight?: number
  routeToName?: string
  routeToPath?: string
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
  <i
    :class="rounded ? 'material-symbols-rounded' : 'material-symbols-outlined'"
    :style="`font-size: ${size}px; font-variation-settings: 'FILL' ${fill ? 1 : 0}, 'wght' ${weight ? weight : 400}, 'GRAD' 0, 'opsz' 24;`"
    @click="routeTo"
  >
    {{ name }}
  </i>
</template>
