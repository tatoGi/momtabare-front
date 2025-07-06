<script lang="ts" setup>
import BaseIcon from "@/components/base/BaseIcon.vue"
import AddressCard from "@/components/user/AddressCard.vue"
</script>

<template>
  <main class="pt-8 pb-20 flex flex-col gap-7">
    <h2 class="text-customBlack text-xl font-extrabold font-uppercase">
      ჩემი მისამართები
    </h2>
    <div class="grid grid-cols-4 gap-7">
      <div
        class="h-[140px] border border-customRed border-dashed rounded-2xl flex-center flex-col cursor-pointer"
      >
        <BaseIcon :size="24" class="text-customRed" name="add" rounded />
        <p class="text-customRed text-sm font-semibold">დაამატე მისამართი</p>
      </div>
      <AddressCard address="წერეთლის გამზირი, 60" city="თბილისი" />
    </div>
  </main>
</template>
