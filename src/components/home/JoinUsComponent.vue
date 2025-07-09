<script lang="ts" setup>
import img from "@/assets/img/equipment.png"
import helmet from "@/assets/img/helmet.png"
import helmetDark from "@/assets/img/helmetDark.png"
import snowboard from "@/assets/img/snowboard.png"
import snowboardDark from "@/assets/img/snowboardDark.png"
import BaseButton from "@/components/base/BaseButton.vue"
import { useAppStore } from "@/pinia/app.pinia.ts"

const appStore = useAppStore()
</script>

<template>
  <div class="flex items-center joinUs_Section">
    <div class="flex flex-col relative left-10 z-10">
      <div class="flex flex-col">
        <h2 class="text-3xl font-extrabold font-uppercase dark:text-white">
          გამოიმუშავე დამატებითი
        </h2>

        <h2 class="text-3xl font-extrabold font-uppercase text-customBlue">
          შემოსავალი მარტივად
        </h2>
      </div>

      <div class="flex flex-col description">
        <p class="text-customBlack/80 text-sm font-medium dark:text-white">
          მომთაბარე ონლაინ პლატფორმაა, სადაც სპორტული ინვენტარის გაქირავებით
          დამატებითი შემოსავლის მიღებას სულ რამდენიმე წუთში შეძლებ.
        </p>
        <p class="text-customBlack/80 text-sm font-medium dark:text-white">
          არ აქვს მნიშვნელობა მცირე ბიზნესის მფლობელი ხარ თუ კერძო
          გამქირავებელი, მომთაბარე სასურველ მომხმარებელს შენსავე ქალაქში
          გაპოვნინებს.
        </p>
        <p class="text-customBlack/80 text-sm font-medium dark:text-white">
          შექმენი მაღაზია ახლავე და დაიწყე დამატებითი შემოსავლის გამომუშავება
          სულ რაღაც 10 წუთში.
        </p>
      </div>

      <BaseButton :height="48" :width="211" class="bg-customBlue join_us_button">
        <p class="text-sm font-bold text-white font-uppercase">შემოგვიერთდი</p>
      </BaseButton>
    </div>
    <div class="relative pr-24">
      <img :src="img" alt="Sporting Equipment" class="rounded-xl" />

      <img
        :src="appStore.darkMode ? helmetDark : helmet"
        alt="Helmet"
        class="w-[200px] h-[200px] right-0 top-10 absolute rotate-backward-slowly"
      />

      <img
        :src="appStore.darkMode ? snowboardDark : snowboard"
        alt="Skateboard"
        class="w-[200px] h-[200px] right-5 -bottom-14 absolute rotate-slowly"
      />
    </div>
  </div>
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

@keyframes rotate360Reverse {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
}

.rotate-slowly {
  animation: rotate360 12s linear infinite;
}

.rotate-backward-slowly {
  animation: rotate360Reverse 12s linear infinite;
}
</style>
