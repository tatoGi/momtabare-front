<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useVerification } from '@/composables/useVerification'
import { verifyPhone } from '@/services/auth'
import { PinInput, PinInputGroup, PinInputInput } from '@/components/ui/pin-input'

const props = defineProps<{
  userId: number
  phoneNumber: string
  countryCode?: string
}>()

const emit = defineEmits<{
  (e: 'nextStep', payload: { nextStep: string; user_id: number }): void
}>()

const { 
  verificationCode, 
  verificationCodeError, 
  isLoading, 
  formattedTime, 
  startTimer, 
  handleCompleteCode, 
  clearTimer 
} = useVerification()

const computedPhoneNumber = props.countryCode ? `+${props.countryCode}${props.phoneNumber}` : props.phoneNumber
const computedMessage = `შეიყვანეთ 6-ნიშნა კოდი, რომელიც გამოგზავნილია ${computedPhoneNumber}-ზე`

async function checkVerificationCode(): Promise<void> {
  try {
    isLoading.value = true
    verificationCodeError.value = ''

    const response = await verifyPhone({
      ...(props.userId > 0 ? { user_id: props.userId } : { identifier: props.phoneNumber }),
      verification_code: verificationCode.value,
    })

    if (response) {
      emit('nextStep', {
        nextStep: 'SIGN_UP_USER_INFO',
        user_id: response.user_id || props.userId,
      })
    }
  } catch (error: any) {
    console.error('Verification error:', error)
    if (error.includes('The verification code field is required.'))
      verificationCodeError.value = 'კოდის შევსება სავალდებულოა'
    if (error.includes('Invalid verification code.'))
      verificationCodeError.value = 'დამადასტურებელი კოდი არასწორია'
    if (error.includes('code has expired'))
      verificationCodeError.value = 'დამადასტურებელი კოდის ვადა ამოიწურა'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  clearTimer()
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <h2 class="text-2xl font-bold dark:text-white">ტელეფონის ნომრის დადასტურება</h2>
    <p class="text-gray-600 dark:text-gray-300">{{ computedMessage }}</p>
    
    <div class="flex flex-col items-center gap-4">
      <PinInput :length="6" @complete="handleCompleteCode">
        <PinInputGroup>
          <PinInputInput v-for="i in 6" :key="i" class="w-12 h-12 text-center" />
        </PinInputGroup>
      </PinInput>
      
      <p v-if="verificationCodeError" class="text-red-500 text-sm">
        {{ verificationCodeError }}
      </p>
      
      <button 
        class="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        :disabled="verificationCode.length !== 6 || isLoading"
        @click="checkVerificationCode"
      >
        {{ isLoading ? 'გთხოვთ მოიცადოთ...' : 'დადასტურება' }}
      </button>
      
      <div class="text-sm text-gray-500">
        <span>კოდის ხელახლა გამოგზავნა: {{ formattedTime }}</span>
      </div>
    </div>
  </div>
</template>
