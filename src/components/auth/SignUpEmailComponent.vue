<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue"
import BaseIcon from "@/components/base/BaseIcon.vue"
import {Checkbox} from "@/components/ui/checkbox"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {EAuthStep} from "@/ts/auth.types.js"
import {register} from "@/services/auth.ts"
import {ref} from "vue"
import {useField, useForm} from "vee-validate"
import * as yup from "yup"

const emit = defineEmits(["nextStep"])

const isLoading = ref<boolean>(false)

const {handleSubmit} = useForm({
  validationSchema: yup.object({
    email: yup
        .string()
        .required("ელ.ფოსტა სავალდებულოა")
        .email("შეიყვანეთ ვალიდური ელ.ფოსტა"),
    termsAndConditions: yup
        .boolean()
        .default(false)
        .oneOf([true], "დაეთანხმეთ"),
  }),
})

const {value: email, errorMessage: emailError} = useField("email")
const {
  value: termsAndConditions,
  handleChange,
  errorMessage: termsError,
} = useField("termsAndConditions")

async function sendVerificationCode(): Promise<void> {
  isLoading.value = true
  try {
    const response = await register({
      email: email.value.trim(),
    })

    if (response) {
      const payload = {
        nextStep: EAuthStep.VERIFY_CODE,
        user_id: response.user_id,
        email: email.value.trim(),
      }

      emit("nextStep", payload)
    }
  } catch (error) {
    console.error("Error sending verification code:", error)
  } finally {
    isLoading.value = false
  }
}

const onSubmit = handleSubmit(async (values) => {
  if (!values) return

  await sendVerificationCode()
})
</script>

<template>
  <div class="flex flex-col gap-1">
    <h2 class="font-uppercase text-xl font-extrabold dark:text-white">
      შექმენი ანგარიში
    </h2>
    <p class="text-sm font-medium dark:text-white">
      თუ უკვე გაქვთ ანგარიში, გაიარეთ
      <span class="cursor-pointer text-customRed underline" @click="emit('nextStep', { nextStep: EAuthStep.SIGN_IN })">ავტორიზაცია</span>
    </p>

    <form class="flex flex-col gap-1" @submit.prevent="onSubmit">
      <div class="flex flex-col gap-5 py-4">
        <div class="flex flex-col">
          <Input v-model="email" placeholder="ელ.ფოსტა" type="text"/>
          <p class="text-xs text-customRed pl-1 pt-0.5 h-3">
            {{ emailError }}
          </p>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Checkbox
                id="terms"
                :value="termsAndConditions"
                @update:checked="handleChange"
            />
            <Label class="text-sm font-medium dark:text-white" for="terms">
              ვეთანხმები
              <span class="cursor-pointer text-customBlue underline">
                წესებს და პირობებს
              </span>
            </Label>
          </div>
          <p class="text-customRed text-xs">{{ termsError }}</p>
        </div>
      </div>
      <BaseButton
          :height="48"
          :loader="isLoading"
          class="mt-1 rounded-full bg-customRed w-full"
          @click.left="console.log(termsAndConditions, email)"
      >
        <p class="font-uppercase text-sm font-bold text-white">განაგრძე</p>
      </BaseButton>
    </form>
  </div>

  <div class="relative h-[1px] bg-customBlack/10 dark:bg-white/10 mb-16">
    <div
        class="flex-center absolute-center absolute h-7 w-12 rounded-full bg-customGrey dark:bg-customDarkGrey"
    >
      <p class="font-uppercase text-xs font-medium dark:text-white">ან</p>
    </div>
  </div>

  <div class="flex flex-col gap-4">
    <BaseButton
        :height="48"
        class="border border-customBlack/10 dark:border-white/10 px-6"
        @click.left="
        emit('nextStep', {
          nextStep: EAuthStep.SIGN_UP_PHONE_NUMBER,
        })
      "
    >
      <BaseIcon :size="18" class="dark:text-white" name="smartphone" rounded/>
      <p class="flex-grow text-sm font-medium dark:text-white">
        გააგრძელე მობილურით
      </p>
    </BaseButton>

    <BaseButton
        :height="48"
        class="border border-customBlack/10 dark:border-white/10 px-6"
    >
      <img alt="Facebook" src="../../assets/svg/facebook-colored.svg"/>
      <p class="flex-grow text-sm font-medium dark:text-white">
        გააგრძელე Facebook-ით
      </p>
    </BaseButton>

    <BaseButton
        :height="48"
        class="flex items-center border border-customBlack/10 dark:border-white/10 px-6"
    >
      <img alt="Google" src="../../assets/svg/google-colored.svg"/>
      <p class="flex-grow text-sm font-medium dark:text-white">
        გააგრძელე Google-ით
      </p>
    </BaseButton>
  </div>
</template>
