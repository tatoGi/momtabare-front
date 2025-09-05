<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue"
import { Input, PasswordInput } from "@/components/ui/input"
import { completeRegistration } from "@/services/auth"
import { getUser } from "@/services/user"
import { useUserStore } from "@/pinia/user.pinia"
import { ref } from "vue"
import { useField, useForm } from "vee-validate"
import * as yup from "yup"

const userStore = useUserStore()

const emit = defineEmits(["nextStep", "close"])

const props = defineProps<{
  userId: number | null
  verificationCode?: string
}>()

const isLoading = ref<boolean>(false)

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
  isLoading.value = true
  try {
    const response = await completeRegistration({
      user_id: props.userId as number,
      first_name: firstName.value.trim(),
      surname: surname.value.trim(),
      password: password.value.trim(),
      password_confirmation: confirmedPassword.value.trim(),
      verification_code: props.verificationCode || "",
    })

    if (response) {
      const user = await getUser()
      if (!user) return

      userStore.setUser(user)
      emit("close")
      isLoading.value = false
    }
  } catch (error) {
    console.error(error)
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
          <Input v-model="firstName" placeholder="სახელი" />
          <p class="text-xs text-customRed pl-1 pt-0.5 h-3">
            {{ firstNameError }}
          </p>
        </div>
        <div class="flex flex-col">
          <Input v-model="surname" placeholder="გვარი" />
          <p class="text-xs text-customRed pl-1 pt-0.5 h-3">
            {{ surnameError }}
          </p>
        </div>
      </div>
      <div class="flex flex-col">
        <PasswordInput v-model="password" placeholder="პაროლი" />
        <p class="text-xs text-customRed pl-1 pt-0.5 h-3">
          {{ passwordError }}
        </p>
      </div>
      <div class="flex flex-col">
        <PasswordInput
          v-model="confirmedPassword"
          placeholder="გაიმეორე პაროლი"
        />
        <p class="text-xs text-customRed pl-1 pt-0.5 h-3">
          {{ confirmedPasswordError }}
        </p>
      </div>
    </div>

    <BaseButton
      :height="48"
      :loader="isLoading"
      class="mt-2 rounded-full bg-customRed"
    >
      <p class="font-uppercase text-sm font-bold text-white">რეგისტრაცია</p>
    </BaseButton>
  </form>
</template>
