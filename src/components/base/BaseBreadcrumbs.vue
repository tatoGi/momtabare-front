<script lang="ts" setup>
import BaseIcon from "@/components/base/BaseIcon.vue"
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()

const props = withDefaults(
  defineProps<{
    path?: string[]
    prependPath?: string
    disableRoute?: boolean
    routeAsQuery?: string
  }>(),
  {
    path: () => [],
  },
)

function goToPrependedRoute() {
  router.push(`/${props.prependPath}`)
}

function goToRoute(index: number): void {
  if (props.disableRoute) return

  if (props.routeAsQuery) {
    router.push({
      path: route.path,
      query: { [props.routeAsQuery]: props.path[index] },
    })
    return
  }

  const prependPath = props.prependPath ? `/${props.prependPath}` : ""
  const fullPath = `${prependPath}/${props.path.slice(0, index + 1).join("/")}`
  router.push(fullPath)
}
</script>

<template>
  <div class="flex h-10 items-center gap-2">
    <BaseIcon
      :size="20"
      class="text-customBlack/70 dark:text-white/70 hover:cursor-pointer hover:text-customRed"
      name="home"
      rounded
      route-to-name="home"
    />
    <div v-if="props.prependPath" class="flex items-center gap-2">
      <p class="text-customBlack/20 dark:text-white/20">/</p>
      <p
        :class="{
          'text-customRed dark:text-customRed': !props?.path?.length,
          'text-customBlack/70 dark:text-white/70': props.path.length,
        }"
        class="text-sm font-semibold hover:cursor-pointer hover:text-customRed"
        @click="goToPrependedRoute"
      >
        {{ props.prependPath }}
      </p>
    </div>
    <template v-for="(item, index) in path" :key="index">
      <p class="text-customBlack/20 dark:text-white/20">/</p>
      <p
        :class="{
          'text-customRed dark:text-customRed': props.path.length - 1 === index,
          'text-customBlack/70 dark:text-white/70':
            props.path.length - 1 !== index,
        }"
        class="text-sm font-semibold hover:cursor-pointer hover:text-customRed"
        @click="goToRoute(index)"
      >
        {{ item.replace(/_/g, " ") }}
      </p>
    </template>
  </div>
</template>

<style scoped></style>
