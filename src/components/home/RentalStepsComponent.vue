<template>
  <!-- Only render component if we have backend data -->
  <div v-if="hasBackendData" class="flex flex-col gap-7 md:flex-row md:items-end container">
    <!-- Title - First on mobile -->
    <div class="md:hidden flex flex-col gap-4">
      <h2 class="text-3xl font-extrabold font-uppercase dark:text-white first-title-rental">
        {{ titleLine1 }}
      </h2>
      <h2 class="text-3xl font-extrabold font-uppercase dark:text-white second-title-rental">
        {{ titleLine2 }}<span class="text-customRed">{{ stepsCount }}</span>
      </h2>
    </div>

    <!-- Main Image -->
    <img :src="imageSource" alt="Sporting Equipment"
      class="rounded-2xl w-full max-h-[573px] max-w-[464px] object-cover order-1 md:order-none rental-image" />

    <!-- Right Content -->
    <div class="flex flex-col gap-10 order-3 md:order-none content-rental">
      <!-- Title - Hidden on mobile, shown on md+ -->
      <div class="hidden md:block right-20 relative">
        <h2 class="text-3xl font-extrabold font-uppercase dark:text-white">
          {{ titleLine1 }}
        </h2>
        <h2 class="text-3xl font-extrabold font-uppercase dark:text-white justify-end pl-20">
          {{ titleLine2 }}<span class="text-customRed">{{ stepsCount }}</span>
        </h2>
      </div>

      <!-- Description -->
      <p class="text-sm text-customBlack/80 dark:text-white/80 font-medium rental-description">
        {{ description }}
      </p>

      <!-- Steps Section - Desktop -->
      <div v-if="steps && steps.length" class="hidden md:block bg-customRed rounded-2xl p-10" style="width: 792px; height: 343px;">
        <div class="flex flex-col gap-6 h-full justify-center">
          <div
            v-for="(s, idx) in steps"
            :key="idx"
            class="flex items-start gap-4"
          >
            <div class="text-white text-4xl font-bold leading-none">{{ idx + 1 }}</div>
            <div class="flex flex-col gap-1">
              <h3 class="text-white text-xl font-bold">{{ s.title }}</h3>
              <p class="text-white text-sm opacity-90">{{ s.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  </div>
  
  <!-- Steps Section - Mobile (Full Width) -->
  <div v-if="hasBackendData && steps && steps.length" class="md:hidden w-full bg-customRed rounded-2xl p-6 mt-6">
    <div class="flex flex-col gap-6">
      <div
        v-for="(s, idx) in steps"
        :key="idx"
        class="flex items-start gap-4"
      >
        <div class="text-white text-3xl font-bold leading-none">{{ idx + 1 }}</div>
        <div class="flex flex-col gap-1">
          <h3 class="text-white text-lg font-bold">{{ s.title }}</h3>
          <p class="text-white text-sm opacity-90">{{ s.text }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

interface StepItem { 
  title: string
  text: string 
}

export default defineComponent({
  name: 'RentalStepsComponent',
  props: {
    titleLine1: {
      type: String,
      default: ''
    },
    titleLine2: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    steps: {
      type: Array as () => StepItem[],
      default: () => []
    },
    imageMain: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isMobile: false
    }
  },
  computed: {
    hasBackendData(): boolean {
      return !!(this.steps && this.steps.length > 0)
    },
    stepsCount(): number {
      return this.steps && this.steps.length ? this.steps.length : 0
    },
    imageSource(): string {
      return this.imageMain || '/img/rentalstepsimage.png'
    }
  },
  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  },
  methods: {
    checkIfMobile() {
      this.isMobile = window.innerWidth < 768
    }
  }
})
</script>