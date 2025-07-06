<script lang="ts" setup>
import visa from "@/assets/svg/visa.svg"
import mastercard from "@/assets/svg/mastercard.svg"

import BaseIcon from "@/components/base/BaseIcon.vue"
import { computed } from "vue"

const props = defineProps<{
  paymentService: string
  lastNumbers: string
}>()

const creditCardColor = computed<string>(() => {
  switch (props.paymentService) {
    case "visa":
      return "bg-customBlue/10"
    case "mastercard":
      return "bg-customRed/10"
  }
})

const paymentServiceSource = computed<string>(() => {
  switch (props.paymentService) {
    case "visa":
      return visa as string
    case "mastercard":
      return mastercard as string
  }
})

const lastNumbersColor = computed<string>(() => {
  switch (props.paymentService) {
    case "visa":
      return "text-customBlue"
    case "mastercard":
      return "text-customRed"
  }
})
</script>

<template>
  <div
    :class="creditCardColor"
    class="h-36 rounded-2xl flex flex-col justify-between px-6 pt-5 pb-5"
  >
    <div class="flex items-center justify-between">
      <img :alt="paymentService" :src="paymentServiceSource" />
      <BaseIcon :size="24" class="cursor-pointer" name="more_horiz" />
    </div>
    <p :class="lastNumbersColor" class="text-sm font-bold">
      ****{{ lastNumbers }}
    </p>
  </div>
</template>
