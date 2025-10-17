<script lang="ts" setup>
import visa from "@/assets/svg/visa.svg"
import mastercard from "@/assets/svg/mastercard.svg"
import BaseIcon from "@/components/base/BaseIcon.vue"
import { computed, ref } from "vue"

const props = defineProps<{
  cardId: number
  paymentService: string
  lastNumbers: string
  expiryMonth: string
  expiryYear: string
  isDefault?: boolean
  cardHolderName?: string
}>()

const emit = defineEmits<{
  delete: [cardId: number]
  setDefault: [cardId: number]
}>()

const showMenu = ref(false)

const creditCardColor = computed<string>(() => {
  switch (props.paymentService.toLowerCase()) {
    case "visa":
      return "bg-customBlue/10"
    case "mastercard":
      return "bg-customRed/10"
    case "bog":
      return "bg-green-500/10"
    case "amex":
      return "bg-blue-900/10"
    default:
      return "bg-gray-500/10"
  }
})

const paymentServiceSource = computed<string>(() => {
  switch (props.paymentService.toLowerCase()) {
    case "visa":
      return visa as string
    case "mastercard":
      return mastercard as string
    default:
      return "" // You can add more card type logos
  }
})

const lastNumbersColor = computed<string>(() => {
  switch (props.paymentService.toLowerCase()) {
    case "visa":
      return "text-customBlue"
    case "mastercard":
      return "text-customRed"
    case "bog":
      return "text-green-600"
    case "amex":
      return "text-blue-900"
    default:
      return "text-gray-700"
  }
})

const handleDelete = () => {
  showMenu.value = false
  emit('delete', props.cardId)
}

const handleSetDefault = () => {
  showMenu.value = false
  emit('setDefault', props.cardId)
}

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

// Close menu when clicking outside
const closeMenu = () => {
  showMenu.value = false
}
</script>

<template>
  <div
    :class="creditCardColor"
    class="relative h-32 sm:h-40 lg:h-44 rounded-lg sm:rounded-xl lg:rounded-2xl flex flex-col justify-between px-4 sm:px-5 lg:px-6 py-3 sm:py-4 lg:py-5 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer group"
    v-click-outside="closeMenu"
  >
    <!-- Animated gradient overlay on hover -->
    <div class="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    
    <!-- Default badge -->
    <div 
      v-if="isDefault" 
      class="absolute top-2 sm:top-3 left-2 sm:left-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-bold shadow-lg flex items-center gap-1 animate-pulse"
    >
      <BaseIcon :size="12" name="check_circle" class="w-3 h-3 sm:w-4 sm:h-4" />
      მთავარი
    </div>

    <!-- Card chip decoration -->
    <div class="absolute top-10 sm:top-14 left-4 sm:left-6 w-7 sm:w-10 h-6 sm:h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded opacity-60 group-hover:opacity-80 transition-opacity">
      <div class="absolute inset-0 bg-gradient-to-tl from-yellow-600/50 to-transparent rounded"></div>
    </div>

    <!-- Decorative circles -->
    <div class="absolute -right-8 -bottom-8 w-24 sm:w-32 h-24 sm:h-32 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
    <div class="absolute -right-4 top-0 w-16 sm:w-24 h-16 sm:h-24 bg-white/3 rounded-full group-hover:scale-125 transition-transform duration-500"></div>

    <div class="relative flex items-center justify-between z-10">
      <img 
        v-if="paymentServiceSource" 
        :alt="paymentService" 
        :src="paymentServiceSource" 
        class="h-6 sm:h-8 lg:h-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
      />
      <div 
        v-else 
        class="px-2 sm:px-3 py-1 sm:py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg"
      >
        {{ paymentService }}
      </div>
      
      <div class="relative">
        <div class="absolute inset-0 bg-white/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
        <BaseIcon 
          :size="20" 
          class="relative cursor-pointer hover:bg-white/20 rounded-full p-1 sm:p-1.5 transition-all duration-200 transform hover:rotate-90 w-5 h-5 sm:w-6 sm:h-6" 
          name="more_horiz"
          @click.stop="toggleMenu"
        />
        
        <!-- Enhanced Dropdown menu -->
        <div 
          v-if="showMenu"
          class="absolute right-0 top-8 sm:top-10 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-2xl py-1.5 sm:py-2 min-w-[160px] sm:min-w-[180px] z-50 border border-gray-200 dark:border-gray-700 animate-slideDown"
        >
          <button
            v-if="!isDefault"
            @click="handleSetDefault"
            class="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 dark:text-white flex items-center gap-2 sm:gap-3 transition-all duration-200 group/item"
          >
            <div class="flex-center w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-green-100 dark:bg-green-900/30 group-hover/item:scale-110 transition-transform flex-shrink-0">
              <BaseIcon :size="14" name="check_circle" class="text-green-600 dark:text-green-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span class="font-medium whitespace-nowrap">მთავარად დაყენება</span>
          </button>
          <div v-if="!isDefault" class="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
          <button
            @click="handleDelete"
            class="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/20 dark:hover:to-rose-900/20 text-red-600 dark:text-red-400 flex items-center gap-2 sm:gap-3 transition-all duration-200 group/item"
          >
            <div class="flex-center w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-red-100 dark:bg-red-900/30 group-hover/item:scale-110 transition-transform flex-shrink-0">
              <BaseIcon :size="14" name="delete" class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span class="font-medium whitespace-nowrap">წაშლა</span>
          </button>
        </div>
      </div>
    </div>

    <div class="relative flex flex-col gap-1 sm:gap-2 z-10 mt-1 sm:mt-2">
      <p :class="lastNumbersColor" class="text-sm sm:text-base lg:text-base font-bold tracking-wider drop-shadow-lg">
        ****{{ lastNumbers }}
      </p>
      <div class="flex items-center justify-between text-xs opacity-80 gap-1 sm:gap-2">
        <span v-if="cardHolderName" class="dark:text-white font-medium uppercase tracking-wide truncate text-xs sm:text-xs">
          {{ cardHolderName }}
        </span>
        <span class="dark:text-white font-mono font-semibold bg-black/10 px-1.5 sm:px-2 py-0.5 rounded text-xs sm:text-xs flex-shrink-0">
          {{ expiryMonth }}/{{ expiryYear.slice(-2) }}
        </span>
      </div>
    </div>
  </div>
</template>
