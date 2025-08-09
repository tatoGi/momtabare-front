<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue"
import BaseIcon from "@/components/base/BaseIcon.vue"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EAuthStep } from "@/ts/auth.types.js"
import { countriesPrefix } from "@/constants/countriesPrefix.ts"
import { register } from "@/services/auth.ts"
import { computed, ref } from "vue"
import { useField, useForm } from "vee-validate"
import * as yup from "yup"

const emit = defineEmits(["nextStep"])

const isLoading = ref<boolean>(false)
const countryPrefix = ref<string>("+995")

const { handleSubmit } = useForm({
  validationSchema: yup.object({
    phoneNumber: yup
      .string()
      .required("ტელეფონის ნომერი სავალდებულოა")
      .min(9, "ტელეფონის ნომერი უნდა იყოს მინიმუმ 9 ციფრი"),
    termsAndConditions: yup
      .boolean()
      .default(false)
      .oneOf([true], "დაეთანხმეთ"),
  }),
})

const { value: phoneNumber, errorMessage: phoneError } = useField("phoneNumber")
const {
  value: termsAndConditions,
  handleChange,
  errorMessage: termsError,
} = useField("termsAndConditions")

const fullPhoneNumber = computed<string>(() => {
  return countryPrefix.value + phoneNumber.value
})

async function sendVerificationCode(): Promise<void> {
  isLoading.value = true
  try {
    const response = await register({
      phone_number: phoneNumber.value.trim(),
      country_code: countryPrefix.value.trim(),
    })

    if (response && response.user_id) {
      // Emit the user_id and phone number to parent component for verification step
      emit("nextStep", {
        nextStep: EAuthStep.VERIFY_CODE,
        userId: response.user_id,
        emailOrPhone: fullPhoneNumber.value
      })
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
      <span class="cursor-pointer text-customRed underline">ავტორიზაცია</span>
    </p>

    <div class="flex flex-col gap-5 py-4">
      <div class="flex flex-col gap-1">
        <!--        <Input id="name" v-model="phoneNumber" placeholder="ტელეფონის ნომერი" />-->
        <div
          class="flex h-[52px] items-center rounded-xl border border-customBlack/10 dark:border-white/10 px-5"
        >
          <Select v-model="countryPrefix">
            <SelectTrigger class="w-[70px] border-0 px-0">
              <SelectValue class="dark:text-white" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Countries</SelectLabel>
                <SelectItem
                  v-for="country in countriesPrefix"
                  :value="country.dial_code"
                >
                  {{ country.flag }} {{ country.dial_code }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <div
            class="ml-3 mt-1 h-4 w-[1px] rounded-sm bg-customBlack/20 dark:bg-white/20"
          ></div>
          <Input
            id="name"
            v-model="phoneNumber"
            class="h-[48px] border-0 px-4"
            placeholder="ტელეფონის ნომერი"
          />
        </div>

        <!--        <p class="text-xs text-red-700">-->
        <!--          {{ errors.phone }}-->
        <!--        </p>-->
      </div>

      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <Checkbox 
            id="terms" 
            :checked="termsAndConditions"
            @update:checked="handleChange"
          />
          <Label class="text-sm font-medium dark:text-white" for="terms">
            ვეთანხმები
            <span class="cursor-pointer text-customBlue underline">
              წესებს და პირობებს
            </span>
          </Label>
        </div>
        <p v-if="termsError" class="text-xs text-red-500">{{ termsError }}</p>
      </div>

      <div v-if="phoneError" class="flex flex-col gap-1">
        <p class="text-xs text-red-500">{{ phoneError }}</p>
      </div>
    </div>
    <BaseButton
      :height="48"
      :disabled="isLoading"
      class="mt-1 rounded-full bg-customRed disabled:opacity-50"
      @click.left="onSubmit"
    >
      <p class="font-uppercase text-sm font-bold text-white">
        {{ isLoading ? 'იტვირთება...' : 'განაგრძე' }}
      </p>
    </BaseButton>
  </div>

  <div class="relative h-[1px] bg-customBlack/10 dark:bg-white/10">
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
          nextStep: EAuthStep.SIGN_UP_EMAIL,
        })
      "
    >
      <BaseIcon :size="18" class="dark:text-white" name="mail" rounded />
      <p class="flex-grow text-sm font-medium dark:text-white">
        გააგრძელე Email-ით
      </p>
    </BaseButton>

    <BaseButton
      :height="48"
      class="border border-customBlack/10 dark:border-white/10 px-6"
    >
      <img alt="Facebook" src="../../assets/svg/facebook-colored.svg" />
      <p class="flex-grow text-sm font-medium dark:text-white">
        გააგრძელე Facebook-ით
      </p>
    </BaseButton>

    <BaseButton
      :height="48"
      class="flex items-center border border-customBlack/10 dark:border-white/10 px-6"
    >
      <img alt="Google" src="../../assets/svg/google-colored.svg" />
      <p class="flex-grow text-sm font-medium dark:text-white">
        გააგრძელე Google-ით
      </p>
    </BaseButton>
  </div>
</template>
