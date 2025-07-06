<script lang="ts" setup>
import { useFileDialog } from "@vueuse/core"
import BaseButton from "@/components/base/BaseButton.vue"
import { ref } from "vue"

const emits = defineEmits(["file-change"])

const { files, open, reset, onCancel, onChange } = useFileDialog()

const uploadedImage = ref("აირჩიე სურათი...")

onChange((selectedFiles) => {
  if (selectedFiles && selectedFiles.length > 0) {
    emits("file-change", selectedFiles)
    uploadedImage.value = selectedFiles[0].name
  }
})

onCancel(() => {
  uploadedImage.value = "აირჩიე სურათი..."
})
</script>

<template>
  <div
    class="flex w-[452px] items-center justify-between rounded-xl border border-customBlack/10 py-1.5 pl-6 pr-1.5"
  >
    <p class="text-sm font-medium text-customBlack/70 dark:text-white/70">
      {{ uploadedImage }}
    </p>
    <BaseButton
      :height="38"
      class="rounded-lg bg-customBlue px-4 text-sm font-medium text-white"
      @click="open"
    >
      ატვირთე
    </BaseButton>
  </div>
</template>
