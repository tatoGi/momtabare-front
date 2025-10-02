<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue"
import { Input, PasswordInput } from "@/components/ui/input"
import { completeRegistration } from "@/services/auth"
import { ref } from "vue"
import { useField, useForm } from "vee-validate"
import * as yup from "yup"
import { EAuthStep } from "@/ts/auth.types.js"


const emit = defineEmits(["nextStep", "close"])

const props = defineProps<{
  userId: number | null
  verificationCode?: string
}>()

const isLoading = ref<boolean>(false)
const apiError = ref<string>('')
const fieldErrors = ref<Record<string, string>>({})
// const userInfo = reactive({
//   firstName: "",
//   lastName: "",
//   password: "",
//   confirmedPassword: "",
// })

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

async function completeSignUp(): Promise<void> {
  apiError.value = ''
  fieldErrors.value = {}
  isLoading.value = true
  try {
    const response = await completeRegistration({
      user_id: props.userId as number,
      first_name: typeof firstName.value === 'string' ? firstName.value.trim() : '',
      surname: typeof surname.value === 'string' ? surname.value.trim() : '',
      password: typeof password.value === 'string' ? password.value.trim() : '',
      password_confirmation: typeof confirmedPassword.value === 'string' ? confirmedPassword.value.trim() : '',
      verification_code: props.verificationCode || "",
    })

    if (response) {
      // Registration completed successfully, redirect to login page
      emit("nextStep", {
        nextStep: EAuthStep.SIGN_IN
      })
      isLoading.value = false
    }
  } catch (error: any) {
    console.error(error)
    
    // Handle field-specific validation errors
    if (error?.errors) {
      // Map backend field errors to our field names
      const errorMapping: Record<string, string> = {
        first_name: 'firstName',
        surname: 'surname', 
        password: 'password',
        password_confirmation: 'confirmedPassword'
      }
      
      Object.keys(error.errors).forEach(field => {
        const frontendField = errorMapping[field] || field
        const errorMessage = Array.isArray(error.errors[field]) ? error.errors[field][0] : error.errors[field]
        fieldErrors.value[frontendField] = errorMessage
      })
    } else {
      // Fallback to general error message
      apiError.value = error?.message || 'An error occurred. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

const onSubmit = handleSubmit(async (values) => {
  if (!values) return

  await completeSignUp()
})
</script>

<template>
  <form class="flex flex-col" @submit.prevent="onSubmit">
    <h2 class="font-uppercase text-xl font-extrabold dark:text-white">
      პირადი ინფორმაცია
    </h2>
    <div class="flex flex-col gap-5 py-4">
      <div class="flex items-center gap-5">
        <div class="flex flex-col">
          <Input 
            v-model="firstName" 
            placeholder="სახელი" 
            :error="!!firstNameError || !!fieldErrors.firstName"
          />
          <p class="text-xs text-customRed pl-1 pt-0.5 h-3">
            {{ fieldErrors.firstName || firstNameError }}
          </p>
        </div>
        <div class="flex flex-col">
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

    <!-- General API Error -->
    <p v-if="apiError" class="text-sm text-red-500 mt-2 mb-2">

      {{ apiError }}
    </p>

    <BaseButton
      :height="48"
      :loader="isLoading"
      class="mt-2 rounded-full bg-customRed"
    >
      <p class="font-uppercase text-sm font-bold text-white">რეგისტრაცია</p>
    </BaseButton>
  </form>
</template>
