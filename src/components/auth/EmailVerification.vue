<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useVerification } from '@/composables/useVerification'
import { EAuthStep } from '@/ts/auth.types.js'
import { verifyCode, resendEmailVerificationCode, register } from '@/services/auth'
import { PinInput, PinInputGroup, PinInputInput } from '@/components/ui/pin-input'

const props = defineProps<{
  userId: number
  email: string
}>()

const emit = defineEmits<{
  (e: 'nextStep', payload: { nextStep: string; user_id: number; verification_code?: string }): void
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

const isResending = ref<boolean>(false)
const pinValues = ref<string[]>(['', '', '', '', '', ''])

const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const pastedData = e.clipboardData?.getData('text/plain') || ''
  const digits = pastedData.replace(/\D/g, '').split('').slice(0, 6) // Get only numbers and limit to 6 digits
  
  if (digits.length > 0) {
    const code = digits.join('')
    // Populate visible inputs
    pinValues.value = [
      digits[0] || '',
      digits[1] || '',
      digits[2] || '',
      digits[3] || '',
      digits[4] || '',
      digits[5] || '',
    ]
    handleCompleteCode(code)
    
    // If we have exactly 6 digits, trigger verification
    if (digits.length === 6) {
      checkVerificationCode()
    }
  }
}

const computedMessage = computed<string>(() => {
  return `თქვენ მიერ მითითებულ ელ.ფოსტაზე ${props.email} გამოგზავნილია კოდი`
})

async function checkVerificationCode(): Promise<void> {
  try {
    isLoading.value = true
    verificationCodeError.value = ""

    const response = await verifyCode({
      ...(props.userId > 0 ? { user_id: props.userId } : { identifier: props.email }),
      verification_code: verificationCode.value,
    })

    if (response) {
      emit("nextStep", {
        nextStep: EAuthStep.SIGN_UP_USER_INFO,
        user_id: response.user_id || props.userId,
        verification_code: verificationCode.value,
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

async function handleResend(): Promise<void> {
  try {
    isResending.value = true
    verificationCodeError.value = ''
    // reset current inputs
    pinValues.value = ['', '', '', '', '', '']
    handleCompleteCode('')
    // Prefer using user_id when available
    if (props.userId && props.userId > 0) {
      await resendEmailVerificationCode({ user_id: props.userId })
    } else {
      // Fallback: trigger register again to resend code to email identifier
      await register({ email: props.email })
    }
    startTimer()
  } catch (error: any) {
    console.error('Resend error:', error)
    verificationCodeError.value = error?.response?.data?.message || 'კოდის ხელახლა გაგზავნა ვერ მოხერხდა'
  } finally {
    isResending.value = false
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
  <div class="flex flex-col gap-6 px-2">
    <div class="flex flex-col gap-2 text-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">ელ.ფოსტის დადასტურება</h2>
      <p class="text-gray-600 dark:text-gray-300">{{ computedMessage }}</p>
    </div>

    <div class="flex flex-col items-center gap-3">
      <PinInput 
        v-model="pinValues"
        :length="6" 
        @complete="handleCompleteCode" 
        @update:modelValue="handleCompleteCode"
        @paste="handlePaste"
      >
        <PinInputGroup class="flex gap-3">
          <PinInputInput 
            v-for="i in 6"
            :key="i"
            :index="i - 1"
            inputmode="numeric"
            pattern="[0-9]*"
            autocomplete="one-time-code"
            class="w-12 h-12 text-xl font-semibold text-center rounded-md border border-gray-200 dark:border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-500/20 bg-white dark:bg-gray-700 dark:text-white transition-colors"
            :class="{ 'border-red-500 ring-2 ring-red-200 dark:ring-red-500/30': verificationCodeError }"
          />
        </PinInputGroup>
      </PinInput>

      <p v-if="verificationCodeError" class="text-red-500 text-sm">
        {{ verificationCodeError }}
      </p>
    </div>

    <button 
      class="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="verificationCode.length !== 6 || isLoading"
      @click="checkVerificationCode"
    >
      {{ isLoading ? 'მიმდინარეობს დამუშავება...' : 'დადასტურება' }}
    </button>

    <div class="text-center">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        <span>კოდის ხელახლა გაგზავნა შესაძლებელი იქნება: </span>
        <span class="font-medium text-gray-700 dark:text-gray-200">{{ formattedTime }}</span>
      </p>
      <button 
        v-if="formattedTime === '00:00'"
        class="text-sm font-medium text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 mt-2 transition-colors disabled:opacity-50"
        :disabled="isResending"
        @click="handleResend"
      >
        {{ isResending ? 'გაგზავნა...' : 'კოდის ხელახლა გაგზავნა' }}
      </button>
    </div>
  </div>
</template>
