<script lang="ts" setup>
import SignInComponent from "@/components/auth/SignInComponent.vue"
import SignUpEmailComponent from "@/components/auth/SignUpEmailComponent.vue"
import SignUpPhoneNumberComponent from "@/components/auth/SignUpPhoneNumberComponent.vue"
import SignUpUserInfoComponent from "@/components/auth/SignUpUserInfoComponent.vue"
import VerifyCodeComponent from "@/components/auth/VerifyCodeComponent.vue"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { EAuthStep } from "@/ts/auth.types.js"
import { useUserStore } from "../../pinia/user.pinia"
import { computed, ref } from "vue"
import { VisuallyHidden } from "radix-vue"

const step = ref<string>(EAuthStep.SIGN_IN)
const userStore = useUserStore()

const computedIsOpen = computed(() => {
  return userStore.getAuthDialogState
})
const userId = ref<number | null>(null)
const emailOrPhone = ref<string>("")

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
  }, 500)
  closeAuthDialog()
}

function moveToStep(payload): void {
  if (payload.user_id) {
    userId.value = payload.user_id
  }

  if (payload.phone_number) {
    emailOrPhone.value = payload.phone_number
  }

  if (payload.email) {
    emailOrPhone.value = payload.email
  }

  step.value = payload.nextStep
}

function closeAuthDialog(): void {
  userStore.setAuthDialogState(false)
}
</script>

<template>
  <Dialog v-model:open="computedIsOpen">
    <div @click="userStore.setAuthDialogState(true)">
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
        <VerifyCodeComponent
          v-if="step === EAuthStep.VERIFY_CODE"
          :email-or-phone="emailOrPhone"
          :user-id="userId as number"
          @next-step="moveToStep"
        />
        <SignUpUserInfoComponent
          v-if="step === EAuthStep.SIGN_UP_USER_INFO"
          :user-id="userId"
          @close="closeAuthDialog"
        />
      </div>
    </DialogContent>
  </Dialog>
</template>
