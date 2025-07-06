<script lang="ts" setup>
import BaseIcon from "@/components/base/BaseIcon.vue"
import Input from "@/components/ui/input/Input.vue"
import { ref } from "vue"

const password = defineModel()

const passwordVisibility = ref<boolean>(false)
</script>

<template>
  <div class="relative">
    <Input
      v-model="password"
      :type="passwordVisibility ? 'text' : 'password'"
      placeholder="პაროლი"
    />
    <BaseIcon
      :name="passwordVisibility ? 'visibility' : 'visibility_off'"
      :size="24"
      class="text-customBlack/70 dark:text-white/70 absolute top-1/2 -translate-y-1/2 right-6 cursor-pointer"
      @click.left="passwordVisibility = !passwordVisibility"
    />
  </div>
</template>
