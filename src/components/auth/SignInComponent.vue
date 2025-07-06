<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue"
import {Input, PasswordInput} from "@/components/ui/input"
import {EAuthStep} from "@/ts/auth.types.js"
import {ISignInParams} from "@/ts/services/auth.types.ts"
import {signIn} from "@/services/auth.ts"
import {getUser} from "@/services/user.ts"
import {useUserStore} from "@/pinia/user.pinia.ts"
import {ref} from "vue"

const userStore = useUserStore()

const emit = defineEmits(["nextStep", "close"])

const isLoading = ref<boolean>(false)

const emailOrPhone = ref<string>("")
const password = ref<string>("")

async function handleSignIn(): Promise<void> {
  try {
    isLoading.value = true
    const payload: ISignInParams = {
      password: password.value,
    }

    if (emailOrPhone.value.includes("@")) {
      payload.email = emailOrPhone.value
    } else {
      payload.phone_number = emailOrPhone.value
    }

    await signIn(payload)

    const user = await getUser()
    if (!user) return

    userStore.setUser(user)
    emit("close")
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex">
    <section
        class="flex w-[45%] flex-col bg-customGrey dark:bg-customDarkGrey px-7 py-9"
    >
      <div class="flex flex-grow flex-col justify-center gap-4 text-center">
        <p class="text-sm font-medium dark:text-white">
          შექმენი ანგარიში, იქირავე ან გააქირავე სალაშქრო და სათხილამურო
          აქსესუარები.
        </p>
        <p class="text-sm font-bold text-customRed">ისიამოვნე ცხოვრებით!</p>
      </div>
      <div class="flex flex-col items-center gap-3">
        <p class="text-sm font-medium dark:text-white">არ გაქვს ანგარიში?</p>
        <BaseButton
            :height="48"
            :width="196"
            class="bg-customBlue"
            @click.left="
            emit('nextStep', { nextStep: EAuthStep.SIGN_UP_EMAIL })
          "
        >
          <p class="font-uppercase text-sm font-bold text-white">
            შექმენი ანგარიში
          </p>
        </BaseButton>
      </div>
    </section>
    <section class="flex w-[55%] flex-col justify-between px-8 pb-9 pt-20">
      <div>
        <h2 class="font-uppercase text-xl font-extrabold dark:text-white">
          ავტორიზაცია
        </h2>

        <form @submit.prevent="handleSignIn">
          <div class="flex flex-col gap-5 py-4">
            <Input v-model="emailOrPhone" placeholder="ელ.ფოსტა ან ტელეფონი"/>
            <PasswordInput v-model="password"/>
          </div>

          <div class="flex items-center justify-between">
            <p
                class="cursor-pointer text-sm text-customBlue underline hover:text-customRed"
            >
              პაროლის აღდგენა
            </p>

            <BaseButton
                :height="48"
                :loader="isLoading"
                :width="112"
                class="mt-1 rounded-full bg-customRed"
            >
              <p class="font-uppercase text-sm font-bold text-white">შესვლა</p>
            </BaseButton>
          </div>
        </form>
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
    </section>
  </div>
</template>
