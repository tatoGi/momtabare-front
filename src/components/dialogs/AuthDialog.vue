<script lang="ts" setup>
import SignInComponent from "@/components/auth/SignInComponent.vue"
import SignUpEmailComponent from "@/components/auth/SignUpEmailComponent.vue"
import SignUpPhoneNumberComponent from "@/components/auth/SignUpPhoneNumberComponent.vue"
import SignUpUserInfoComponent from "@/components/auth/SignUpUserInfoComponent.vue"
import EmailVerification from "@/components/auth/EmailVerification.vue"
import PhoneVerification from "@/components/auth/PhoneVerification.vue"
// Remove unused imports
// import NewEmailVerification from "@/components/auth/NewEmailVerification.vue"
// import NewPhoneVerification from "@/components/auth/NewPhoneVerification.vue"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { EAuthStep } from "@/ts/auth.types.js"
import type { AuthStepPayload } from "@/ts/auth.types.js"
import { useUserStore } from "../../pinia/user.pinia"
import { computed, ref, watch } from "vue"
import { VisuallyHidden } from "radix-vue"

const step = ref<string>(EAuthStep.SIGN_IN)
const userStore = useUserStore()

const isOpen = computed(() => userStore.authDialog)
const userId = ref<number | null>(null)
const emailOrPhone = ref<string>("")
const verificationCode = ref<string>("")

// Handle body scroll prevention for mobile
watch(isOpen, (newIsOpen: boolean) => {
  if (typeof window !== 'undefined') {
    if (newIsOpen) {
      document.body.classList.add('mobile-nav-open')
    } else {
      document.body.classList.remove('mobile-nav-open')
    }
  }
})

const dialogStyleBySteps = computed<string>(() => {
  const width = step.value === EAuthStep.SIGN_IN ? "w-[809px]" : "w-[451px]"

  const height = (() => {
    switch (step.value) {
      case EAuthStep.SIGN_IN:
        return "h-[544px]"
      case EAuthStep.SIGN_UP_PHONE_NUMBER:
        return "h-[600px]"
      case EAuthStep.SIGN_UP_EMAIL:
        return "h-[615px]"
      case EAuthStep.VERIFY_CODE:
        return "h-[425px]"
      case EAuthStep.SIGN_UP_USER_INFO:
        return "h-[460px]"
      default:
        return ""
    }
  })()

  return `${width} ${height}`
})

function resetAuthSteps() {
  setTimeout(() => {
    step.value = EAuthStep.SIGN_IN
    userId.value = null
    emailOrPhone.value = ""
    verificationCode.value = ""
  }, 500)
}

function moveToStep(payload: AuthStepPayload & { verification_code?: string }): void {
  if (payload.user_id) {
    userId.value = payload.user_id
  }

  if (payload.phone_number) {
    emailOrPhone.value = payload.phone_number
  }

  if (payload.email) {
    emailOrPhone.value = payload.email
  }

  if (payload.verification_code) {
    verificationCode.value = payload.verification_code
  }

  step.value = payload.nextStep
}

const closeAuthDialog = () => {
  userStore.setAuthDialog(false)
  resetAuthSteps()
}

</script>

<template>
  <!-- Mobile Dropdown Overlay -->
  <div class="block lg:hidden">
    <div @click="userStore.setAuthDialog(true)">
      <slot />
    </div>

    <!-- Mobile Auth Overlay -->
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 bg-white dark:bg-customBlack"
      :class="{
        'animate-slide-down': isOpen,
        'animate-slide-up': !isOpen
      }"
    >
      <!-- Close Button -->
      <div class="flex justify-end p-4">
        <button 
          @click="closeAuthDialog"
          class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <svg class="w-6 h-6 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Auth Content -->
      <div class="px-4 pb-4">
        <SignInComponent
          v-if="step === EAuthStep.SIGN_IN"
          @close="closeAuthDialog"
          @next-step="moveToStep"
        />

        <div v-else class="flex flex-col justify-between px-4 pb-9 pt-8">
          <SignUpPhoneNumberComponent
            v-if="step === EAuthStep.SIGN_UP_PHONE_NUMBER"
            @next-step="moveToStep"
          />
          <SignUpEmailComponent
            v-if="step === EAuthStep.SIGN_UP_EMAIL"
            @next-step="moveToStep"
          />
          <EmailVerification
            v-if="step === EAuthStep.VERIFY_EMAIL"
            :show="true"
            :email="emailOrPhone"
            :user-id="userId || 0"
            @next-step="moveToStep"
            @close="closeAuthDialog"
            @back="moveToStep({ nextStep: EAuthStep.SIGN_UP_EMAIL })"
          />
          <PhoneVerification
            v-else-if="step === EAuthStep.VERIFY_PHONE"
            :phone-number="emailOrPhone"
            :user-id="userId || 0"
            @next-step="moveToStep"
            @back="moveToStep({ nextStep: EAuthStep.SIGN_UP_PHONE_NUMBER })"
          />
          <SignUpUserInfoComponent
            v-if="step === EAuthStep.SIGN_UP_USER_INFO"
            :user-id="userId"
            :verification-code="verificationCode"
            @close="closeAuthDialog"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Desktop Modal -->
  <div class="hidden lg:block">
    <Dialog v-model:open="isOpen">
      <div @click="userStore.setAuthDialog(true)">
        <slot />
      </div>

      <DialogContent
        :class="dialogStyleBySteps"
        class="overflow-hidden dark:bg-customBlack"
        @reset-steps="resetAuthSteps"
      >
        <VisuallyHidden>
          <DialogTitle />
          <DialogDescription />
        </VisuallyHidden>

        <SignInComponent
          v-if="step === EAuthStep.SIGN_IN"
          @close="closeAuthDialog"
          @next-step="moveToStep"
        />

        <div v-else class="flex flex-col justify-between px-8 pb-9 pt-20">
          <SignUpPhoneNumberComponent
            v-if="step === EAuthStep.SIGN_UP_PHONE_NUMBER"
            @next-step="moveToStep"
          />
          <SignUpEmailComponent
            v-if="step === EAuthStep.SIGN_UP_EMAIL"
            @next-step="moveToStep"
          />
          <EmailVerification
            v-if="step === EAuthStep.VERIFY_EMAIL"
            :show="true"
            :email="emailOrPhone"
            :user-id="userId || 0"
            @next-step="moveToStep"
            @close="closeAuthDialog"
            @back="moveToStep({ nextStep: EAuthStep.SIGN_UP_EMAIL })"
          />
          <PhoneVerification
            v-else-if="step === EAuthStep.VERIFY_PHONE"
            :phone-number="emailOrPhone"
            :user-id="userId || 0"
            @next-step="moveToStep"
            @back="moveToStep({ nextStep: EAuthStep.SIGN_UP_PHONE_NUMBER })"
          />
          <SignUpUserInfoComponent
            v-if="step === EAuthStep.SIGN_UP_USER_INFO"
            :user-id="userId"
            :verification-code="verificationCode"
            @close="closeAuthDialog"
          />
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
