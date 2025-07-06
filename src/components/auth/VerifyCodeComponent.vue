<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue"
import BaseIcon from "@/components/base/BaseIcon.vue"
import {
  PinInput,
  PinInputGroup,
  PinInputInput,
} from "@/components/ui/pin-input"
import { EAuthStep } from "@/ts/auth.types.js"
import {
  resendEmailVerificationCode,
  resendPhoneVerificationCode,
  verifyEmail,
  verifyPhone,
} from "@/services/auth.ts"
import { computed, onMounted, onUnmounted, ref } from "vue"

const emit = defineEmits(["nextStep"])

const props = defineProps<{
  userId: number
  emailOrPhone: string
}>()

const verificationCodeArray = ref<string[]>([])
const verificationCode = ref<string>("")
const verificationCodeError = ref<string>("")
const isLoading = ref<boolean>(false)

const timeLeft = ref<number>(60)
let intervalId: number | null = null

const computedMessage = computed<string>(() => {
  return props.emailOrPhone.includes("@")
    ? `თქვენ მიერ მითითებულ ელ.ფოსტაზე ${props.emailOrPhone} გამოგზავნილია კოდი`
    : `თქვენ მიერ მითითებულ ტელეფონის ნომერზე ${props.emailOrPhone} გამოგზავნილია კოდი`
})

const computedChangeMessage = computed(() => {
  return props.emailOrPhone.includes("@") ? `ელ.ფოსტის შეცვლა` : `ნომრის შეცვლა`
})

const formattedTime = computed<string>(() => {
  const minutes = Math.floor(timeLeft.value / 60)
    .toString()
    .padStart(2, "0")
  const seconds = (timeLeft.value % 60).toString().padStart(2, "0")
  return `${minutes}:${seconds}`
})

function startTimer(): void {
  intervalId = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value -= 1
    } else {
      clearInterval(intervalId!)
    }
  }, 1000)
}

function handleCompleteCode(codeArray: string[]): void {
  verificationCode.value = codeArray.join("")
}

async function checkVerificationCode(): Promise<void> {
  try {
    isLoading.value = true
    verificationCodeError.value = ""

    let response

    if (props.emailOrPhone.includes("@")) {
      isLoading.value = true
      response = await verifyEmail({
        user_id: props.userId,
        verification_code: verificationCode.value,
      })
    } else {
      isLoading.value = true
      response = await verifyPhone({
        user_id: props.userId,
        verification_code: verificationCode.value,
      })
    }

    if (response) {
      emit("nextStep", {
        nextStep: EAuthStep.SIGN_UP_USER_INFO,
        user_id: response.user_id,
      })
    }
  } catch (error) {
    console.log(error)
    if (error.includes("The verification code field is required."))
      verificationCodeError.value = "კოდის შევსება სავალდებულოა"
    if (error.includes("Invalid verification code."))
      verificationCodeError.value = "დამადასტურებელი კოდი არასწორია"
    if (error.includes("code has expired"))
      verificationCodeError.value = "დამადასტურებელი კოდის ვადა ამოიწურა"
  } finally {
    isLoading.value = false
  }
}

async function resendCode(): Promise<void> {
  if (!props.userId || timeLeft.value > 0) return

  try {
    if (props.emailOrPhone.includes("@")) {
      await resendEmailVerificationCode({
        user_id: props.userId,
      })
    } else {
      await resendPhoneVerificationCode({
        user_id: props.userId,
      })
    }

    timeLeft.value = 60
    startTimer()
  } catch (error) {
    console.error("Failed to resend code:", error)
  }
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <h2 class="font-uppercase text-xl font-extrabold dark:text-white">
      ვერიფიკაცია
    </h2>
    <p class="text-sm font-medium dark:text-white">
      {{ computedMessage }}
    </p>
    <p
      class="w-fit cursor-pointer text-sm text-customBlue underline transition-all hover:text-customRed"
      @click.left="
        emit('nextStep', {
          nextStep: props.emailOrPhone.includes('@')
            ? EAuthStep.SIGN_UP_EMAIL
            : EAuthStep.SIGN_UP_PHONE_NUMBER,
        })
      "
    >
      {{ computedChangeMessage }}
    </p>

    <div class="flex flex-col gap-5 py-4">
      <div>
        <PinInput
          id="pin-input"
          v-model="verificationCodeArray"
          @complete="handleCompleteCode"
        >
          <PinInputGroup class="gap-2">
            <PinInputInput v-for="(id, index) in 4" :key="id" :index="index" />
          </PinInputGroup>
        </PinInput>
        <p class="text-xs text-customRed pl-1 pt-2 h-5 text-center">
          {{ verificationCodeError }}
        </p>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <BaseIcon :size="24" class="text-customRed" name="timer" />
          <p class="text-sm font-semibold text-customRed">
            {{ formattedTime }} წთ
          </p>
        </div>
        <p
          :class="
            timeLeft > 0
              ? 'text-customBlack/20 dark:text-white/20'
              : 'text-customBlack/70 dark:text-white/70 cursor-pointer'
          "
          class="text-sm font-medium"
          @click.left="resendCode"
        >
          თავიდან გაგზავნა
        </p>
      </div>
    </div>
    <BaseButton
      :height="48"
      :loader="isLoading"
      class="mt-1 rounded-full bg-customRed"
      @click.left="checkVerificationCode"
    >
      <p class="font-uppercase text-sm font-bold text-white">ვერიფიკაცია</p>
    </BaseButton>
  </div>
</template>
