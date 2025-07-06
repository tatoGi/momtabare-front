<script lang="ts" setup>
import BaseIcon from "@/components/base/BaseIcon.vue"
import CreditCard from "@/components/user/CreditCard.vue"
</script>

<template>
  <main class="pt-8 pb-20 flex flex-col gap-7">
    <h2 class="text-customBlack text-xl font-extrabold font-uppercase">
      ჩემი ბარათები
    </h2>
    <div class="grid grid-cols-4 gap-7">
      <div
        class="h-[148px] border border-customRed border-dashed rounded-2xl flex-center flex-col cursor-pointer"
      >
        <BaseIcon :size="24" class="text-customRed" name="add" rounded />
        <p class="text-customRed text-sm font-semibold">დაამატე ბარათი</p>
      </div>
      <CreditCard last-numbers="9073" payment-service="visa" />
      <CreditCard last-numbers="4177" payment-service="mastercard" />
    </div>
  </main>
</template>
