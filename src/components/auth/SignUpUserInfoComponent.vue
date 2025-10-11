<script lang="ts" setup>
import { ref } from "vue"
import { useField, useForm } from "vee-validate"
import * as yup from "yup"
import BaseButton from "@/components/base/BaseButton.vue"
import { Input, PasswordInput } from "@/components/ui/input"
import { Alert } from '@/components/ui/alert/'
import { CheckCircle } from "lucide-vue-next"
import { completeRegistration } from "@/services/auth"
import type { ICompleteRegistrationParams } from "@/services/auth.types"
import { EAuthStep } from "@/ts/auth.types.js"

const emit = defineEmits(["nextStep", "close", "registrationSuccess"])

const props = defineProps<{
  userId: number | null
  verificationCode?: string
}>()

const isLoading = ref(false)
const fieldErrors = ref<Record<string, string>>({})
const alertMessage = ref("")
const alertType = ref<"success" | "error" | null>(null)

const { handleSubmit } = useForm({
  validationSchema: yup.object({
    firstName: yup.string().required("სახელი სავალდებულოა"),
    surname: yup.string().nullable().max(255),
    password: yup
      .string()
      .required("პაროლი სავალდებულოა")
      .min(8, "უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს"),
    confirmedPassword: yup
      .string()
      .required("პაროლი სავალდებულოა")
      .oneOf([yup.ref("password")], "პაროლები არ ემთხვევა"),
  }),
})

const { value: firstName, errorMessage: firstNameError } = useField("firstName")
const { value: surname, errorMessage: surnameError } = useField("surname")
const { value: password, errorMessage: passwordError } = useField("password")
const { value: confirmedPassword, errorMessage: confirmedPasswordError } =
  useField("confirmedPassword")

// This function is no longer needed as we moved its logic to onSubmit

const onSubmit = handleSubmit(async () => {
  // Clear previous errors and alerts
  fieldErrors.value = {}
  alertMessage.value = ""
    
  
  // Show loading state
  isLoading.value = true
  
  try {
    if (!props.userId) {
      throw new Error("User ID is missing")
    }
    
    // Prepare registration data
    const registrationData: ICompleteRegistrationParams = {
      user_id: props.userId,
      first_name: String(firstName.value),
      password: String(password.value),
      password_confirmation: String(confirmedPassword.value),
      verification_code: props.verificationCode || ''
    }
    
    if (surname.value) {
      registrationData.surname = String(surname.value)
    }
    
    // Call completeRegistration
    const result = await completeRegistration(registrationData)
    if (result.success) {
      const successPayload = {
        message: result.message || "რეგისტრაცია წარმატებით დასრულდა!",
        user: result.data?.user
      }
      
      // Dispatch global event directly to window
      const event = new CustomEvent('registration-success', {
        detail: successPayload
      })
      
      window.dispatchEvent(event)
      
      // Close the modal immediately
      emit("close")
    } else {
      // Show error message from the response
      alertMessage.value = result.message || "დაფიქსირდა შეცდომა რეგისტრაციის დროს"
      alertType.value = "error"
      
      // If there are field errors, set them
      if (result.data?.errors) {
        fieldErrors.value = result.data.errors
      }
    }

  } catch (error: any) {
    console.error("Registration error:", error)
    
    // Handle field-specific validation errors
    if (error?.errors) {
      const fieldMap: Record<string, string> = {
        first_name: 'firstName',
        surname: 'surname',
        password: 'password',
        password_confirmation: 'confirmedPassword',
      }

      Object.entries(error.errors).forEach(([field, messages]) => {
        const frontendField = fieldMap[field] || field
        fieldErrors.value[frontendField] = Array.isArray(messages) ? messages[0] : messages
      })
    }

    // Show error message
    alertMessage.value = error?.message || "რეგისტრაცია ვერ განხორციელდა. სცადეთ თავიდან."
    alertType.value = "error"
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="flex flex-col gap-4">

    <!-- Error Alert (only for errors, success will be shown on main page) -->
    <div v-if="alertMessage && alertType === 'error'" class="animate-in fade-in-0 slide-in-from-top-2 duration-300">
      <Alert variant="destructive" class="mb-4">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <div>
            <p class="font-medium">{{ alertMessage }}</p>
          </div>
        </div>
      </Alert>
    </div>

    <!-- Registration Form -->
    <form @submit.prevent="onSubmit" class="flex flex-col gap-5">

      <h2 class="uppercase text-xl font-extrabold dark:text-white">პირადი ინფორმაცია</h2>

      <div class="flex flex-col gap-5">

        <!-- Name & Surname -->
        <div class="flex items-center gap-5">
          <div class="flex flex-col w-1/2">
            <Input 
              v-model="firstName" 
              placeholder="სახელი" 
              :error="!!firstNameError || !!fieldErrors.firstName"
            />
            <p class="text-xs text-customRed pl-1 pt-0.5 h-3">
              {{ fieldErrors.firstName || firstNameError }}
            </p>
          </div>
          <div class="flex flex-col w-1/2">
            <Input 
              v-model="surname" 
              placeholder="გვარი" 
              :error="!!surnameError || !!fieldErrors.surname"
            />
            <p class="text-xs text-customRed pl-1 pt-0.5 h-3">
              {{ fieldErrors.surname || surnameError }}
            </p>
          </div>
        </div>

        <!-- Password -->
        <div class="flex flex-col">
          <PasswordInput 
            v-model="password" 
            placeholder="პაროლი" 
            :error="!!passwordError || !!fieldErrors.password"
          />
          <p class="text-xs text-customRed pl-1 pt-0.5 h-3">
            {{ fieldErrors.password || passwordError }}
          </p>
        </div>

        <!-- Confirm Password -->
        <div class="flex flex-col">
          <PasswordInput
            v-model="confirmedPassword"
            placeholder="გაიმეორე პაროლი"
            :error="!!confirmedPasswordError || !!fieldErrors.confirmedPassword"
          />
          <p class="text-xs text-customRed pl-1 pt-0.5 h-3">
            {{ fieldErrors.confirmedPassword || confirmedPasswordError }}
          </p>
        </div>
      </div>

      <BaseButton
        :height="48"
        :loader="isLoading"
        class="mt-2 rounded-full bg-customRed"
      >
        <p class="uppercase text-sm font-bold text-white">რეგისტრაცია</p>
      </BaseButton>

    </form>
  </div>
</template>
