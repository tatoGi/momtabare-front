<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue"
import { Input, PasswordInput } from "@/components/ui/input"
import { completeRegistration } from "@/services/auth.ts"
import { getUser } from "@/services/user.ts"
import { useUserStore } from "@/pinia/user.pinia.ts"
import { ref } from "vue"
import { useField, useForm } from "vee-validate"
import * as yup from "yup"

const userStore = useUserStore()

const emit = defineEmits(["nextStep", "close"])

const props = defineProps<{
  userId: number | null
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
    lastName: yup.string().required("გვარი სავალდებულოა"),
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
const { value: lastName, errorMessage: lastNameError } = useField("lastName")
const { value: password, errorMessage: passwordError } = useField("password")
const { value: confirmedPassword, errorMessage: confirmedPasswordError } =
  useField("confirmedPassword")

async function completeSignUp(): Promise<void> {
  isLoading.value = true
  try {
    const response = await completeRegistration({
      user_id: props.userId as number,
      first_name: firstName.value.trim(),
      last_name: lastName.value.trim(),
      password: password.value.trim(),
      password_confirmation: confirmedPassword.value.trim(),
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
          <Input v-model="lastName" placeholder="გვარი" />
          <p class="text-xs text-customRed pl-1 pt-0.5 h-3">
            {{ lastNameError }}
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
