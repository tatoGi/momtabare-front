<script lang="ts" setup>
import img from "@/assets/img/equipment.png"
import helmet from "@/assets/img/helmet.png"
import helmetDark from "@/assets/img/helmetDark.png"
import snowboard from "@/assets/img/snowboard.png"
import snowboardDark from "@/assets/img/snowboardDark.png"
import BaseButton from "@/components/base/BaseButton.vue"
import { useAppStore } from "@/pinia/app.pinia.ts"
import { ref, onMounted, onUnmounted } from "vue"

const appStore = useAppStore()

// Mobile detection
const isMobile = ref(false)

// Props for dynamic content
interface JoinUsProps {
  titleTop?: string
  titleBottom?: string
  descriptions?: string[]
  buttonLabel?: string
  buttonLink?: string
  imageMain?: string
  helmetImage?: string
  snowboardImage?: string
}

const props = defineProps<JoinUsProps>()

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<template>
  <div class="flex flex-col md:flex-row items-center joinUs_Section container">
    <h2 v-if="isMobile" class="text-3xl font-extrabold font-uppercase text-customBlue bottom-title-mobile">
          {{ props.titleBottom }}
        </h2>
    <div class="order-2 md:order-1 flex flex-col relative md:left-10 z-10 mt-8 md:mt-0 px-4 md:px-0 content">
      <div class="flex flex-col">
        <!-- Desktop: Show top title first, then blue title -->
        <h2 v-if="!isMobile" class="text-3xl font-extrabold font-uppercase dark:text-white top-title w-[520px]">
          {{ props.titleTop }}
        </h2>
        
        <h2 v-if="!isMobile" class="text-3xl font-extrabold font-uppercase text-customBlue bottom-title w-[520px]">
          {{ props.titleBottom }}
        </h2>

        <!-- Mobile: Show blue title first, then top title -->
        <h2 v-if="isMobile" class="text-3xl font-extrabold font-uppercase dark:text-white top-title">
          {{ props.titleTop }}
        </h2>
      </div>

      <div class="flex flex-col description">
        <p
          v-for="(d, idx) in (props.descriptions && props.descriptions.length ? props.descriptions : [
            'მომთაბარე ონლაინ პლატფორმაა, სადაც სპორტული ინვენტარის გაქირავებით\nდამატებითი შემოსავლის მიღებას სულ რამდენიმე წუთში შეძლებ.',
            'არ აქვს მნიშვნელობა მცირე ბიზნესის მფლობელი ხარ თუ კერძო\nგამქირავებელი, მომთაბარე სასურველ მომხმარებელს შენსავე ქალაქში\nგაპ്പოვნინებს.',
            'შექმენი მაღაზია ახლავე და დაიწყე დამატებითი შემოსავლის გამომუშავება\nსულ რაღაც 10 წუთში.'
          ])"
          :key="idx"
          class="text-customBlack/80 text-sm font-medium dark:text-white desc-text"
        >
          {{ d }}
        </p>
      </div>

      <BaseButton :height="48" :width="211" class="bg-customBlue join_us_button">
        <p class="text-sm font-bold text-white font-uppercase">{{ props.buttonLabel }}</p>
      </BaseButton>
    </div>
    <div class="order-1 md:order-2 relative md:pr-24 w-full md:w-auto px-4 md:px-0 joinusimg">
      <img :src="props.imageMain ?? img" alt="Sporting Equipment" class="rounded-xl w-full h-auto md:w-auto" />

      <img
        :src="props.helmetImage ?? (appStore.darkMode ? helmetDark : helmet)"
        alt="Helmet"
        class="w-[200px] h-[200px] right-0 top-10 absolute rotate-backward-slowly rotate-slowly"
      />

      <img
        :src="props.snowboardImage ?? (appStore.darkMode ? snowboardDark : snowboard)"
        alt="Skateboard"
        class="w-[200px] h-[200px] right-5 -bottom-14 absolute rotate-slowly rotate-backward-slowly"
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
