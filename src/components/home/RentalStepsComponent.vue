<script lang="ts" setup>
import img from "@/assets/img/rentalstepsimage.png"
import steps from "@/assets/img/steps.png"
</script>

<template>
  <div class="flex flex-col items-end gap-7 md:flex-row">
    <img
      :src="img"
      alt="Sporting Equipment"
      class="rounded-2xl w-full max-h-[573px] max-w-[464px] object-cover"
    />

    <div class="flex flex-col gap-10">
      <div>
        <h2 class="text-3xl font-extrabold font-uppercase dark:text-white">
          იქირავე შენთვის სასურველი
        </h2>
        <h2
          class="text-3xl font-extrabold font-uppercase dark:text-white justify-end pl-20"
        >
          აღჭურვილობა <span class="text-customRed">3 მარტივი</span> ნაბიჯით
        </h2>
      </div>

      <p class="text-sm text-customBlack/80 dark:text-white/80 font-medium">
        მომთაბარე საშუალებას გაძლევს შენი მომდევნო თავგადასავლისთვის აუცილებელი
        სპორტული აღჭურვილობა სახლიდან გაუსვლელად, სულ რამდენიმე წუთში, პირდაპირ
        დანიშნულების ადგილას იქირაო.
      </p>

      <img :src="steps" alt="steps" class="max-h-[343px] rounded-2xl" />
    </div>
  </div>
</template>
