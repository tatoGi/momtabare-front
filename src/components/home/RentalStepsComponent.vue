<script lang="ts" setup>
import img from "@/assets/img/rentalstepsimage.png"
import steps from "@/assets/img/steps.png"
</script>

<template>
  <div class="flex flex-col gap-7 md:flex-row md:items-end container">
    <!-- Title - First on mobile -->
    <div class="md:hidden flex flex-col gap-4">
      <h2 class="text-3xl font-extrabold font-uppercase dark:text-white first-title-rental">
        იქირავე შენთვის სასურველი
      </h2>
      <h2 class="text-3xl font-extrabold font-uppercase dark:text-white second-title-rental">
        აღჭურვილობა <span class="text-customRed">3 მარტივი</span> ნაბიჯით
      </h2>
    </div>

    <!-- Main Image -->
    <img :src="img" alt="Sporting Equipment"
      class="rounded-2xl w-full max-h-[573px] max-w-[464px] object-cover order-1 md:order-none rental-image" />

    <!-- Right Content -->
    <div class="flex flex-col gap-10 order-3 md:order-none content-rental">
      <!-- Title - Hidden on mobile, shown on md+ -->
      <div class="hidden md:block right-20 relative">
        <h2 class="text-3xl font-extrabold font-uppercase dark:text-white">
          იქირავე შენთვის სასურველი
        </h2>
        <h2 class="text-3xl font-extrabold font-uppercase dark:text-white justify-end pl-20">
          აღჭურვილობა <span class="text-customRed">3 მარტივი</span> ნაბიჯით
        </h2>
      </div>

      <!-- Description -->
      <p class="text-sm text-customBlack/80 dark:text-white/80 font-medium rental-description">
        მომთაბარე საშუალებას გაძლევს შენი მომდევნო თავგადასავლისთვის აუცილებელი სპორტული აღჭურვილობა სახლიდან
        გაუსვლელად, სულ რამდენიმე წუთში, პირდაპირ დანიშნულების ადგილას იქირაო.
      </p>

      <!-- Steps Image -->
      <div class="w-full overflow-hidden md:overflow-visible">
        <img :src="steps" alt="steps" class="w-full" />
      </div>
    </div>
  </div>
</template>
