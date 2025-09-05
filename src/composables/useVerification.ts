import { ref, computed } from 'vue'
import type { Ref } from 'vue'

interface UseVerificationReturn {
  verificationCode: Ref<string>
  verificationCodeError: Ref<string>
  isLoading: Ref<boolean>
  formattedTime: Ref<string>
  timeLeft: Ref<number>
  startTimer: () => void
  handleCompleteCode: (code: string | string[]) => void
  clearTimer: () => void
}

export function useVerification(): UseVerificationReturn {
  const verificationCode = ref('')
  const verificationCodeError = ref('')
  const isLoading = ref(false)
  const timeLeft = ref(60)
  let intervalId: number | null = null

  const formattedTime = computed(() => {
    const minutes = Math.floor(timeLeft.value / 60)
      .toString()
      .padStart(2, '0')
    const seconds = (timeLeft.value % 60).toString().padStart(2, '0')
    return `${minutes}:${seconds}`
  })

  function startTimer(): void {
    timeLeft.value = 60
    if (intervalId) clearInterval(intervalId)
    
    intervalId = window.setInterval(() => {
      timeLeft.value--
      if (timeLeft.value <= 0 && intervalId) {
        clearInterval(intervalId)
      }
    }, 1000)
  }

  function handleCompleteCode(code: string | string[]): void {
    if (Array.isArray(code)) {
      verificationCode.value = code.join('')
    } else if (typeof code === 'string') {
      verificationCode.value = code
    }
    
    // Clear any previous errors when code changes
    verificationCodeError.value = ''
  }

  function clearTimer(): void {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  return {
    verificationCode,
    verificationCodeError,
    isLoading,
    formattedTime,
    timeLeft,
    startTimer,
    handleCompleteCode,
    clearTimer,
  }
}
